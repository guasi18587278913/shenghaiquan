#!/bin/bash

echo "准备创建测试用户..."

# 编译TypeScript
echo "编译TypeScript文件..."
npx tsx scripts/seed-test-users.ts

echo "测试用户创建完成！"