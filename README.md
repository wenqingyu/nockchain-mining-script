# 🚀 Nockchain Mining 节点设置指南

**🌐 简体中文指南：[README.zh-CN.md](./README.zh-CN.md)**

这个仓库包含完整的自动化脚本，用于在Ubuntu服务器上安装和配置Nockchain节点和钱包，完美适合快速开始挖矿或运行网络节点。

---

## 📌 什么是 Nockchain？

[Nockchain](https://www.nockchain.org/) 是下一代区块链基础设施，专为运行"Nock"智能合约而优化。它结合了Urbit和EVM兼容逻辑的原理，提供：

- 去中心化的代理执行环境
- 使用Hoon和Nock的确定性计算
- 紧凑且安全的创新VM层

Nockchain仍处于早期阶段，通过运行节点或参与挖矿，您正在帮助去中心化和发展网络。

---

## 🛠️ 步骤指南

按照以下步骤完成Nockchain节点的完整设置：

### 步骤 1: 配置节点环境

#### 💻 推荐的VPS配置
| 资源     | 最低要求                | 推荐配置                |
| -------- | ---------------------- | ---------------------- |
| 操作系统  | Ubuntu 20.04+ (64-bit) | Ubuntu 22.04+ LTS     |
| CPU      | 8 vCPUs                | 16+ vCPUs              |
| 内存     | 32 GB                  | 64+ GB                 |
| 磁盘     | 200 GB SSD            | 500+ GB NVMe SSD       |
| 网络     | 需要公网IPv4            | 1Gbps+ 带宽            |

#### ⚙️ 一键安装脚本

在新的Ubuntu VPS上运行以下命令完成所有安装：

```bash
bash <(curl -s https://raw.githubusercontent.com/wenqingyu/nockchain-mining-script/v2/setup-nockchain.sh)
```

这个脚本将会：
1. 安装系统依赖
2. 安装Rust (stable)
3. 安装Node.js LTS和PM2
4. 克隆官方Nockchain仓库到 `~/nockchain`
5. 下载所有必要的配置文件到 `~/nockchain` 目录：
   - `env.template` - 环境变量模板
   - `ecosystem.config.js` - PM2集群配置
   - `check-blockchain.sh` - 区块链状态检查脚本
6. 安装Node.js依赖（dotenv等）
7. 创建默认的 `.env` 配置文件
8. 构建并安装所有必要组件 (hoonc, wallet, node)
9. 创建日志目录

**⚠️ 重要：安装完成后，您的工作目录将是 `~/nockchain`，所有后续操作都在该目录中进行。**

---

### 步骤 2: 配置变量（公钥设置）

#### 🔑 生成钱包助记词和公私钥对

切换到nockchain目录：

```bash
cd ~/nockchain
```

使用以下命令生成新钱包，包括：
- 助记词种子短语
- 私钥/公钥对
- 链码

```bash
# 生成钱包（包含助记词、密钥和链码）
nockchain-wallet keygen
```

这将在控制台打印新的密钥对、助记词和链码。

**⚠️ 重要：请安全保存输出的所有信息！**

#### ⚙️ 配置环境变量

复制环境变量模板并配置您的挖矿公钥：

```bash
# 复制环境变量模板
cp env.template .env

# 编辑配置文件
nano .env
```

在.env文件中找到`MINING_PUBKEY`行，将其替换为上一步生成的公钥：

```bash
MINING_PUBKEY=<your-generated-public-key>
```

对于64GB内存的服务器，推荐的内存配置已经预设：
- 主节点: 12GB
- 挖矿节点: 每个10GB (3个节点总共30GB)

---

### 步骤 3: 运行节点

选择以下两种方式之一运行您的Nockchain节点：

#### 方法 1: 使用 Make 命令直接运行

```bash
make run-nockchain
```

这个命令会：
- 创建挖矿节点目录
- 使用您配置的公钥启动节点
- 启用挖矿模式

#### 方法 2: 使用 PM2 集群运行（推荐生产环境）

首先安装Node.js和PM2：

```bash
# 安装Node.js LTS版本
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2
npm install -g pm2
```

然后启动集群：

```bash
# 创建日志目录
mkdir -p logs

# 启动所有节点（1个主节点 + 3个挖矿节点）
pm2 start ecosystem.config.js

# 查看所有节点状态
pm2 status

# 查看日志
pm2 logs

# 查看实时监控
pm2 monit
```

管理PM2集群：

```bash
# 停止所有节点
pm2 stop all

# 重启所有节点
pm2 restart all

# 删除所有节点
pm2 delete all

# 保存PM2配置（开机自启）
pm2 save
pm2 startup
```

PM2集群配置包括：
- **主节点**: 完整网络同步节点，处理主要的区块链通信 (内存限制: 12GB)
- **挖矿节点**: 3个专用挖矿实例，提高挖矿效率 (每个内存限制: 10GB)

---

### 步骤 4: 查看区块链信息

#### 🔍 使用自动化检查脚本

运行区块链状态检查工具：

```bash
./check-blockchain.sh
```

这个脚本会：
- 检查节点连接状态
- 查询钱包余额
- 显示最近的区块和交易记录
- 提供实时监控命令

#### 📊 手动查询命令

```bash
# 扫描区块链状态
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket scan

# 更新钱包余额
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket update-balance

# 列出所有公钥
nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket list-pubkeys

# 实时监控区块和交易
tail -f logs/nockchain-main-out.log | grep -a -i -E 'block|transaction|height'
```

#### �� 日志文件位置

- 主节点日志: `logs/nockchain-main-out.log`
- 挖矿节点日志: `logs/nockchain-miner-{1-3}-out.log`
- 错误日志: `logs/nockchain-*-error.log`

---

## 🔧 高级配置

### 环境变量说明

在`.env`文件中，您可以配置以下变量：

```bash
# 基础配置
MINING_PUBKEY=<your-mining-public-key>
RUST_LOG=info,nockchain=info
RUST_BACKTRACE=1
MINIMAL_LOG_FORMAT=true

# 集群配置 (64GB服务器推荐)
MINER_COUNT=3
MAIN_NODE_MEMORY=12G
MINER_NODE_MEMORY=10G
```

### 性能调优

编辑`ecosystem.config.js`来调整：
- 挖矿节点数量 (`MINER_COUNT`)
- 内存限制 (`MAIN_NODE_MEMORY`, `MINER_NODE_MEMORY`)
- 日志级别 (`RUST_LOG_MAIN`, `RUST_LOG_MINER`)
- Socket路径

### 内存使用计算

对于64GB内存服务器的推荐配置：
- 主节点: 12GB
- 3个挖矿节点: 3 × 10GB = 30GB
- 系统和其他进程: ~22GB
- **总计**: 64GB

---

## 🔗 资源链接

- **官方网站**: [nockchain.org](https://nockchain.org)
- **官方仓库**: [github.com/zorp-corp/nockchain](https://github.com/zorp-corp/nockchain)
- **社区讨论**: Discord/Telegram (检查官方网站获取最新链接)

---

## 🙌 贡献

欢迎提交issues或PRs来改进脚本或添加功能。让我们一起成长Nockchain生态系统！

## �� 许可证

MIT License
