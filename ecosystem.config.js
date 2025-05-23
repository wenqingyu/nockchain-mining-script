// 尝试加载dotenv，如果失败则继续使用环境变量
try {
    require('dotenv').config();
} catch (e) {
    console.log('dotenv not found, using environment variables directly');
}

/**
 * PM2集群配置文件 - Nockchain挖矿节点
 * PM2 Cluster Configuration for Nockchain Mining Nodes
 * 
 * 基于Makefile的run-nockchain目标，支持：
 * - 主节点：完整区块链同步和网络通信
 * - 挖矿节点：专用挖矿实例，提高挖矿效率
 * - 日志管理：分离的输出和错误日志
 * - 自动重启：内存限制和错误重启策略
 */

// 从.env中获取配置参数
const MINING_PUBKEY = process.env.MINING_PUBKEY || '2pk5QGVD9WBcUDC4nX4RRXj28TYD3y5HScJfhFziD3SWjFf4r1eG8xSM2mxFU8mWAsLrrreZ1FrfmrsGAA6c5VKMV4C3XFJy3wUvGPBJ4B9rzLnsbCrJL8ZvqPLcpFV4ZgHT';

// 可配置参数
const MINER_COUNT = parseInt(process.env.MINER_COUNT) || 3; // 挖矿节点数量
const MAIN_NODE_MEMORY = process.env.MAIN_NODE_MEMORY || '12G'; // 主节点内存限制 (64GB VPS推荐)
const MINER_NODE_MEMORY = process.env.MINER_NODE_MEMORY || '10G'; // 挖矿节点内存限制 (64GB VPS推荐)

// 日志配置
const RUST_LOG_MAIN = process.env.RUST_LOG_MAIN || 'info,nockchain=debug,nockchain_libp2p_io=info';
const RUST_LOG_MINER = process.env.RUST_LOG_MINER || 'info,nockchain=info';

// 确保日志目录存在
const fs = require('fs');
if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs', { recursive: true });
}

/**
 * 创建主节点配置
 * 主节点负责：
 * - 完整的区块链同步
 * - 网络P2P通信
 * - 交易广播和验证
 * - 为挖矿节点提供区块链数据
 */
const createMainNodeConfig = () => {
    const minerDir = 'miner-node-main';
    const socketPath = '/tmp/nockchain-main.socket';
    
    // 构建启动命令
    const command = `mkdir -p ${minerDir} && cd ${minerDir} && rm -f ${socketPath} && \
RUST_BACKTRACE=1 RUST_LOG="${RUST_LOG_MAIN}" MINIMAL_LOG_FORMAT=true \
make -C .. run-nockchain MINING_PUBKEY=${MINING_PUBKEY} -- --npc-socket ${socketPath}`;

    return {
        name: 'nockchain-main',
        script: 'bash',
        args: ['-c', command],
        interpreter: 'none',
        cwd: process.cwd(),
        
        // 日志配置
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        error_file: 'logs/nockchain-main-error.log',
        out_file: 'logs/nockchain-main-out.log',
        merge_logs: true,
        time: true,
        
        // 性能和重启配置
        max_memory_restart: MAIN_NODE_MEMORY,
        max_restarts: 10,
        min_uptime: '30s',
        
        // 环境变量
        env: {
            NODE_ENV: 'production',
            RUST_BACKTRACE: '1',
            RUST_LOG: RUST_LOG_MAIN,
            MINIMAL_LOG_FORMAT: 'true',
            MINING_PUBKEY: MINING_PUBKEY
        },
        
        // 高级配置
        kill_timeout: 5000,
        listen_timeout: 3000,
        
        // 健康检查（如果需要）
        // health_check_url: 'http://localhost:8080/health',
        // health_check_grace_period: 3000
    };
};

/**
 * 创建挖矿节点配置
 * 挖矿节点负责：
 * - 专注于挖矿计算
 * - 连接到主节点获取数据
 * - 轻量级操作，减少资源消耗
 */
