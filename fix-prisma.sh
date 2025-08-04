#!/bin/bash

echo "修复 Prisma 配置..."

# 1. 清理旧的 Prisma 客户端
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client

# 2. 重新安装 Prisma 依赖
echo "重新安装 Prisma..."
pnpm add -D prisma@latest
pnpm add @prisma/client@latest

# 3. 生成 Prisma 客户端
echo "生成 Prisma 客户端..."
pnpm exec prisma generate

echo "完成！"