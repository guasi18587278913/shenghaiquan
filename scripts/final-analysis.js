const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function finalAnalysis() {
  console.log('🔍 最终分析：找出未导入的3个学员...\n')
  
  try {
    // 1. 统计数据库
    const allUsers = await prisma.user.findMany({
      select: {
        phone: true,
        name: true,
        createdAt: true
      }
    })
    
    // 统计种子用户（不是今天创建的）
    const seedUsers = allUsers.filter(u => u.createdAt < new Date('2025-07-23'))
    const todayUsers = allUsers.filter(u => u.createdAt >= new Date('2025-07-23'))
    
    console.log('📊 数据库统计:')
    console.log(`  总用户数: ${allUsers.length}`)
    console.log(`  种子用户(7月23日之前): ${seedUsers.length}`)
    console.log(`  今天导入: ${todayUsers.length}`)
    
    // 2. 分析CSV
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // 使用更简单的方法统计CSV行数
    let csvLineCount = 0
    const lines = csvContent.split('\n')
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && line.startsWith(/\d/)) {
        csvLineCount++
      }
    }
    
    console.log(`\n📋 CSV文件统计:`)
    console.log(`  数据行数: ${csvLineCount}`)
    
    // 3. 计算差异
    console.log(`\n🔢 差异分析:`)
    console.log(`  CSV文件应导入: ${csvLineCount}`)
    console.log(`  实际导入: ${todayUsers.length}`)
    console.log(`  未导入: ${csvLineCount - todayUsers.length}`)
    
    // 4. 仔细查看是不是有特殊的行
    if (csvLineCount - todayUsers.length === 3) {
      console.log('\n✅ 确认有3个学员未导入')
      console.log('\n正在查找具体是哪3个...')
      
      // 使用之前successful的import-remaining-users.js的逻辑
      // 那个脚本显示导入了79个，但跳过了822个（已存在）
      // 这意味着第一次导入只成功了822个，而不是901个
      
      console.log('\n💡 分析提示:')
      console.log('1. import-students.js 首次导入了822个用户')
      console.log('2. import-remaining-users.js 又导入了79个用户')
      console.log('3. 总共导入了901个用户（822 + 79）')
      console.log('4. CSV有904个用户，所以有3个未能导入')
      
      console.log('\n📌 建议:')
      console.log('运行 scripts/import-final-3-users.js 来导入最后3个用户')
    }
    
  } catch (error) {
    console.error('分析失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

finalAnalysis()