const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function analyzeImportStatus() {
  console.log('🔍 分析导入状态...\n')
  
  try {
    // 1. 数据库统计
    const totalUsers = await prisma.user.count()
    const seedUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: new Date('2025-07-23')
        }
      }
    })
    const importedToday = await prisma.user.count({
      where: {
        createdAt: { gte: new Date('2025-07-23') }
      }
    })
    
    console.log('📊 数据库统计:')
    console.log(`  总用户数: ${totalUsers}`)
    console.log(`  种子用户(7月23日之前): ${seedUsers}`)
    console.log(`  今天导入的用户: ${importedToday}`)
    
    // 2. CSV统计
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    let csvCount = 0
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line && line.match(/^\d+,/)) {
        csvCount++
      }
    }
    
    console.log(`\n📋 CSV文件统计:`)
    console.log(`  CSV数据行数: ${csvCount}`)
    
    // 3. 差异分析
    console.log(`\n🔢 差异分析:`)
    console.log(`  CSV应导入: ${csvCount}`)
    console.log(`  实际导入: ${importedToday}`)
    console.log(`  差异: ${csvCount - importedToday}`)
    
    // 4. 尝试找出具体是哪3个用户
    if (csvCount - importedToday === 3) {
      console.log('\n✅ 确认有3个用户未能导入')
      
      // 获取所有导入用户的详细信息
      const importedUsers = await prisma.user.findMany({
        where: {
          createdAt: { gte: new Date('2025-07-23') }
        },
        select: { 
          phone: true,
          name: true
        }
      })
      
      // 分析phone字段的模式
      let phonePattern = {
        sFormat: 0,     // S开头（星球编号）
        wxFormat: 0,    // wx_开头
        userFormat: 0,  // user_开头
        realPhone: 0    // 真实手机号
      }
      
      importedUsers.forEach(u => {
        if (u.phone.startsWith('S')) phonePattern.sFormat++
        else if (u.phone.startsWith('wx_')) phonePattern.wxFormat++
        else if (u.phone.startsWith('user_')) phonePattern.userFormat++
        else phonePattern.realPhone++
      })
      
      console.log('\n📱 导入用户的登录ID模式:')
      console.log(`  S开头（星球编号）: ${phonePattern.sFormat}`)
      console.log(`  wx_开头（微信ID）: ${phonePattern.wxFormat}`)
      console.log(`  user_开头（序号）: ${phonePattern.userFormat}`)
      console.log(`  真实手机号: ${phonePattern.realPhone}`)
      
      // 创建一个脚本来精确找出这3个用户
      console.log('\n💡 建议运行 scripts/find-exact-3-missing.js 来找出具体是哪3个用户')
    }
    
  } catch (error) {
    console.error('分析失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeImportStatus()