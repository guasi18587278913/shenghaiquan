#!/bin/bash

echo "🧹 开始整理项目目录..."

# 创建临时文档目录（如果不存在）
mkdir -p temp-docs

# 移动文档文件到临时目录
echo "📄 移动文档文件..."
mv -f 宝塔面板检查命令.md temp-docs/ 2>/dev/null
mv -f 产品需求文档.md temp-docs/ 2>/dev/null
mv -f 服务器检查命令大全.md temp-docs/ 2>/dev/null
mv -f 更新说明-20250724.md temp-docs/ 2>/dev/null
mv -f 删除多余用户命令.md temp-docs/ 2>/dev/null
mv -f 深海圈项目上线实施手册.md temp-docs/ 2>/dev/null

# 创建webhook相关文件目录
mkdir -p webhook-files

# 移动webhook相关文件
echo "🔗 移动webhook文件..."
mv -f webhook.php webhook-files/ 2>/dev/null
mv -f webhook-index.php webhook-files/ 2>/dev/null
mv -f webhook-api-route.ts webhook-files/ 2>/dev/null
mv -f create-webhook-api.sh webhook-files/ 2>/dev/null

# 创建深海圈教程目录（如果需要）
if [ -d "深海圈教程" ]; then
    echo "📚 深海圈教程目录已存在"
else
    echo "📚 未发现深海圈教程目录"
fi

# 创建临时目录用于存放可能不需要的文件
mkdir -p temp-files

# 信息补充目录保持不变（看起来是重要内容）
echo "ℹ️ 信息补充目录保持不变"

# deep-sea-circle 目录可能是旧版本，建议检查
echo "⚠️  deep-sea-circle 目录可能是旧版本，请手动检查是否需要"

echo ""
echo "✅ 整理完成！"
echo ""
echo "📋 整理结果："
echo "- 文档文件已移动到 temp-docs/"
echo "- Webhook相关文件已移动到 webhook-files/"
echo ""
echo "⚠️ 请检查："
echo "1. temp-docs/ 中的文档，确定哪些要保留在 docs/ 目录"
echo "2. deep-sea-circle/ 目录是否需要删除（可能是旧版本）"
echo "3. webhook-files/ 中的文件是否需要部署到服务器"
echo ""
echo "💡 建议的目录结构："
echo "├── app/            # Next.js 应用代码"
echo "├── components/     # React 组件"
echo "├── lib/           # 工具库"
echo "├── prisma/        # 数据库相关"
echo "├── public/        # 静态资源"
echo "├── scripts/       # 脚本文件"
echo "├── docs/          # 项目文档"
echo "├── data/          # 数据文件"
echo "├── types/         # TypeScript 类型"
echo "└── 信息补充/       # 内容资料"