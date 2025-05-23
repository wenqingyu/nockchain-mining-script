# 🚀 Nockchain 快速入门指南

> 5分钟快速启动您的Nockchain挖矿节点

## 📋 准备工作检查单

- [ ] Ubuntu 20.04+ 服务器
- [ ] 16+ 核 CPU，64+ GB 内存
- [ ] 500+ GB NVMe SSD 存储空间
- [ ] 公网IP地址，1Gbps+ 带宽
- [ ] sudo权限（非root用户）

## ⚡ 快速启动步骤

### 步骤1：安装Nockchain

```bash
# 一键安装所有组件
bash <(curl -s https://raw.githubusercontent.com/wenqingyu/nockchain-mining-script/main/setup-nockchain.sh)

# 进入nockchain目录
cd ~/nockchain
```

### 步骤2：生成钱包和配置

```bash
# 生成钱包密钥
nockchain-wallet keygen

# ⚠️ 重要：保存输出的所有信息（助记词、私钥、公钥、链码）

# 复制配置模板
cp env.template .env

# 编辑配置文件，添加生成的公钥
nano .env
# 修改: MINING_PUBKEY=<your-generated-public-key>
```

### 步骤3：启动节点（选择一种方式）

#### 方式A：单节点模式（测试）
```bash
make run-nockchain
```

#### 方式B：PM2集群模式（生产环境推荐）
```bash
# 安装Node.js和PM2
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2

# 创建日志目录并启动集群
mkdir -p logs
pm2 start ecosystem.config.js
```

## 🔄 常用操作

### 查看状态
```bash
# PM2集群状态
pm2 status

# 区块链状态
./check-blockchain.sh

# 钱包余额
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket update-balance
```

### 管理节点
```bash
# 停止所有节点
pm2 stop all

# 重启节点
pm2 restart all

# 查看日志
pm2 logs

# 实时监控
pm2 monit
```

### 查看挖矿进度
```bash
# 查看挖矿日志
tail -f logs/nockchain-miner-*.log | grep -i "mined\|found\|success"

# 监控区块高度
tail -f logs/nockchain-main-out.log | grep -i "height\|block"
```

## 🎯 核心文件

| 文件 | 作用 |
|------|------|
| `.env` | 环境配置（公钥等） |
| `env.template` | 环境变量模板 |
| `ecosystem.config.js` | PM2集群配置 |
| `logs/` | 节点运行日志 |
| `check-blockchain.sh` | 区块链状态检查 |
| `setup-nockchain.sh` | 一键安装脚本 |

## 💾 内存配置（64GB服务器）

推荐的内存分配：
```bash
# .env 文件中的配置
MAIN_NODE_MEMORY=12G      # 主节点
MINER_NODE_MEMORY=10G     # 每个挖矿节点
MINER_COUNT=3             # 挖矿节点数量

# 总内存使用：12G + (10G × 3) = 42GB
# 剩余系统内存：64G - 42G = 22GB
```

## 🆘 故障排除

### 节点启动失败
```bash
# 检查端口占用
netstat -tulpn | grep :8080

# 清理socket文件
rm -f /tmp/nockchain-*.socket

# 检查磁盘空间
df -h

# 查看错误日志
tail -100 logs/nockchain-*-error.log
```

### 挖矿效率低
```bash
# 增加挖矿节点数量
nano .env  # 修改 MINER_COUNT=5
pm2 restart ecosystem.config.js

# 监控系统资源
htop
```

### 网络连接问题
```bash
# 检查网络状态
ping 8.8.8.8

# 检查防火墙
sudo ufw status

# 重启网络服务
sudo systemctl restart networking
```

## 📊 性能优化

### 系统调优
```bash
# 增加文件描述符限制
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# 网络优化
sudo sysctl -w net.core.rmem_max=16777216
sudo sysctl -w net.core.wmem_max=16777216
```

### 挖矿配置优化
```bash
# 调整日志级别（减少I/O）
nano .env
# 修改: RUST_LOG_MINER="warn,nockchain=info"

# 根据服务器性能调整内存
# 32GB服务器: MAIN_NODE_MEMORY=6G, MINER_NODE_MEMORY=5G
# 64GB服务器: MAIN_NODE_MEMORY=12G, MINER_NODE_MEMORY=10G
# 128GB服务器: MAIN_NODE_MEMORY=20G, MINER_NODE_MEMORY=15G
```

## 🔗 有用链接

- **项目主页**: https://nockchain.org
- **官方文档**: https://docs.nockchain.org  
- **GitHub仓库**: https://github.com/zorp-corp/nockchain
- **社区支持**: Discord/Telegram（查看官网获取最新链接）

## 💡 重要提示

1. **钱包安全**: 务必备份助记词和私钥到安全位置
2. **资源监控**: 定期检查CPU/内存/磁盘使用情况
3. **软件更新**: 定期运行 `git pull && make build` 更新
4. **日志管理**: 设置日志轮转防止磁盘满
5. **网络稳定**: 确保网络连接稳定，避免频繁断线

---

**🎉 恭喜！您的Nockchain节点已成功运行！**

按照以上步骤，您可以逐步学习和理解Nockchain节点的部署和管理过程。 