const createMinerConfig = (minerNumber) => {
    const minerDir = `miner-node-${minerNumber}`;
    const socketPath = `/tmp/nockchain-miner-${minerNumber}.socket`;
    
    // 为每个挖矿节点分配不同的端口（如果需要）
    const basePort = 8080;
    const minerPort = basePort + minerNumber;
    
    const command = `mkdir -p ${minerDir} && cd ${minerDir} && rm -f ${socketPath} && \
RUST_BACKTRACE=1 RUST_LOG="${RUST_LOG_MINER}" MINIMAL_LOG_FORMAT=true \
make -C .. run-nockchain MINING_PUBKEY=${MINING_PUBKEY} -- --npc-socket ${socketPath}`;

    return {
        name: `nockchain-miner-${minerNumber}`,
        script: 'bash',
        args: ['-c', command],
        interpreter: 'none',
        cwd: process.cwd(),
        
        // 日志配置
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        error_file: `logs/nockchain-miner-${minerNumber}-error.log`,
        out_file: `logs/nockchain-miner-${minerNumber}-out.log`,
        merge_logs: true,
        time: true,
        
        // 性能配置
        exec_mode: 'fork',
        max_memory_restart: MINER_NODE_MEMORY,
        max_restarts: 15,
        min_uptime: '20s',
        
        // 环境变量
        env: {
            NODE_ENV: 'production',
            RUST_BACKTRACE: '1',
            RUST_LOG: RUST_LOG_MINER,
            MINIMAL_LOG_FORMAT: 'true',
            MINING_PUBKEY: MINING_PUBKEY,
            MINER_ID: minerNumber,
            MINER_PORT: minerPort
        },
        
        // 重启策略
        restart_delay: 1000 * minerNumber, // 错开重启时间
        kill_timeout: 3000,
        listen_timeout: 2000,
        
        // 自动扩展选项
        instances: 1,
        
        // 监控配置
        pmx: false // 禁用PMX监控以减少资源使用
    };
};

/**
 * 创建监控节点配置（可选）
 * 用于监控整个集群的运行状态
 */
const createMonitorConfig = () => {
    return {
        name: 'nockchain-monitor',
        script: 'bash',
        args: ['-c', './check-blockchain.sh && sleep 300'], // 每5分钟检查一次
        interpreter: 'none',
        cwd: process.cwd(),
        
        // 日志配置
        error_file: 'logs/nockchain-monitor-error.log',
        out_file: 'logs/nockchain-monitor-out.log',
        merge_logs: true,
        time: true,
        
        // 定时执行
        cron_restart: '*/5 * * * *', // 每5分钟执行一次
        
        // 性能配置
        max_memory_restart: '100M',
        max_restarts: 3,
        
        // 环境变量
        env: {
            NODE_ENV: 'production'
        },
        
        // 不自动重启（因为是定时任务）
        autorestart: false
    };
};

// 构建应用配置数组
const apps = [];

// 添加主节点
apps.push(createMainNodeConfig());

// 添加挖矿节点
for (let i = 1; i <= MINER_COUNT; i++) {
    apps.push(createMinerConfig(i));
}

// 可选：添加监控节点（默认不启用）
if (process.env.ENABLE_MONITOR === 'true') {
    apps.push(createMonitorConfig());
}

// PM2部署配置（用于远程部署）
const deploy = {
    production: {
        user: process.env.DEPLOY_USER || 'ubuntu',
        host: process.env.DEPLOY_HOST || 'localhost',
        ref: 'origin/main',
        repo: 'https://github.com/wenqingyu/nockchain-mining-script.git',
        path: process.env.DEPLOY_PATH || '/home/ubuntu/nockchain',
        'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
};

// 导出配置
module.exports = {
    apps,
    deploy
};

// 配置验证和调试信息
if (process.env.DEBUG_PM2_CONFIG === 'true') {
    console.log('PM2 Configuration Debug Info:');
    console.log('============================');
    console.log(`Mining Public Key: ${MINING_PUBKEY.substring(0, 20)}...`);
    console.log(`Miner Count: ${MINER_COUNT}`);
    console.log(`Main Node Memory Limit: ${MAIN_NODE_MEMORY}`);
    console.log(`Miner Node Memory Limit: ${MINER_NODE_MEMORY}`);
    console.log(`Main Node Log Level: ${RUST_LOG_MAIN}`);
    console.log(`Miner Node Log Level: ${RUST_LOG_MINER}`);
    console.log(`Total Applications: ${apps.length}`);
    console.log('============================');
} 