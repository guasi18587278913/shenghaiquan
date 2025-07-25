const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const { execSync } = require('child_process')

async function fixBioWithPython() {
  console.log('🔧 修复缺失的Bio数据（使用Python）\n')
  
  try {
    // 1. 读取问题用户列表
    console.log('📋 步骤1: 读取问题用户列表')
    const report = JSON.parse(fs.readFileSync('bio-mismatch-report.json', 'utf-8'))
    const problemUsers = report.mismatches || []
    
    console.log(`   发现 ${problemUsers.length} 个用户需要检查`)
    
    // 2. 使用Python读取CSV（处理特殊字符和逗号）
    console.log('\n📖 步骤2: 使用Python读取CSV数据')
    
    // 先将用户名列表写入临时文件，避免命令行参数问题
    const tempFile = 'temp_users_to_fix.json'
    fs.writeFileSync(tempFile, JSON.stringify(problemUsers.map(u => u.name)))
    
    const pythonScript = `
import csv
import json

# 读取需要修复的用户名列表
with open('temp_users_to_fix.json', 'r', encoding='utf-8') as f:
    users_to_find = json.load(f)
    names_set = set(users_to_find)

results = []

with open('data/海外AI产品 名单 .csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    row_num = 2
    
    for row in reader:
        if len(row) >= 12:
            star_name = row[2].strip() if row[2] else ''
            wechat_name = row[1].strip() if row[1] else ''
            name = star_name or wechat_name
            
            # 检查是否是需要修复的用户
            if name in names_set:
                bio = row[7].strip() if row[7] else ''
                # 只添加有实际内容的
                if bio and bio != '无':
                    results.append({
                        'name': name,
                        'bio': bio,
                        'tags': row[8].strip() if row[8] else '',
                        'company': row[5].strip() if row[5] else '',
                        'position': row[6].strip() if row[6] else '',
                        'phone': row[11].strip() if len(row) > 11 else ''
                    })
        row_num += 1

print(json.dumps(results))
`
    
    const result = execSync(`python3 -c "${pythonScript}"`, { 
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    })
    
    // 清理临时文件
    fs.unlinkSync(tempFile)
    
    const matchedUsers = JSON.parse(result)
    console.log(`   匹配到 ${matchedUsers.length} 个用户有Bio内容`)
    
    // 3. 更新数据库
    console.log('\n🔄 步骤3: 更新数据库')
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const updateLog = []
    
    for (const userData of matchedUsers) {
      try {
        // 查找用户
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { name: userData.name },
              { phone: userData.phone && userData.phone !== '无' ? userData.phone : undefined }
            ].filter(Boolean)
          }
        })
        
        if (!user) {
          console.log(`   ⚠️  未找到: ${userData.name}`)
          errorCount++
          continue
        }
        
        // 准备更新
        const updates = {}
        const changes = []
        
        // 更新bio
        if (userData.bio && userData.bio !== '无' && userData.bio !== user.bio) {
          updates.bio = userData.bio
          changes.push('bio')
        }
        
        // 更新skills
        if (userData.tags && userData.tags !== '无') {
          const skills = userData.tags.split(/[,，、]/)
            .map(t => t.trim())
            .filter(t => t)
            .slice(0, 5)
          if (skills.length > 0) {
            const skillsJson = JSON.stringify(skills)
            if (skillsJson !== user.skills) {
              updates.skills = skillsJson
              changes.push('skills')
            }
          }
        }
        
        // 更新company（避免默认值）
        if (userData.company && 
            userData.company !== '互联网行业' && 
            userData.company !== user.company) {
          updates.company = userData.company
          changes.push('company')
        }
        
        // 更新position（避免默认值）
        if (userData.position && 
            userData.position !== '企业员工/创业公司员工' && 
            userData.position !== user.position) {
          updates.position = userData.position
          changes.push('position')
        }
        
        if (Object.keys(updates).length > 0) {
          await prisma.user.update({
            where: { id: user.id },
            data: updates
          })
          
          successCount++
          updateLog.push({
            name: userData.name,
            changes: changes,
            updates: updates
          })
          
          console.log(`   ✅ 更新: ${userData.name} [${changes.join(', ')}]`)
        } else {
          skipCount++
        }
        
      } catch (error) {
        errorCount++
        console.log(`   ❌ 错误: ${userData.name} - ${error.message}`)
      }
    }
    
    // 4. 生成报告
    const fixReport = {
      timestamp: new Date().toISOString(),
      summary: {
        problemUsers: problemUsers.length,
        csvMatched: matchedUsers.length,
        updated: successCount,
        skipped: skipCount,
        errors: errorCount
      },
      updateDetails: updateLog
    }
    
    fs.writeFileSync(
      'bio-fix-final-report.json',
      JSON.stringify(fixReport, null, 2),
      'utf-8'
    )
    
    // 5. 打印总结
    console.log('\n' + '='.repeat(60))
    console.log('✅ Bio数据修复完成！')
    console.log('='.repeat(60))
    console.log('\n📊 修复统计:')
    console.log(`   问题用户: ${problemUsers.length} 个`)
    console.log(`   CSV有内容: ${matchedUsers.length} 个`)
    console.log(`   成功更新: ${successCount} 个`)
    console.log(`   跳过: ${skipCount} 个`)
    console.log(`   错误: ${errorCount} 个`)
    
    // 6. 验证修复效果
    console.log('\n🔍 验证修复效果...')
    const bioStats = await prisma.user.groupBy({
      by: ['bio'],
      _count: { bio: true },
      where: {
        OR: [
          { bio: null },
          { bio: '' },
          { bio: '无' }
        ]
      }
    })
    
    let emptyCount = 0
    bioStats.forEach(stat => {
      emptyCount += stat._count.bio
    })
    
    console.log(`   剩余空Bio用户: ${emptyCount} 个`)
    console.log('\n📄 详细报告: bio-fix-final-report.json')
    
  } catch (error) {
    console.error('❌ 修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行修复
fixBioWithPython()