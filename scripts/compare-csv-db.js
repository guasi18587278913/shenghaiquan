const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function compareData() {
  try {
    // 1. 统计CSV中的实际数据行数
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // 统计以数字开头的行（真实数据行）
    const dataLines = csvContent.split('\n').filter(line => /^\d+,/.test(line))
    console.log(`📄 CSV数据行数（以数字开头）: ${dataLines.length}`)
    
    // 2. 获取数据库统计
    const dbTotal = await prisma.user.count()
    const dbUsers = await prisma.user.count({ where: { role: 'USER' } })
    const dbAdmins = await prisma.user.count({ where: { role: 'ADMIN' } })
    const dbAssistants = await prisma.user.count({ where: { role: 'ASSISTANT' } })
    
    console.log(`\n💾 数据库统计:`)
    console.log(`  总用户数: ${dbTotal}`)
    console.log(`  普通用户: ${dbUsers}`)
    console.log(`  管理员: ${dbAdmins}`)
    console.log(`  助教: ${dbAssistants}`)
    
    // 3. 计算差异
    const seedDataCount = 18 // 种子数据
    const importedFromCSV = dbTotal - seedDataCount
    
    console.log(`\n📊 导入分析:`)
    console.log(`  种子数据: ${seedDataCount}`)
    console.log(`  从CSV导入: ${importedFromCSV}`)
    console.log(`  CSV总行数: ${dataLines.length}`)
    console.log(`  未导入数量: ${dataLines.length - importedFromCSV}`)
    
    // 4. 检查是否有重复的手机号在CSV中
    const phoneNumbers = []
    dataLines.forEach(line => {
      const parts = line.split(',')
      if (parts[11]) { // 手机号在第12列（索引11）
        phoneNumbers.push(parts[11].trim())
      }
    })
    
    const uniquePhones = new Set(phoneNumbers.filter(p => p && p !== '无'))
    const duplicateCount = phoneNumbers.length - uniquePhones.size
    
    console.log(`\n📱 手机号分析:`)
    console.log(`  CSV中总手机号: ${phoneNumbers.length}`)
    console.log(`  唯一手机号: ${uniquePhones.size}`)
    console.log(`  空或无效: ${phoneNumbers.filter(p => !p || p === '无').length}`)
    console.log(`  重复数量: ${duplicateCount}`)
    
    // 5. 查看最近导入的时间
    const latestUsers = await prisma.user.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    })
    
    if (latestUsers.length > 0) {
      console.log(`\n⏰ 最后导入时间: ${latestUsers[0].createdAt.toLocaleString('zh-CN')}`)
    }
    
  } catch (error) {
    console.error('比较失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

compareData()