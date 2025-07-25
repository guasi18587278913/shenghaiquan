const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const { execSync } = require('child_process')

async function fixMissingBioData() {
  console.log('🔧 修复缺失的Bio数据\n')
  
  try {
    // 读取之前的报告，获取需要修复的用户列表
    const report = JSON.parse(fs.readFileSync('bio-mismatch-report.json', 'utf-8'))
    const usersToFix = report.mismatches || []
    
    console.log(`📋 发现 ${usersToFix.length} 个用户需要修复Bio数据`)
    
    // 准备Python脚本来读取CSV中的完整数据
    const pythonScript = `
import csv
import json

# 需要查找的用户名
users_to_find = ${JSON.stringify(usersToFix.map(u => u.name))}
names_set = set(users_to_find)

results = []

with open('data/海外AI产品 名单 .csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    current_row = 2
    
    for row in reader:
        if len(row) >= 12:
            # 提取所有字段
            star_name = row[2].strip() if row[2] else ''
            wechat_name = row[1].strip() if row[1] else ''
            name = star_name or wechat_name
            
            # 检查是否是需要修复的用户
            if name in names_set:
                results.append({
                    'row': current_row,
                    'name': name,
                    'bio': row[7].strip() if row[7] else '',
                    'tags': row[8].strip() if row[8] else '',
                    'company': row[5].strip() if row[5] else '',
                    'position': row[6].strip() if row[6] else '',
                    'phone': row[11].strip() if len(row) > 11 else ''
                })
        current_row += 1

print(json.dumps(results))
`
    
    console.log('\n📖 从CSV读取原始数据...')
    const result = execSync(`python3 -c "${pythonScript}"`, { 
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    })
    const csvData = JSON.parse(result)
    
    console.log(`✅ 成功读取 ${csvData.length} 条CSV数据\n`)
    
    // 更新数据库
    console.log('🔄 开始更新数据库...')
    let successCount = 0
    let skipCount = 0
    const updateDetails = []
    
    for (const userData of csvData) {
      try {
        // 查找用户
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { name: userData.name },
              { phone: userData.phone }
            ]
          }
        })
        
        if (!user) {
          console.log(`   ⚠️  未找到用户: ${userData.name}`)
          skipCount++
          continue
        }
        
        // 准备更新数据
        const updateData = {}
        let hasUpdates = false
        
        // 更新bio（如果CSV中有内容且不是"无"）
        if (userData.bio && userData.bio !== '无' && userData.bio !== user.bio) {
          updateData.bio = userData.bio
          hasUpdates = true
        }
        
        // 更新skills（如果CSV中有标签）
        if (userData.tags && userData.tags !== '无') {
          const skills = userData.tags.split(/[,，、]/).filter(t => t.trim()).slice(0, 5)
          if (skills.length > 0) {
            updateData.skills = JSON.stringify(skills)
            hasUpdates = true
          }
        }
        
        // 更新company（如果不是默认值）
        if (userData.company && 
            userData.company !== '互联网行业' && 
            userData.company !== user.company) {
          updateData.company = userData.company
          hasUpdates = true
        }
        
        // 更新position（如果不是默认值）
        if (userData.position && 
            userData.position !== '企业员工/创业公司员工' && 
            userData.position !== user.position) {
          updateData.position = userData.position
          hasUpdates = true
        }
        
        if (hasUpdates) {
          await prisma.user.update({
            where: { id: user.id },
            data: updateData
          })
          
          successCount++
          updateDetails.push({
            name: userData.name,
            updates: Object.keys(updateData)
          })
          
          console.log(`   ✅ 更新: ${userData.name} - ${Object.keys(updateData).join(', ')}`)
        } else {
          skipCount++
          console.log(`   ⏭️  跳过: ${userData.name} (无需更新)`)
        }
        
      } catch (error) {
        console.log(`   ❌ 错误: ${userData.name} - ${error.message}`)
      }
    }
    
    // 生成修复报告
    const fixReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalToFix: usersToFix.length,
        csvDataFound: csvData.length,
        updated: successCount,
        skipped: skipCount
      },
      updateDetails: updateDetails
    }
    
    fs.writeFileSync(
      'bio-fix-report.json',
      JSON.stringify(fixReport, null, 2),
      'utf-8'
    )
    
    console.log('\n' + '='.repeat(60))
    console.log('✅ Bio数据修复完成！')
    console.log('='.repeat(60))
    console.log(`\n📊 修复统计:`)
    console.log(`   需要修复: ${usersToFix.length} 个`)
    console.log(`   成功更新: ${successCount} 个`)
    console.log(`   跳过: ${skipCount} 个`)
    console.log('\n📄 详细报告: bio-fix-report.json')
    
  } catch (error) {
    console.error('❌ 修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行修复
fixMissingBioData()