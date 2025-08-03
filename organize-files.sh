#!/bin/bash

# 深海圈网站项目文件整理脚本
# 用于将散落在根目录的文件整理到合适的目录中

echo "开始整理项目文件..."

# 创建必要的目录
mkdir -p docs/部署文档
mkdir -p docs/配置文档
mkdir -p docs/问题修复
mkdir -p scripts/部署脚本
mkdir -p scripts/数据库脚本
mkdir -p temp/调试日志

# 移动部署相关文档
echo "整理部署文档..."
mv -f halo-部署步骤.md docs/部署文档/ 2>/dev/null
mv -f halo-deploy-commands.txt docs/部署文档/ 2>/dev/null
mv -f halo-final-deploy.txt docs/部署文档/ 2>/dev/null
mv -f halo-simple-deploy.txt docs/部署文档/ 2>/dev/null
mv -f docker-compose-command.txt docs/部署文档/ 2>/dev/null
mv -f docker-install-commands.txt docs/部署文档/ 2>/dev/null
mv -f 宝塔安装WordPress步骤.md docs/部署文档/ 2>/dev/null
mv -f 宝塔终端执行命令.txt docs/部署文档/ 2>/dev/null

# 移动配置相关文档
echo "整理配置文档..."
mv -f 配置本地连接远程数据库.md docs/配置文档/ 2>/dev/null
mv -f 配置API代理说明.md docs/配置文档/ 2>/dev/null
mv -f 开放PostgreSQL端口.md docs/配置文档/ 2>/dev/null
mv -f 使用本地PostgreSQL.md docs/配置文档/ 2>/dev/null
mv -f setup-dev-db-user.md docs/配置文档/ 2>/dev/null

# 移动方案文档
echo "整理方案文档..."
mv -f 统一权限管理方案.md docs/ 2>/dev/null
mv -f 深海圈付费课程实施方案.md docs/ 2>/dev/null
mv -f 课程内容上传方案.md docs/ 2>/dev/null
mv -f 课程页面设计方案.md docs/ 2>/dev/null
mv -f 在线学习平台最佳实践研究.md docs/ 2>/dev/null
mv -f alternative-solutions.md docs/ 2>/dev/null
mv -f WordPress版权保护方案.md docs/ 2>/dev/null
mv -f WordPress文章显示步骤指南.md docs/ 2>/dev/null

# 移动问题修复文档
echo "整理问题修复文档..."
mv -f fix-wordpress-api-404.md docs/问题修复/ 2>/dev/null
mv -f fix-wordpress-json-error.md docs/问题修复/ 2>/dev/null
mv -f fix-halo-deploy.txt docs/问题修复/ 2>/dev/null
mv -f 找回宝塔面板.txt docs/问题修复/ 2>/dev/null

# 移动脚本文件
echo "整理脚本文件..."
mv -f deploy-webhook.sh scripts/部署脚本/ 2>/dev/null
mv -f ssh-tunnel-setup.sh scripts/部署脚本/ 2>/dev/null
mv -f ssh-debug.sh scripts/部署脚本/ 2>/dev/null
mv -f organize-project.sh scripts/ 2>/dev/null

# 移动临时/调试文件
echo "整理临时文件..."
mv -f debug-halo.txt temp/调试日志/ 2>/dev/null
mv -f check-bt-status.txt temp/调试日志/ 2>/dev/null
mv -f test-auto-deploy.md temp/ 2>/dev/null
mv -f 创建枚举类型.txt temp/ 2>/dev/null

# 移动准备文档
echo "整理其他文档..."
mv -f 准备课程数据模板.md docs/ 2>/dev/null
mv -f 宝塔vs项目内管理对比.md docs/ 2>/dev/null

# 清理空目录
find . -type d -empty -delete 2>/dev/null

echo "文件整理完成！"
echo ""
echo "整理后的目录结构："
echo "- docs/ : 所有文档"
echo "  - 部署文档/ : 部署相关文档"
echo "  - 配置文档/ : 配置相关文档"
echo "  - 问题修复/ : 问题修复记录"
echo "- scripts/ : 所有脚本"
echo "  - 部署脚本/ : 部署相关脚本"
echo "- temp/ : 临时文件"
echo "  - 调试日志/ : 调试日志文件"