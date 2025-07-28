#!/bin/bash

echo "🔍 SSH连接诊断工具"
echo "=================="

SERVER="111.231.19.162"

# 1. 测试网络连通性
echo "1️⃣ 测试网络连接..."
if ping -c 1 $SERVER > /dev/null 2>&1; then
    echo "✅ 服务器可以ping通"
else
    echo "❌ 无法ping通服务器"
fi

# 2. 测试SSH端口
echo ""
echo "2️⃣ 测试SSH端口..."
if nc -zv $SERVER 22 2>&1 | grep succeeded > /dev/null; then
    echo "✅ SSH端口(22)开放"
else
    echo "❌ SSH端口可能被阻塞"
fi

# 3. 清理已知主机
echo ""
echo "3️⃣ 清理SSH已知主机记录..."
ssh-keygen -R $SERVER 2>/dev/null
echo "✅ 已清理"

# 4. 尝试不同的SSH选项
echo ""
echo "4️⃣ 尝试SSH连接（使用兼容模式）..."
echo "请输入密码："

# 使用更兼容的选项
ssh -o StrictHostKeyChecking=no \
    -o UserKnownHostsFile=/dev/null \
    -o ServerAliveInterval=60 \
    -o ServerAliveCountMax=3 \
    -L 5432:localhost:5432 \
    root@$SERVER

# 如果还是失败，提供备选方案
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ SSH连接失败"
    echo ""
    echo "🔧 可能的解决方案："
    echo "1. 检查服务器密码是否正确"
    echo "2. 确认服务器SSH服务正常"
    echo "3. 检查本地网络是否有限制"
    echo "4. 尝试使用VPN"
    echo ""
    echo "📌 备选方案：使用数据镜像"
    echo "   运行：npm run sync-db"
fi