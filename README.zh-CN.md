# 🚀 Nockchain 挖矿节点完整设置指南

**🌐 English Version: [README.md](./README.md)**

这是一个完整的Nockchain节点部署和管理工具包，包含自动化安装脚本、PM2集群配置和监控工具，帮助您轻松地在Ubuntu服务器上搭建和运行Nockchain挖矿节点。

---

## 📌 Nockchain 简介

[Nockchain](https://www.nockchain.org/) 是基于Urbit技术栈的新一代区块链平台，专为运行"Nock"智能合约而设计。其核心特性包括：

- **确定性计算环境**: 基于Hoon和Nock的纯函数式编程
- **轻量级虚拟机**: 高效、安全的智能合约执行层
- **去中心化网络**: 支持分布式节点和挖矿
- **EVM兼容性**: 与以太坊生态系统无缝集成

作为早期项目，您的参与将直接推动网络的去中心化发展。

---

## 🛠️ 完整部署指南

### 第一步：环境准备与节点配置

#### 💻 服务器配置要求

| 配置项       | 最低要求            | 推荐配置              |
| ------------ | ------------------ | -------------------- |
| 操作系统     | Ubuntu 20.04+      | Ubuntu 22.04+ LTS   |
| CPU          | 8 核心              | 16+ 核心             |
| 内存         | 32 GB               | 64 GB+               |
| 存储空间     | 200 GB SSD         | 500 GB+ NVMe SSD     |
| 网络带宽     | 100 Mbps           | 1 Gbps+              |
| IP地址       | 公网IPv4            | 公网IPv4 + IPv6      |

#### ⚙️ 自动化安装脚本

在全新的Ubuntu服务器上执行以下一键安装命令：

```bash
bash <(curl -s https://raw.githubusercontent.com/wenqingyu/nockchain-mining-script/v2/setup-nockchain.sh)
```

**安装过程包括：**

1. **系统依赖安装**
   - 更新包管理器
   - 安装编译工具链 (gcc, make, cmake)
   - 安装网络和加密库
   - 配置开发环境

2. **Rust 工具链安装**
   - 下载并安装最新稳定版Rust
   - 配置cargo包管理器
   - 设置环境变量

3. **Node.js 环境安装**
   - 安装Node.js LTS版本
   - 安装PM2进程管理器
   - 配置npm全局包环境

4. **Nockchain 源码获取**
   - 从官方仓库克隆最新代码到 `~/nockchain`
   - 检出稳定分支
   - 初始化子模块

5. **配置文件下载**
   - 下载 `env.template` 环境变量模板
   - 下载 `ecosystem.config.js` PM2集群配置
   - 下载 `check-blockchain.sh` 区块链检查脚本
   - 安装Node.js依赖（dotenv等）
   - 创建默认的 `.env` 配置文件

6. **核心组件构建**
   - 编译Hoon编译器 (hoonc)
   - 构建区块链节点 (nockchain)
   - 编译钱包工具 (nockchain-wallet)

7. **环境准备**
   - 创建日志目录
   - 设置文件权限

**⚠️ 重要提醒：安装完成后，您的工作目录将是 `~/nockchain`，所有配置文件和后续操作都在该目录中进行。**

#### 🔍 安装验证

安装完成后，验证组件是否正确安装：

```bash
# 检查Rust版本
rustc --version

# 验证Nockchain工具
nockchain --version
nockchain-wallet --version
hoonc --version

# 检查配置文件
ls -la ~/.cargo/bin/nockchain*
cat .env
```

---

### 第二步：密钥生成与环境配置

#### 🔑 创建挖矿钱包

生成新的钱包地址和密钥对：

```bash
# 生成完整的钱包信息
nockchain-wallet keygen

# 输出示例：
# Mnemonic: abandon ability able about above absent absorb abstract absurd abuse access accident
# Private Key: 5J4XJK8QYuXa6Y8Z9b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z
# Public Key: 2qwq9dQRZfpFx8BDicghpMRnYGKZsZGxxhh9m362pzpM9aeo276pR1yHZPS41y3CW3vPKxeYM8p8fzZS8GXmDGzmNNCnVNekjrSYogqfEFMqwhHh5iCjaKPaDTwhupWqiXj6
# Chain Code: 8f7e6d5c4b3a29180f1e2d3c4b5a69787f8e9d0c1b2a39485f6e7d8c9b0a19283
```

#### ⚙️ 环境变量配置

编辑 `.env` 文件，添加您的挖矿公钥：

```bash
# 使用nano或vim编辑配置文件
nano .env

# 修改以下配置项：
MINING_PUBKEY=<复制上面生成的公钥>
RUST_LOG=info,nockchain=debug
RUST_BACKTRACE=1
MINIMAL_LOG_FORMAT=true
```

#### 💾 密钥安全存储

**重要提醒**：请务必安全备份您的钱包信息

```bash
# 创建安全备份目录
mkdir -p ~/nockchain-backup
chmod 700 ~/nockchain-backup

# 保存钱包信息（请用实际值替换）
cat > ~/nockchain-backup/wallet-backup.txt << EOF
生成时间: $(date)
助记词: <your-mnemonic-phrase>
私钥: <your-private-key>
公钥: <your-public-key>
链码: <your-chain-code>
EOF

# 设置严格的文件权限
chmod 600 ~/nockchain-backup/wallet-backup.txt

# 创建备份压缩包
tar -czf ~/nockchain-backup-$(date +%Y%m%d).tar.gz ~/nockchain-backup/
```

---

### 第三步：节点运行与管理

根据您的需求选择合适的运行方式：

#### 方法 1：单节点模式（适合测试）

**直接使用Make命令运行：**

```bash
# 启动单个挖矿节点
make run-nockchain

# 在后台运行（使用screen）
screen -dmS nockchain make run-nockchain

# 查看运行状态
screen -r nockchain
```

**手动编译和运行：**

```bash
# 构建所有组件
make build-hoon-all
make build-rust

# 启动节点
cd miner-node
RUST_BACKTRACE=1 cargo run --release --bin nockchain -- \
  --npc-socket nockchain.sock \
  --mining-pubkey $MINING_PUBKEY \
  --mine
```

#### 方法 2：PM2集群模式（推荐生产环境）

**Node.js和PM2已由安装脚本自动安装，直接开始集群配置：**

**集群配置管理：**

```bash
# 创建日志目录
mkdir -p logs

# 启动完整集群（1主节点 + 3挖矿节点）
pm2 start ecosystem.config.js

# 查看集群状态
pm2 status
pm2 list

# 监控节点性能
pm2 monit

# 查看特定节点日志
pm2 logs nockchain-main
pm2 logs nockchain-miner-1

# 重启特定节点
pm2 restart nockchain-main
pm2 restart nockchain-miner-1

# 停止和删除所有节点
pm2 stop all
pm2 delete all

# 保存PM2配置（开机自启）
pm2 save
pm2 startup
```

**集群架构说明：**

- **主节点** (`nockchain-main`)
  - 处理完整的区块链同步
  - 维护网络连接状态
  - 内存限制：12GB (64GB VPS优化)
  - Socket: `/tmp/nockchain-main.socket`

- **挖矿节点** (`nockchain-miner-1,2,3`)
  - 专注于挖矿计算
  - 轻量级操作模式
  - 内存限制：10GB 每个 (64GB VPS优化)
  - Socket: `/tmp/nockchain-miner-{N}.socket`

#### 🔧 高级配置选项

**自定义PM2配置：**

编辑 `ecosystem.config.js` 文件来调整：

```javascript
// 修改挖矿节点数量
const MINER_COUNT = 5; // 增加到5个挖矿节点

// 调整内存限制 (64GB VPS配置)
const MAIN_NODE_MEMORY = '16G'; // 主节点使用16GB内存
const MINER_NODE_MEMORY = '12G'; // 挖矿节点使用12GB内存

// 修改日志级别
RUST_LOG_MAIN: 'debug,nockchain=trace' // 更详细的日志输出
```

---

### 第四步：区块链状态监控

#### 🔍 自动化监控脚本

使用内置的区块链检查工具：

```bash
# 运行完整的状态检查
./check-blockchain.sh

# 给脚本添加执行权限（如果需要）
chmod +x check-blockchain.sh
```

**脚本功能包括：**
- 检查节点Socket连接状态
- 查询当前区块高度
- 显示钱包余额
- 分析最近的挖矿记录
- 提供实时监控命令

#### 📊 手动查询命令

**基础区块链查询：**

```bash
# 扫描区块链状态
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket scan

# 同步区块链数据
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket sync

# 查询当前区块高度
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket get-height

# 查询网络信息
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket network-info
```

**钱包操作命令：**

```bash
# 更新钱包余额
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket update-balance

# 列出所有钱包地址
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket list-pubkeys

# 查看交易历史
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket list-transactions

# 导出钱包信息
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket export-wallet
```

#### 📈 实时监控与日志分析

**实时日志监控：**

```bash
# 监控主节点活动
tail -f logs/nockchain-main-out.log | grep -E 'block|transaction|height|mining'

# 监控挖矿成功
tail -f logs/nockchain-miner-*.log | grep -i 'mined\|found\|success'

# 监控网络连接
tail -f logs/nockchain-main-out.log | grep -E 'peer|connection|network'

# 监控错误信息
tail -f logs/nockchain-*-error.log
```

**性能统计分析：**

```bash
# 查看挖矿统计
grep -c "mined" logs/nockchain-miner-*.log
grep -c "block found" logs/nockchain-main-out.log

# 分析区块处理速度
grep "processing block" logs/nockchain-main-out.log | tail -20

# 网络延迟分析
grep "ping\|latency" logs/nockchain-main-out.log | tail -10
```

#### 📁 日志文件管理

**日志文件结构：**

```
logs/
├── nockchain-main-out.log      # 主节点输出日志
├── nockchain-main-error.log    # 主节点错误日志
├── nockchain-miner-1-out.log   # 挖矿节点1输出日志
├── nockchain-miner-1-error.log # 挖矿节点1错误日志
├── nockchain-miner-2-out.log   # 挖矿节点2输出日志
├── nockchain-miner-2-error.log # 挖矿节点2错误日志
└── ...
```

**日志轮转配置：**

```bash
# 安装logrotate
sudo apt install logrotate

# 创建日志轮转配置
sudo tee /etc/logrotate.d/nockchain << EOF
/home/$(whoami)/nockchain/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

---

## 🔧 故障排除与优化

### 常见问题解决

#### 节点启动失败

```bash
# 检查端口占用
netstat -tulpn | grep :8080

# 清理socket文件
rm -f /tmp/nockchain-*.socket

# 检查磁盘空间
df -h

# 验证配置文件
cat .env | grep MINING_PUBKEY
```

#### 挖矿效率优化

```bash
# 调整CPU亲和性
taskset -c 0-3 pm2 restart nockchain-miner-1

# 监控系统资源
htop
iotop

# 网络优化
sudo sysctl -w net.core.rmem_max=16777216
sudo sysctl -w net.core.wmem_max=16777216
```

### 性能监控仪表板

创建简单的监控脚本：

```bash
# 创建状态监控脚本
cat > monitor.sh << 'EOF'
#!/bin/bash
while true; do
    clear
    echo "=== Nockchain 节点状态监控 ==="
    echo "时间: $(date)"
    echo
    echo "PM2 状态:"
    pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status) (CPU: \(.monit.cpu)%, Memory: \(.monit.memory))"'
    echo
    echo "Socket 状态:"
    ls -la /tmp/nockchain-*.socket 2>/dev/null || echo "无活动socket"
    echo
    echo "最近挖矿记录:"
    grep -h "mined\|found" logs/nockchain-*.log | tail -5
    echo
    sleep 10
