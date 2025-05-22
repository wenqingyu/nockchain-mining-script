# 🚀 Nockchain 挖矿一键安装脚本

**🌐 English version: [README.md](./README.md)**

本仓库提供一个全自动安装脚本，用于在全新 Ubuntu 服务器上快速安装和配置 Nockchain 节点与钱包，非常适合快速开始挖矿或运行网络。

---

## 📌 什么是 Nockchain？

[Nockchain](https://www.nockchain.org/) 是一款面向运行 “Nock” 智能合约的下一代区块链基础设施。它融合了 Urbit 与 EVM 兼容逻辑的理念，特点包括：

- 去中心化的代理执行环境
- 使用 Hoon 和 Nock 进行确定性计算
- 创新的虚拟机层，体积小且安全可靠

Nockchain 仍处于早期阶段，运行节点或作为矿工参与能帮助网络去中心化与成长。

---

## ⚙️ 一键安装命令

在新的 Ubuntu VPS 上执行以下命令即可安装所有组件：

```bash
bash <(curl -s https://raw.githubusercontent.com/wenqingyu/nockchain-mining-script/main/setup-nockchain.sh)
````

脚本将会完成：

1. 安装系统依赖
2. 安装 Rust（稳定版）
3. 克隆官方 Nockchain 仓库
4. 复制 .env 配置文件
5. 编译并安装所有必要组件（hoonc、钱包、节点）

---

## 💻 推荐 VPS 配置

| 资源   | 推荐配置                |
| ---- | ------------------- |
| 操作系统 | Ubuntu 20.04+ (64位) |
| CPU  | 6 核虚拟CPU            |
| 内存   | 16 GB               |
| 硬盘   | 200 GB SSD          |
| 网络   | 需要公网 IPv4 地址        |

---

## 🔑 生成钱包助记词、公钥与私钥

使用下面命令生成一个新的钱包，包括：

* 助记词
* 公私钥对
* 链码

```bash
# 生成钱包（含助记词、密钥及链码）
nockchain-wallet keygen
```

控制台会打印新的密钥对、助记词和链码。

```bash
# 复制生成的公钥，并将其填写到 .env 文件中：
MINING_PUBKEY=<你的公钥>
```

---

## 🔧 高级用法

脚本运行完后，请编辑 `.env` 文件以配置钱包、矿工参数等。

---

## 运行节点

```bash
make run-nockchain
```

---

## 🔗 资源链接

官网：[nockchain.org](https://www.nockchain.org/)
官方仓库：[github.com/zorp-corp/nockchain](https://github.com/zorp-corp/nockchain)

---

## 🙌 贡献

欢迎提 issue 或 PR 改进脚本或添加新功能，一起推动 Nockchain 生态成长！

---

## 📜 许可证

MIT License
```
