# 🚀 Nockchain Mining Setup Script

**🌐 中文版：[README.zh-CN.md](./README.zh-CN.md)**

This repository contains a fully automated setup script to install and configure a Nockchain node and wallet on a fresh Ubuntu server — perfect for quickly getting started with mining or running the network.

---

## 📌 What is Nockchain?

[Nockchain](https://www.nockchain.org/) is a next-generation blockchain infrastructure optimized for running "Nock" smart contracts. It combines the principles of Urbit and EVM-compatible logic, offering:

- A decentralized execution environment for agents
- Deterministic computation using Hoon and Nock
- An innovative VM layer that's compact and secure

Nockchain is still early, and by running a node or participating as a miner, you're helping decentralize and grow the network.

---

## ⚙️ One-liner Setup

To install everything on a new Ubuntu VPS, just run:

```bash
bash <(curl -s https://raw.githubusercontent.com/wenqingyu/nockchain-mining-script/main/setup-nockchain.sh)
```

This script will:
1. Install system dependencies
2. Install Rust (stable)
3. Clone the official Nockchain repo
4. Copy .env file
5. Build and install all necessary components (hoonc, wallet, node)

## 💻 Recommended VPS Configuration
| Resource | Recommended            |
| -------- | ---------------------- |
| OS       | Ubuntu 20.04+ (64-bit) |
| CPU      | 6 vCPUs                |
| RAM      | 16 GB                   |
| Disk     | 200 GB SSD             |
| Network  | Public IPv4 required   |


## 🔑 Generate Wallet Mnemonic, Public/Private Key
Use the following command to generate a new wallet, which includes:
- a mnemonic seed phrase
- a private/public key pair
- and the chain code

```bash
# Generate wallet (with mnemonic, keys, and chain code)
nockchain-wallet keygen
```

This will print a new key pair, mnemonic phrase, and chain code to the console.
```bash
# Copy the generated public key and add it to your .env file like this:
MINING_PUBKEY=<your-public-key>
```

## 🔧 Advanced Usage
Edit .env after the script runs to configure your wallet, miner settings, etc.

## Run the node
```bash
make run-nockchain
```


## 🔗 Resources
Official Website: nockchain.org
Official Repo: github.com/zorp-corp/nockchain

## 🙌 Contribution
Feel free to open issues or PRs to improve the script or add features. Let’s grow the Nockchain ecosystem together!

## 📜 License
MIT License
