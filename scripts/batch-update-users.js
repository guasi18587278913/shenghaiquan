const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

/**
 * 批量更新用户数据脚本
 * 
 * 使用方法：
 * 1. 准备更新数据文件（CSV或JSON格式）
 * 2. 运行: node scripts/batch-update-users.js <文件路径> [选项]
 * 
 * 选项：
 * --dry-run: 只预览，不实际更新
 * --fields: 指定要更新的字段（逗号分隔），如 --fields=bio,company,position
 * --match-by: 匹配字段（name或phone），默认name
 */

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    file: args[0],
    dryRun: args.includes('--dry-run'),
    fields: null,
    matchBy: 'name'
  }
  
  args.forEach(arg => {
    if (arg.startsWith('--fields=')) {
      options.fields = arg.split('=')[1].split(',')
    }
    if (arg.startsWith('--match-by=')) {
      options.matchBy = arg.split('=')[1]
    }
  })
  
  return options
}

// 读取CSV文件
function readCSVFile(filePath) {
  const pythonScript = `
import csv
import json

results = []
with open('${filePath}', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        results.append(dict(row))
print(json.dumps(results))
`
  
  try {
    const result = execSync(`python3 -c "${pythonScript}"`, { 
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024
    })
    return JSON.parse(result)
  } catch (error) {
    console.error('读取CSV失败，尝试作为JSON读取...')
    return null
  }
}

// 读取更新数据
function readUpdateData(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件不存在: ${filePath}`)
  }
  
  const ext = path.extname(filePath).toLowerCase()
  
  if (ext === '.csv') {
    const data = readCSVFile(filePath)
    if (data) return data
  }
  
  // 尝试作为JSON读取
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

// 验证和清理数据
function validateAndCleanData(data, allowedFields) {
  const cleaned = {}
  
  // Bio字段
  if (allowedFields.includes('bio') && data.bio && data.bio !== '无') {
    cleaned.bio = data.bio.trim()
  }
  
  // Company字段
  if (allowedFields.includes('company') && data.company && 
      data.company !== '互联网行业' && data.company !== '无') {
    cleaned.company = data.company.trim()
  }
  
  // Position字段
  if (allowedFields.includes('position') && data.position && 
      data.position !== '企业员工/创业公司员工' && data.position !== '无') {
    cleaned.position = data.position.trim()
  }
  
  // Skills字段
  if (allowedFields.includes('skills') && data.skills && data.skills !== '无') {
    const skills = data.skills.split(/[,，、]/)
      .map(s => s.trim())
      .filter(s => s)
      .slice(0, 5)
    if (skills.length > 0) {
      cleaned.skills = JSON.stringify(skills)
    }
  }
  
  // Location字段
  if (allowedFields.includes('location') && data.location && data.location !== '无') {
    cleaned.location = data.location.trim()
  }
  
  // Avatar字段
  if (allowedFields.includes('avatar') && data.avatar && data.avatar.startsWith('http')) {
    cleaned.avatar = data.avatar.trim()
  }
  
  return cleaned
}

async function batchUpdateUsers() {
  const options = parseArgs()
  
  if (!options.file) {
    console.log('使用方法: node batch-update-users.js <文件路径> [选项]')
    console.log('选项:')
    console.log('  --dry-run: 预览模式，不实际更新')
    console.log('  --fields=bio,company: 指定更新字段')
    console.log('  --match-by=phone: 匹配字段（默认name）')
    process.exit(1)
  }
  
  console.log('🔄 批量更新用户数据\n')
  console.log(`📄 数据文件: ${options.file}`)
  console.log(`🔍 匹配字段: ${options.matchBy}`)
  console.log(`📝 更新字段: ${options.fields ? options.fields.join(', ') : '所有非空字段'}`)
  console.log(`🧪 预览模式: ${options.dryRun ? '是' : '否'}\n`)
  
  try {
    // 读取更新数据
    console.log('📖 读取更新数据...')
    const updateData = readUpdateData(options.file)
    console.log(`✅ 读取到 ${updateData.length} 条数据\n`)
    
    // 准备更新
    const allowedFields = options.fields || ['bio', 'company', 'position', 'skills', 'location', 'avatar']
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const updateLog = []
    
    console.log('🔄 开始处理...')
    
    for (const data of updateData) {
      try {
        // 查找用户
        const matchValue = data[options.matchBy]
        if (!matchValue) {
          console.log(`   ⚠️  跳过: 缺少${options.matchBy}字段`)
          skipCount++
          continue
        }
        
        const user = await prisma.user.findFirst({
          where: { [options.matchBy]: matchValue }
        })
        
        if (!user) {
          console.log(`   ⚠️  未找到: ${matchValue}`)
          errorCount++
          continue
        }
        
        // 准备更新数据
        const updates = validateAndCleanData(data, allowedFields)
        
        if (Object.keys(updates).length === 0) {
          skipCount++
          continue
        }
        
        // 预览或执行更新
        if (options.dryRun) {
          console.log(`   👁️  预览: ${user.name} - ${Object.keys(updates).join(', ')}`)
          updateLog.push({
            name: user.name,
            updates: updates
          })
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: updates
          })
          console.log(`   ✅ 更新: ${user.name} - ${Object.keys(updates).join(', ')}`)
          updateLog.push({
            name: user.name,
            updates: updates
          })
        }
        
        successCount++
        
      } catch (error) {
        errorCount++
        console.log(`   ❌ 错误: ${data.name || data.phone} - ${error.message}`)
      }
    }
    
    // 生成报告
    const report = {
      timestamp: new Date().toISOString(),
      file: options.file,
      options: options,
      summary: {
        total: updateData.length,
        success: successCount,
        skipped: skipCount,
        errors: errorCount
      },
      updateLog: updateLog.slice(0, 100) // 只保存前100条
    }
    
    const reportFile = `batch-update-report-${Date.now()}.json`
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    
    // 打印总结
    console.log('\n' + '='.repeat(60))
    console.log(options.dryRun ? '✅ 预览完成！' : '✅ 更新完成！')
    console.log('='.repeat(60))
    console.log('\n📊 处理统计:')
    console.log(`   总数据: ${updateData.length} 条`)
    console.log(`   成功: ${successCount} 条`)
    console.log(`   跳过: ${skipCount} 条`)
    console.log(`   错误: ${errorCount} 条`)
    console.log(`\n📄 详细报告: ${reportFile}`)
    
    if (options.dryRun) {
      console.log('\n💡 提示: 这是预览模式，数据未实际更新')
      console.log('   移除 --dry-run 参数来执行实际更新')
    }
    
  } catch (error) {
    console.error('❌ 批量更新失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 如果直接运行脚本
if (require.main === module) {
  batchUpdateUsers()
}

module.exports = { batchUpdateUsers }