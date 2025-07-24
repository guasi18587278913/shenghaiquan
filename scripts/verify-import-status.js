const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function verifyImportStatus() {
  console.log('🔍 验证导入状态...\n')
  
  try {
    // 1. 统计数据库
    const totalUsers = await prisma.user.count()
    const seedUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date('2025-07-17T00:00:00'),
          lt: new Date('2025-07-18T00:00:00')
        }
      }
    })
    const importedUsers = await prisma.user.count({
      where: {
        createdAt: { gte: new Date('2025-07-23T00:00:00') }
      }
    })
    
    console.log('📊 数据库统计:')
    console.log(`  总用户数: ${totalUsers}`)
    console.log(`  种子用户: ${seedUsers}`)
    console.log(`  今天导入: ${importedUsers}`)
    console.log(`  计算: ${seedUsers} + ${importedUsers} = ${seedUsers + importedUsers}`)
    
    // 2. 统计CSV
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const dataLines = csvContent.split('\n').filter(line => /^\d+,/.test(line))
    
    console.log(`\n📄 CSV统计:`)
    console.log(`  数据行数: ${dataLines.length}`)
    
    // 3. 分析差异
    const expectedTotal = seedUsers + dataLines.length
    const actualTotal = totalUsers
    const difference = expectedTotal - actualTotal
    
    console.log(`\n🔢 差异分析:`)
    console.log(`  预期总数: ${expectedTotal} (${seedUsers}种子 + ${dataLines.length}CSV)`)
    console.log(`  实际总数: ${actualTotal}`)
    console.log(`  差异: ${difference}`)
    
    if (difference === 3) {
      console.log('\n✅ 确认：有3个CSV用户未能导入')
      
      // 抽样检查一些特殊情况
      console.log('\n🔍 检查可能的问题数据...')
      
      // 查找名字特别短或特别长的
      const extremeUsers = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: 'S' } },
            { name: { contains: 'wx_' } },
            { name: { contains: 'user_' } }
          ]
        },
        select: { name: true, phone: true },
        take: 10
      })
      
      if (extremeUsers.length > 0) {
        console.log('\n可能有问题的用户名:')
        extremeUsers.forEach(u => {
          console.log(`  ${u.name} - ${u.phone}`)
        })
      }
    }
    
    // 4. 尝试另一种方法找出缺失的
    console.log('\n🔎 尝试通过星球编号查找...')
    
    // 获取所有以S开头的phone（这些是用星球编号登录的）
    const sUsers = await prisma.user.findMany({
      where: {
        phone: { startsWith: 'S' }
      },
      select: { phone: true }
    })
    
    const sNumbers = sUsers.map(u => parseInt(u.phone.substring(1))).filter(n => !isNaN(n))
    
    // 检查CSV中的所有星球编号
    const csvNumbers = []
    dataLines.forEach(line => {
      const match = line.match(/^(\d+),/)
      if (match) {
        csvNumbers.push(parseInt(match[1]))
      }
    })
    
    // 找出CSV中有但数据库中没有的
    const missingNumbers = csvNumbers.filter(n => !sNumbers.includes(n))
    
    if (missingNumbers.length > 0) {
      console.log(`\n找到 ${missingNumbers.length} 个缺失的星球编号:`)
      
      // 在CSV中查找这些编号对应的行
      missingNumbers.forEach(num => {
        const lineIndex = dataLines.findIndex(line => line.startsWith(num + ','))
        if (lineIndex !== -1) {
          console.log(`\n星球编号 ${num} 在 Excel 第 ${lineIndex + 2} 行`)
          console.log(`数据预览: ${dataLines[lineIndex].substring(0, 100)}...`)
        }
      })
    }
    
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyImportStatus()