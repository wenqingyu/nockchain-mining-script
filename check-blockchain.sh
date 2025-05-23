#!/bin/bash

# 设置颜色代码
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===== Nockchain 区块链状态查询工具 =====${NC}"

# 检查主要节点状态
echo -e "${GREEN}正在检查主节点状态...${NC}"
if [ -S "/tmp/nockchain-main.socket" ]; then
  echo -e "${GREEN}主节点Socket存在${NC}"
  
  # 尝试通过钱包查询状态
  echo -e "${YELLOW}尝试通过nockchain-wallet查询区块链状态...${NC}"
  nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket scan
  
  echo -e "${YELLOW}查询钱包余额...${NC}"
  nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket update-balance
  
  echo -e "${YELLOW}列出所有公钥...${NC}"
  nockchain-wallet --nockchain-socket /tmp/nockchain-main.socket list-pubkeys
else
  echo -e "${RED}主节点Socket(/tmp/nockchain-main.socket)不存在，节点可能未运行${NC}"
fi

# 检查节点日志
echo -e "\n${GREEN}分析节点日志中的区块信息...${NC}"
if [ -f "logs/nockchain-main-out.log" ]; then
  echo -e "${YELLOW}主节点最近的区块/交易记录:${NC}"
  grep -a -i -E "block|transaction" logs/nockchain-main-out.log | tail -20
else
  echo -e "${RED}主节点日志文件不存在${NC}"
fi

echo -e "\n${GREEN}矿工节点最近的区块/交易记录:${NC}"
for i in {1..3}; do
  if [ -f "logs/nockchain-miner-$i-out.log" ]; then
    echo -e "${YELLOW}矿工节点 $i 最近记录:${NC}"
    grep -a -i -E "block|transaction" "logs/nockchain-miner-$i-out.log" | tail -5
  fi
done

echo -e "\n${BLUE}===== 检查完成 =====${NC}"
echo -e "实时监控区块和交易:"
echo -e "  ${GREEN}tail -f logs/nockchain-main-out.log | grep -a -i -E 'block|transaction|height'${NC}" 