const fs = require('fs')
const path = require('path')

// 定义文件整理规则
const organizeRules = {
  // 报告文件移动到 reports 文件夹
  reports: {
    pattern: /\.(report|analysis)\.json$/,
    files: [
      'bio-fix-final-report.json',
      'bio-mismatch-report.json',
      'cascade-cleanup-report.json',
      'data-accuracy-report.json',
      'data-quality-check.json',
      'data-sync-report.json',
      'extra-users-analysis.json',
      'final-4-diff-analysis.json',
      'final-100-percent-report.json',
      'final-accuracy-report.json',
      'final-accuracy-report-100.json',
      'final-cleanup-report.json',
      'final-data-sync-analysis.json',
      'final-sync-report.json',
      'safe-sync-100-report.json',
      'sync-analysis.json',
      'user-data-analysis.json',
      'users-analysis.json',
      'users-with-phones.json'
    ]
  },
  
  // 临时文件移动到 temp 文件夹
  temp: {
    files: [
      'batch-update-report-*.json',
      'temp_*.json',
      'temp_*.csv',
      'data-sync-status.html'
    ]
  },
  
  // 文档文件移动到 docs 文件夹
  docs: {
    files: [
      '地图页面成员展示功能说明.md',
      '地图页面成员展示设计方案.md',
      '开发进度与下一步计划.md',
      '数据质量管理方案.md',
      '位置数据问题分析与解决.md',
      '项目文档.md',
      '新用户添加说明.md',
      'TODO清单.md',
      'AVATARS_README.md'
    ]
  }
}

// 创建目录
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ 创建目录: ${dir}`)
  }
}

// 移动文件
function moveFile(oldPath, newPath) {
  try {
    // 确保目标目录存在
    ensureDirectoryExists(path.dirname(newPath))
    
    // 如果目标文件已存在，先删除
    if (fs.existsSync(newPath)) {
      fs.unlinkSync(newPath)
    }
    
    // 移动文件
    fs.renameSync(oldPath, newPath)
    console.log(`📦 移动: ${path.basename(oldPath)} → ${newPath}`)
    return true
  } catch (error) {
    console.error(`❌ 移动失败: ${oldPath} - ${error.message}`)
    return false
  }
}

// 主函数
function organizeProjectFiles() {
  console.log('🧹 开始整理项目文件...\n')
  
  const projectRoot = process.cwd()
  let movedCount = 0
  
  // 1. 整理报告文件
  console.log('📊 整理报告文件...')
  ensureDirectoryExists(path.join(projectRoot, 'reports'))
  
  organizeRules.reports.files.forEach(file => {
    const oldPath = path.join(projectRoot, file)
    if (fs.existsSync(oldPath)) {
      const newPath = path.join(projectRoot, 'reports', file)
      if (moveFile(oldPath, newPath)) movedCount++
    }
  })
  
  // 处理通配符匹配的报告文件
  const files = fs.readdirSync(projectRoot)
  files.forEach(file => {
    if (file.startsWith('batch-update-report-') && file.endsWith('.json')) {
      const oldPath = path.join(projectRoot, file)
      const newPath = path.join(projectRoot, 'reports', file)
      if (moveFile(oldPath, newPath)) movedCount++
    }
  })
  
  // 2. 整理文档文件
  console.log('\n📄 整理文档文件...')
  ensureDirectoryExists(path.join(projectRoot, 'docs'))
  
  organizeRules.docs.files.forEach(file => {
    const oldPath = path.join(projectRoot, file)
    if (fs.existsSync(oldPath)) {
      const newPath = path.join(projectRoot, 'docs', file)
      if (moveFile(oldPath, newPath)) movedCount++
    }
  })
  
  // 3. 清理临时文件
  console.log('\n🗑️  清理临时文件...')
  const tempFiles = [
    'temp_users_to_fix.json',
    'data-sync-status.html'
  ]
  
  tempFiles.forEach(file => {
    const filePath = path.join(projectRoot, file)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`🗑️  删除: ${file}`)
      movedCount++
    }
  })
  
  // 4. 创建 .gitignore 规则
  console.log('\n📝 更新 .gitignore...')
  const gitignoreAdditions = `
# Reports and temporary files
/reports/
/temp/
*.tmp
*.log

# Database files
*.db
*.db-journal
*.sqlite
*.sqlite-journal

# Environment files
.env.local
.env.*.local

# IDE files
.idea/
*.swp
*.swo
.DS_Store
`
  
  const gitignorePath = path.join(projectRoot, '.gitignore')
  const currentGitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf-8') : ''
  
  // 只添加不存在的规则
  if (!currentGitignore.includes('/reports/')) {
    fs.appendFileSync(gitignorePath, gitignoreAdditions)
    console.log('✅ 更新 .gitignore 文件')
  }
  
  // 5. 创建 README 文件
  console.log('\n📋 检查 README 文件...')
  const readmePath = path.join(projectRoot, 'README.md')
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# 深海圈 - AI产品出海学习社区

## 项目简介

深海圈是一个面向AI产品开发者的在线教育社区，专注于AI产品开发和出海经验分享。

## 快速开始

\`\`\`bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev

# 构建生产版本
npm run build
\`\`\`

## 项目结构

- \`app/\` - Next.js 14 应用目录
- \`components/\` - React 组件
- \`lib/\` - 工具函数
- \`prisma/\` - 数据库模型
- \`public/\` - 静态资源
- \`scripts/\` - 实用脚本
- \`docs/\` - 项目文档
- \`data/\` - 数据文件

## 更多信息

详见 [项目文档](./docs/项目文档.md)
`
    fs.writeFileSync(readmePath, readmeContent)
    console.log('✅ 创建 README.md 文件')
  }
  
  // 6. 生成整理报告
  const organizeReport = {
    timestamp: new Date().toISOString(),
    summary: {
      filesOrganized: movedCount,
      directories: {
        reports: '所有数据分析报告',
        docs: '项目文档',
        scripts: '实用脚本',
        data: '原始数据文件'
      }
    },
    recommendations: [
      '定期运行此脚本保持项目整洁',
      '新的报告文件应直接保存到 reports/ 目录',
      '文档文件应保存到 docs/ 目录',
      '临时文件使用后应及时清理'
    ]
  }
  
  ensureDirectoryExists(path.join(projectRoot, 'reports'))
  fs.writeFileSync(
    path.join(projectRoot, 'reports', 'project-organize-report.json'),
    JSON.stringify(organizeReport, null, 2)
  )
  
  // 打印总结
  console.log('\n' + '='.repeat(60))
  console.log('✅ 项目文件整理完成！')
  console.log('='.repeat(60))
  console.log(`\n📊 整理统计:`)
  console.log(`   文件处理: ${movedCount} 个`)
  console.log(`\n📁 目录结构:`)
  console.log(`   reports/ - 数据分析报告`)
  console.log(`   docs/    - 项目文档`)
  console.log(`   scripts/ - 实用脚本`)
  console.log(`   data/    - 原始数据`)
  console.log(`\n💡 建议:`)
  console.log(`   1. 将 reports/ 目录添加到 .gitignore`)
  console.log(`   2. 定期清理临时文件`)
  console.log(`   3. 保持根目录整洁`)
}

// 执行整理
organizeProjectFiles()