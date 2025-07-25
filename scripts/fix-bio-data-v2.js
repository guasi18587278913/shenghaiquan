const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')

// CSV解析函数
function parseCSV(content) {
  const lines = content.split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const row = {}
    const values = lines[i].split(',')
    
    if (values.length >= 12) {
      row.row_num = i + 1
      row.star_id = values[0]?.trim() || ''
      row.wechat_name = values[1]?.trim() || ''
      row.star_name = values[2]?.trim() || ''
      row.wechat_id = values[3]?.trim() || ''
      row.avatar = values[4]?.trim() || ''
      row.industry = values[5]?.trim() || ''
      row.identity = values[6]?.trim() || ''
      row.bio = values[7]?.trim() || ''
      row.tags = values[8]?.trim() || ''
      row.city = values[9]?.trim() || ''
      row.resources = values[10]?.trim() || ''
      row.phone = values[11]?.trim() || ''
      
      data.push(row)
    }
  }
  
  return data
}

async function fixBioDataV2() {
  console.log('🔧 修复缺失的Bio数据 (V2)\n')
  
  try {
    // 1. 读取需要修复的用户列表
    console.log('📋 步骤1: 读取问题用户列表')
    const report = JSON.parse(fs.readFileSync('bio-mismatch-report.json', 'utf-8'))
    const problemUsers = report.mismatches || []
    
    console.log(`   发现 ${problemUsers.length} 个用户需要检查`)
    
    // 创建名称映射
    const userNamesSet = new Set(problemUsers.map(u => u.name))
    
    // 2. 读取CSV数据
    console.log('\n📖 步骤2: 读取CSV原始数据')
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const csvData = parseCSV(csvContent)
    
    console.log(`   读取到 ${csvData.length} 条CSV记录`)
    
    // 3. 匹配需要修复的用户
    console.log('\n🔍 步骤3: 匹配用户数据')
    const matchedUsers = []
    
    for (const row of csvData) {
      const name = row.star_name || row.wechat_name
      if (userNamesSet.has(name) && row.bio && row.bio !== '无') {
        matchedUsers.push({
          name: name,
          phone: row.phone,
          bio: row.bio,
          tags: row.tags,
          company: row.industry,
          position: row.identity
        })
      }
    }
    
    console.log(`   匹配到 ${matchedUsers.length} 个用户有Bio内容`)
    
    // 4. 更新数据库
    console.log('\n🔄 步骤4: 更新数据库')
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
              { phone: userData.phone }
            ]
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
        if (userData.tags && userData.tags !== '无' && userData.tags !== user.skills) {
          const skills = userData.tags.split(/[,，、]/)
            .filter(t => t.trim())
            .slice(0, 5)
          if (skills.length > 0) {
            updates.skills = JSON.stringify(skills)
            changes.push('skills')
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
            changes: changes
          })
          
          console.log(`   ✅ 更新: ${userData.name} [${changes.join(', ')}]`)
        } else {
          skipCount++
          console.log(`   ⏭️  跳过: ${userData.name} (数据相同)`)
        }
        
      } catch (error) {
        errorCount++
        console.log(`   ❌ 错误: ${userData.name} - ${error.message}`)
      }
    }
    
    // 5. 生成报告
    const fixReport = {
      timestamp: new Date().toISOString(),
      summary: {
        problemUsers: problemUsers.length,
        csvMatched: matchedUsers.length,
        updated: successCount,
        skipped: skipCount,
        errors: errorCount
      },
      updateLog: updateLog
    }
    
    fs.writeFileSync(
      'bio-fix-report-v2.json',
      JSON.stringify(fixReport, null, 2),
      'utf-8'
    )
    
    // 6. 打印总结
    console.log('\n' + '='.repeat(60))
    console.log('✅ Bio数据修复完成！')
    console.log('='.repeat(60))
    console.log('\n📊 修复统计:')
    console.log(`   问题用户: ${problemUsers.length} 个`)
    console.log(`   CSV匹配: ${matchedUsers.length} 个`)
    console.log(`   成功更新: ${successCount} 个`)
    console.log(`   跳过: ${skipCount} 个`)
    console.log(`   错误: ${errorCount} 个`)
    console.log('\n📄 详细报告: bio-fix-report-v2.json')
    
    // 7. 验证修复效果
    console.log('\n🔍 验证修复效果...')
    const stillEmpty = await prisma.user.count({
      where: {
        OR: [
          { bio: null },
          { bio: '' },
          { bio: '无' }
        ]
      }
    })
    
    console.log(`   剩余空Bio用户: ${stillEmpty} 个`)
    
  } catch (error) {
    console.error('❌ 修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行修复
fixBioDataV2()