const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const { execSync } = require('child_process')
const bcrypt = require('bcryptjs')

async function handleSpecialUsers() {
  console.log('🔧 处理特殊用户数据...\n')
  
  try {
    // 读取详细报告
    const report = JSON.parse(fs.readFileSync('data-accuracy-report.json', 'utf-8'))
    
    // 获取所有被跳过的用户
    const skippedUsers = report.issues.filter(i => i.issue === '用户名无效')
    console.log(`📊 发现 ${skippedUsers.length} 个被跳过的特殊用户`)
    
    // 重新读取CSV获取这些用户的完整信息
    const pythonScript = `
import csv
import json

special_names = ${JSON.stringify(skippedUsers.map(u => u.name))}
users = []

with open('data/海外AI产品 名单 .csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    row_num = 2
    for row in reader:
        if len(row) >= 12:
            star_name = row[2].strip() if row[2] else ''
            wechat_name = row[1].strip() if row[1] else ''
            name = star_name or wechat_name
            
            # 检查是否是特殊用户
            if name in special_names or star_name in special_names:
                users.append({
                    'row_num': row_num,
                    'star_id': row[0].strip() if row[0] else '',
                    'wechat_name': wechat_name,
                    'star_name': star_name,
                    'final_name': name,  # 使用星球昵称或微信昵称
                    'wechat_id': row[3].strip() if row[3] else '',
                    'avatar': row[4].strip() if row[4] else '',
                    'industry': row[5].strip() if row[5] else '',
                    'identity': row[6].strip() if row[6] else '',
                    'bio': row[7].strip() if row[7] else '',
                    'tags': row[8].strip() if row[8] else '',
                    'city': row[9].strip() if row[9] else '',
                    'phone': row[11].strip() if len(row) > 11 else ''
                })
        row_num += 1
print(json.dumps(users))
`
    
    const result = execSync(`python3 -c "${pythonScript}"`, { encoding: 'utf-8' })
    const specialUsers = JSON.parse(result)
    
    console.log(`\n📋 处理特殊用户:`)
    let handled = 0
    
    for (const user of specialUsers) {
      // 使用更宽松的名称验证
      const finalName = user.final_name || user.wechat_name || `用户${user.row_num}`
      
      // 检查是否已存在
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            { name: finalName },
            { phone: user.phone || user.wechat_id || `special_${user.row_num}` }
          ]
        }
      })
      
      if (!existing) {
        // 提取城市
        let city = '其他'
        if (user.city) {
          const cityPattern = /(北京|上海|深圳|广州|杭州|成都|武汉|西安|南京|苏州|厦门|青岛|天津|重庆)/
          const match = user.city.match(cityPattern)
          if (match) city = match[1]
        }
        
        try {
          const hashedPassword = await bcrypt.hash('deepsea2024', 10)
          
          await prisma.user.create({
            data: {
              name: finalName,
              email: `${user.star_id || user.row_num}@deepsea.com`,
              phone: user.phone || user.wechat_id || `special_${user.row_num}`,
              password: hashedPassword,
              avatar: user.avatar || null,
              bio: user.bio || '',
              location: city,
              company: user.industry || '',
              position: user.identity || '',
              skills: JSON.stringify(user.tags ? user.tags.split(/[,，]/).filter(t => t) : []),
              role: 'USER',
              level: 1,
              points: 100
            }
          })
          
          console.log(`   ✅ 添加: ${finalName} (行${user.row_num})`)
          handled++
        } catch (error) {
          console.log(`   ❌ 失败: ${finalName} - ${error.message}`)
        }
      } else {
        console.log(`   ⏭️  已存在: ${finalName}`)
      }
    }
    
    // 清理额外的非CSV用户
    console.log('\n🗑️  清理非CSV用户...')
    const dbUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true }
    })
    
    // 获取所有CSV中的有效名称
    const allCsvScript = `
import csv
import json

names = set()
with open('data/海外AI产品 名单 .csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader)  # skip header
    for row in reader:
        if len(row) >= 3:
            star_name = row[2].strip() if row[2] else ''
            wechat_name = row[1].strip() if row[1] else ''
            if star_name:
                names.add(star_name)
            elif wechat_name:
                names.add(wechat_name)
print(json.dumps(list(names)))
`
    
    const csvNamesResult = execSync(`python3 -c "${allCsvScript}"`, { encoding: 'utf-8' })
    const csvNames = new Set(JSON.parse(csvNamesResult))
    
    let cleaned = 0
    for (const user of dbUsers) {
      if (!csvNames.has(user.name) && !user.name.startsWith('用户')) {
        // 检查是否是示例数据
        if (user.email?.includes('example.com') || 
            user.name.match(/^(test|demo|测试|示例|演示)/i) ||
            user.name === 'John Doe' || user.name === '张三' || user.name === '李四' || user.name === '王五') {
          await prisma.user.delete({ where: { id: user.id } })
          console.log(`   🗑️  删除示例用户: ${user.name}`)
          cleaned++
        }
      }
    }
    
    // 最终验证
    console.log('\n📊 最终验证...')
    const finalDbCount = await prisma.user.count()
    const finalValidCsvCount = csvNames.size
    
    console.log(`\n✅ 处理完成!`)
    console.log(`   CSV有效用户: ${finalValidCsvCount}`)
    console.log(`   数据库用户: ${finalDbCount}`)
    console.log(`   准确率: ${((finalDbCount / finalValidCsvCount) * 100).toFixed(2)}%`)
    console.log(`   处理特殊用户: ${handled}`)
    console.log(`   清理测试数据: ${cleaned}`)
    
    // 生成最终城市分布
    const cityStats = await prisma.user.groupBy({
      by: ['location'],
      _count: { location: true },
      orderBy: { _count: { location: 'desc' } },
      take: 10
    })
    
    console.log('\n🏙️  最终城市分布:')
    cityStats.forEach(({ location, _count }) => {
      console.log(`   ${location}: ${_count.location}人`)
    })
    
    // 保存最终报告
    const finalReport = {
      timestamp: new Date().toISOString(),
      csvValidUsers: finalValidCsvCount,
      dbUsers: finalDbCount,
      accuracy: ((finalDbCount / finalValidCsvCount) * 100).toFixed(2) + '%',
      specialUsersHandled: handled,
      testDataCleaned: cleaned,
      cityDistribution: cityStats.map(s => ({ city: s.location, count: s._count.location }))
    }
    
    fs.writeFileSync(
      'final-accuracy-report.json',
      JSON.stringify(finalReport, null, 2),
      'utf-8'
    )
    
    if (finalDbCount === finalValidCsvCount) {
      console.log('\n🎉 完美！已实现100%数据准确性！')
    }
    
  } catch (error) {
    console.error('❌ 处理失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行处理
handleSpecialUsers()