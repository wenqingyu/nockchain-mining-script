#!/bin/bash

set -e

echo "🚀 Nockchain Mining Node Setup Script"
echo "======================================"

# 获取脚本的GitHub仓库URL
REPO_URL="https://raw.githubusercontent.com/wenqingyu/nockchain-mining-script/v2"

echo "🔧 Step 1: Installing system dependencies..."
sudo apt update && sudo apt install -y sudo
sudo apt install -y screen curl iptables build-essential git wget lz4 jq make gcc nano automake autoconf tmux htop nvme-cli libgbm1 pkg-config libssl-dev libleveldb-dev tar clang bsdmainutils ncdu unzip

echo "🦀 Step 2: Installing Rust (Stable)..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustup default stable

echo "📦 Step 3: Installing Node.js and PM2..."
# 安装Node.js LTS版本
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装PM2和必要的npm包
npm install -g pm2
echo "✅ Installed Node.js and PM2"

echo "📦 Step 4: Cloning Nockchain repository..."
cd ~
rm -rf nockchain
git clone https://github.com/zorp-corp/nockchain
cd nockchain

echo "⚙️ Step 5: Downloading configuration files..."
# 下载env模板文件
curl -sSL "${REPO_URL}/env.template" -o env.template
echo "✅ Downloaded env.template"

# 下载PM2集群配置
curl -sSL "${REPO_URL}/ecosystem.config.js" -o ecosystem.config.js
echo "✅ Downloaded ecosystem.config.js"

# 下载区块链检查脚本
curl -sSL "${REPO_URL}/check-blockchain.sh" -o check-blockchain.sh
chmod +x check-blockchain.sh
echo "✅ Downloaded check-blockchain.sh"

# 下载Makefile（如果需要额外的构建规则）
curl -sSL "${REPO_URL}/Makefile" -o Makefile.mining 2>/dev/null || echo "⚠️  Makefile.mining not found (optional)"

echo "📝 Step 6: Setting up environment configuration..."
# 复制env模板作为默认配置
cp env.template .env
echo "✅ Created .env from template"

# 安装PM2配置所需的npm包
npm init -y > /dev/null 2>&1
npm install dotenv
echo "✅ Installed dotenv for PM2 configuration"

echo "🔨 Step 7: Building components..."
make install-hoonc
make build  
make install-nockchain-wallet
make install-nockchain

echo "📂 Step 8: Creating logs directory..."
mkdir -p logs

echo ""
echo "✅ Nockchain setup completed successfully!"
echo ""
echo "📍 Current working directory: $(pwd)"
echo ""
echo "🔑 Next steps:"
echo "1. Generate your wallet: nockchain-wallet keygen"
echo "2. Edit .env file with your MINING_PUBKEY"
echo "3. Start single node: make run-nockchain"
echo "4. Or start PM2 cluster: pm2 start ecosystem.config.js"
echo ""
echo "📚 Available files in ~/nockchain:"
echo "- .env: Environment configuration"
echo "- env.template: Configuration template"
echo "- ecosystem.config.js: PM2 cluster configuration"
echo "- check-blockchain.sh: Blockchain status checker"
echo "- logs/: Log directory"
echo "- package.json & node_modules/: Node.js dependencies"
echo ""
echo "🔍 Check blockchain status: ./check-blockchain.sh"
echo "📖 For detailed instructions, visit:"
echo "   https://github.com/wenqingyu/nockchain-mining-script/tree/v2"
