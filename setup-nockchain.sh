#!/bin/bash

set -e

echo "🔧 Step 1: Installing system dependencies..."
sudo apt update && sudo apt install -y sudo
sudo apt install -y screen curl iptables build-essential git wget lz4 jq make gcc nano automake autoconf tmux htop nvme-cli libgbm1 pkg-config libssl-dev libleveldb-dev tar clang bsdmainutils ncdu unzip

echo "🦀 Step 2: Installing Rust (Stable)..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source "$HOME/.cargo/env"
rustup default stable

echo "📦 Step 3: Cloning Nockchain repository..."
cd ~
rm -rf nockchain
git clone https://github.com/zorp-corp/nockchain
cd nockchain

echo "⚙️ Copying .env file..."
cp .env_example .env

echo "🔨 Step 4: Building components..."
make install-hoonc
make build
make install-nockchain-wallet
make install-nockchain

echo "✅ All done! Nockchain is set up."
