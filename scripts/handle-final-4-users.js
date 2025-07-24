const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function handleFinal4Users() {
  console.log('🔍 处理最后4个额外用户\n')
  
  try {
    // 这4个用户是之前手动添加的
    const final4Users = [
      { name: '路飞', phone: '13706774101' },
      { name: '一鸣', phone: '18740251125' },
      { name: '阿白', phone: '13625556095' },
      { name: '存.', phone: '15190788854' }
    ]
    
    console.log('📋 发现4个手动添加的用户:')
    console.log('   - 路飞、一鸣、阿白: 在2025/7/24 03:14添加（修复缺失用户时）')
    console.log('   - 存.: 在2025/7/24 11:22添加\n')
    
    // 询问用户如何处理
    console.log('❓ 这4个用户的处理选项:')
    console.log('   1. 保留 - 他们可能是CSV中缺失但实际存在的用户')
    console.log('   2. 删除 - 实现CSV与数据库的100%匹配')
    console.log('\n⚠️  注意: 根据之前的对话记录，您曾说过CSV中有3个用户因为没有手机号而无法自动导入')
    console.log('   这前3个用户(路飞、一鸣、阿白)很可能就是那3个手动补充的用户')
    
    // 查看这些用户的详细信息
    console.log('\n📊 详细信息:')
    for (const user of final4Users) {
      const dbUser = await prisma.user.findFirst({
        where: { phone: user.phone }
      })
      
      if (dbUser) {
        console.log(`\n${user.name}:`)
        console.log(`   - 公司: ${dbUser.company || '未填写'}`)
        console.log(`   - 职位: ${dbUser.position || '未填写'}`)
        console.log(`   - 位置: ${dbUser.location || '未填写'}`)
        console.log(`   - 创建时间: ${dbUser.createdAt.toLocaleString('zh-CN')}`)
      }
    }
    
    // 验证CSV中是否确实缺少这些用户
    console.log('\n🔍 验证CSV匹配...')
    
    // 读取CSV检查这些名字
    const pythonScript = `
import csv
import json

names_to_check = ['路飞', '一鸣', '阿白', '存.']
found_users = []

with open('data/海外AI产品 名单 .csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    for row in reader:
        if len(row) >= 3:
            star_name = row[2].strip() if row[2] else ''
            wechat_name = row[1].strip() if row[1] else ''
            name = star_name or wechat_name
            
            if name in names_to_check:
                found_users.append({
                    'name': name,
                    'phone': row[11].strip() if len(row) > 11 else '',
                    'row': reader.line_num
                })

print(json.dumps(found_users))
`
    
    const { execSync } = require('child_process')
    const result = execSync(`python3 -c "${pythonScript}"`, { encoding: 'utf-8' })
    const csvMatches = JSON.parse(result)
    
    console.log(`\nCSV中找到 ${csvMatches.length} 个匹配:`)
    csvMatches.forEach(match => {
      console.log(`   - ${match.name} (行${match.row}, 手机: ${match.phone || '无'})`)
    })
    
    // 基于分析给出建议
    console.log('\n💡 建议:')
    if (csvMatches.length === 3) {
      console.log('   ✅ 建议保留前3个用户（路飞、一鸣、阿白）')
      console.log('      因为他们在CSV中存在，只是因为缺少手机号而无法自动导入')
      console.log('   ❌ 建议删除"存."，因为这个用户不在CSV中')
    } else {
      console.log('   根据CSV匹配情况，建议相应处理')
    }
    
    // 生成最终报告
    const finalDecision = {
      timestamp: new Date().toISOString(),
      final4Users: final4Users,
      csvMatches: csvMatches,
      recommendation: csvMatches.length === 3 ? 
        'Keep first 3 users (legitimate CSV users), remove "存."' : 
        'Review each case individually',
      currentStats: {
        dbUsers: 908,
        csvUsers: 904,
        difference: 4
      },
      afterAction: {
        keepFirst3: {
          dbUsers: 908,
          csvUsers: 904,
          note: 'The 3 users are legitimate CSV entries that were manually added due to missing phone numbers'
        },
        removeAll4: {
          dbUsers: 904,
          csvUsers: 904,
          note: 'Perfect match but might lose legitimate users'
        },
        removeOnlyLast: {
          dbUsers: 907,
          csvUsers: 904,
          note: 'Keep legitimate CSV users, remove only the extra one'
        }
      }
    }
    
    fs.writeFileSync(
      'final-4-users-decision.json',
      JSON.stringify(finalDecision, null, 2),
      'utf-8'
    )
    
    console.log('\n📄 决策报告已保存: final-4-users-decision.json')
    
  } catch (error) {
    console.error('❌ 分析失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行分析
handleFinal4Users()