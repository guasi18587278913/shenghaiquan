#!/bin/bash

# SSH隧道自动连接脚本
# 使用方法：./ssh-tunnel-setup.sh

echo "🔗 建立SSH隧道连接..."

# 配置
SERVER_IP="111.231.19.162"
SERVER_USER="root"
LOCAL_PORT="5432"
REMOTE_PORT="5432"

# 检查是否已有隧道
if lsof -i :$LOCAL_PORT > /dev/null 2>&1; then
    echo "⚠️  端口 $LOCAL_PORT 已被占用"
    echo "是否要关闭现有连接？(y/n)"
    read answer
    if [ "$answer" = "y" ]; then
        kill $(lsof -t -i:$LOCAL_PORT)
        echo "✅ 已关闭现有连接"
    else
        echo "❌ 退出"
        exit 1
    fi
fi

# 建立SSH隧道
echo "📡 正在连接到服务器..."
echo "请输入服务器密码："

# 使用autossh保持连接（如果已安装）
if command -v autossh &> /dev/null; then
    autossh -M 0 -f -N -L $LOCAL_PORT:localhost:$REMOTE_PORT $SERVER_USER@$SERVER_IP
    echo "✅ 使用autossh建立持久连接"
else
    ssh -f -N -L $LOCAL_PORT:localhost:$REMOTE_PORT $SERVER_USER@$SERVER_IP
    echo "✅ SSH隧道已建立"
    echo "💡 提示：安装autossh可以自动重连：brew install autossh"
fi

echo ""
echo "🎉 连接成功！"
echo "📌 数据库连接信息："
echo "   Host: localhost"
echo "   Port: $LOCAL_PORT"
echo "   Database: deepsea"
echo ""
echo "🚀 现在可以运行：npm run dev"