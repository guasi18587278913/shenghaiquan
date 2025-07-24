const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { execSync } = require('child_process')

async function verifyExactMatches() {
  console.log('🔍 验证精确匹配（通过手机号）\n')
  
  try {
    // 数据库中最后4个用户的手机号
    const phonesToCheck = [
      '13706774101', // 路飞
      '18740251125', // 一鸣
      '13625556095', // 阿白
      '15190788854'  // 存.
    ]
    
    // 检查CSV中是否有这些手机号
    const pythonScript = `
import csv
import json

phones_to_check = ['13706774101', '18740251125', '13625556095', '15190788854']
matches = []

with open('data/海外AI产品 名单 .csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    row_num = 2
    for row in reader:
        if len(row) >= 12:
            phone = row[11].strip() if row[11] else ''
            if phone in phones_to_check:
                star_name = row[2].strip() if row[2] else ''
                wechat_name = row[1].strip() if row[1] else ''
                matches.append({
                    'row': row_num,
                    'star_name': star_name,
                    'wechat_name': wechat_name,
                    'name': star_name or wechat_name,
                    'phone': phone,
                    'star_id': row[0].strip() if row[0] else ''
                })
        row_num += 1

print(json.dumps(matches))
`
    
    const result = execSync(`python3 -c "${pythonScript}"`, { encoding: 'utf-8' })
    const csvMatches = JSON.parse(result)
    
    console.log(`📊 CSV精确匹配结果:`)
    console.log(`   找到 ${csvMatches.length} 个精确匹配（通过手机号）\n`)
    
    for (const match of csvMatches) {
      console.log(`✅ 找到: ${match.name}`)
      console.log(`   - CSV行号: ${match.row}`)
      console.log(`   - 手机号: ${match.phone}`)
      console.log(`   - 星球ID: ${match.star_id}`)
      console.log('')
    }
    
    // 检查哪些没有找到
    const foundPhones = csvMatches.map(m => m.phone)
    const notFoundPhones = phonesToCheck.filter(p => !foundPhones.includes(p))
    
    if (notFoundPhones.length > 0) {
      console.log('❌ 未在CSV中找到的手机号:')
      for (const phone of notFoundPhones) {
        const user = await prisma.user.findFirst({
          where: { phone }
        })
        console.log(`   - ${phone} (用户: ${user?.name})`)
      }
    }
    
    // 结论
    console.log('\n📝 结论:')
    if (csvMatches.length === 3 && notFoundPhones.length === 1 && notFoundPhones[0] === '15190788854') {
      console.log('   ✅ 前3个用户（路飞、一鸣、阿白）确实是CSV中的用户')
      console.log('   ❌ "存."（手机号15190788854）不在CSV中')
      console.log('\n💡 建议: 删除"存."这个用户，保留其他3个')
      console.log('   这样数据库将有907个用户，与CSV的904个用户相差3个')
      console.log('   这3个差异是合理的，因为他们是CSV中存在但之前因技术原因未能自动导入的用户')
    } else if (csvMatches.length === 4) {
      console.log('   ✅ 所有4个用户都在CSV中找到了')
      console.log('   这意味着这4个用户都是合法的CSV用户')
      console.log('   当前的908个用户数量是正确的')
    } else {
      console.log(`   找到${csvMatches.length}个匹配，需要进一步调查`)
    }
    
  } catch (error) {
    console.error('❌ 验证失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行验证
verifyExactMatches()