#!/bin/bash

# GitHub Webhook 自动部署脚本
# 部署路径
DEPLOY_PATH="/www/wwwroot/shenghaiquan"
LOG_FILE="/www/wwwroot/webhook.log"

# 记录日志
echo "$(date '+%Y-%m-%d %H:%M:%S') - 开始部署..." >> $LOG_FILE

# 进入项目目录
cd $DEPLOY_PATH

# 拉取最新代码
echo "$(date '+%Y-%m-%d %H:%M:%S') - 拉取最新代码..." >> $LOG_FILE
git pull origin main >> $LOG_FILE 2>&1

# 安装依赖（如果package.json有更新）
echo "$(date '+%Y-%m-%d %H:%M:%S') - 检查依赖更新..." >> $LOG_FILE
npm install >> $LOG_FILE 2>&1

# 运行数据库迁移（如果有新的迁移文件）
echo "$(date '+%Y-%m-%d %H:%M:%S') - 运行数据库迁移..." >> $LOG_FILE
npx prisma migrate deploy >> $LOG_FILE 2>&1

# 重启应用
echo "$(date '+%Y-%m-%d %H:%M:%S') - 重启应用..." >> $LOG_FILE
pm2 restart shenghaiquan >> $LOG_FILE 2>&1

echo "$(date '+%Y-%m-%d %H:%M:%S') - 部署完成！" >> $LOG_FILE
echo "==================================" >> $LOG_FILE