done
EOF

chmod +x monitor.sh
./monitor.sh
```

---

## 🔗 社区资源与支持

### 官方链接

- **项目主页**: [nockchain.org](https://nockchain.org)
- **源代码**: [github.com/zorp-corp/nockchain](https://github.com/zorp-corp/nockchain)
- **技术文档**: [docs.nockchain.org](https://docs.nockchain.org)
- **API参考**: [api.nockchain.org](https://api.nockchain.org)

### 社区讨论

- **Discord服务器**: 获取实时技术支持
- **Telegram群组**: 中文社区讨论
- **Reddit社区**: r/nockchain
- **GitHub Issues**: 技术问题报告

### 开发者资源

- **Hoon编程指南**: 学习Nockchain智能合约开发
- **节点API文档**: 集成节点功能到您的应用
- **测试网络**: 在开发环境中测试您的应用

---

## 🙌 贡献指南

### 如何贡献

1. **Fork本仓库**
2. **创建功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交更改** (`git commit -m 'Add some amazing feature'`)
4. **推送到分支** (`git push origin feature/amazing-feature`)
5. **创建Pull Request**

### 贡献类型

- 🐛 **Bug修复**: 修复安装脚本或配置问题
- ✨ **新功能**: 添加新的监控工具或管理脚本
- 📚 **文档改进**: 完善使用说明或添加示例
- 🔧 **性能优化**: 提升节点运行效率
- 🌐 **国际化**: 添加多语言支持

### 开发环境设置

```bash
# 克隆开发版本
git clone https://github.com/wenqingyu/nockchain-mining-script.git
cd nockchain-mining-script

# 创建开发分支
git checkout -b dev/your-feature

# 测试更改
./setup-nockchain.sh --dry-run
```

---

## 📜 许可证

本项目使用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🚀 快速开始检查清单

- [ ] ✅ 准备Ubuntu服务器（推荐配置）
- [ ] ✅ 运行一键安装脚本
- [ ] ✅ 生成钱包密钥对
- [ ] ✅ 配置环境变量文件
- [ ] ✅ 选择运行模式（Make或PM2）
- [ ] ✅ 启动节点集群
- [ ] ✅ 验证节点状态
- [ ] ✅ 设置监控和日志
- [ ] ✅ 备份钱包信息

**🎉 恭喜！您的Nockchain挖矿节点已经成功运行！**

---

*最后更新：2024年*
*维护者：[wenqingyu](https://github.com/wenqingyu)*
```
