const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function parseCSVLine(line) {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

async function findMissing3Users() {
  console.log('🔍 查找未导入的3个学员...\n')
  
  try {
    // 1. 获取所有已导入用户的标识
    const dbUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: new Date('2025-07-23') } // 只看今天导入的
      },
      select: { phone: true, name: true }
    })
    
    // 创建查找集合
    const dbPhones = new Set(dbUsers.map(u => u.phone))
    const dbNames = new Set(dbUsers.map(u => u.name))
    
    console.log(`💾 数据库中CSV导入的用户: ${dbUsers.length}`)
    
    // 2. 读取CSV文件
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    // 3. 逐行检查
    const missingUsers = []
    let csvRowCount = 0
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || !line.match(/^\d+,/)) continue
      
      csvRowCount++
      
      try {
        const values = parseCSVLine(line)
        
        // 获取关键信息
        const studentId = values[0]?.trim() || ''
        const wechatNick = values[1]?.trim() || ''
        const starNick = values[2]?.trim() || ''
        const wechatId = values[3]?.trim() || ''
        const phone = values[11]?.trim() || ''
        
        // 确定用户名
        const name = starNick || wechatNick || `用户${studentId}`
        
        // 构建所有可能的登录ID
        const possibleIds = []
        if (phone && phone !== '无' && phone.length > 5) {
          possibleIds.push(phone)
        }
        if (studentId) {
          possibleIds.push(`S${studentId}`)
        }
        if (wechatId) {
          possibleIds.push(`wx_${wechatId}`)
        }
        possibleIds.push(`user_${csvRowCount}`)
        
        // 检查是否存在
        const existsById = possibleIds.some(id => dbPhones.has(id))
        const existsByName = dbNames.has(name)
        
        if (!existsById && !existsByName) {
          missingUsers.push({
            excelRow: i + 1, // Excel中的行号（+1是因为Excel从1开始）
            csvRow: csvRowCount,
            studentId,
            name,
            wechatNick,
            starNick,
            phone,
            wechatId,
            line: line.substring(0, 100) + '...' // 原始数据预览
          })
        }
        
      } catch (error) {
        console.error(`解析第 ${i + 1} 行时出错:`, error.message)
      }
    }
    
    // 4. 显示结果
    console.log(`\n📊 CSV总数据行: ${csvRowCount}`)
    console.log(`❌ 未导入的用户: ${missingUsers.length} 个\n`)
    
    if (missingUsers.length > 0) {
      console.log('未导入用户详情:')
      console.log('─'.repeat(80))
      
      missingUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. Excel第 ${user.excelRow} 行`)
        console.log(`   学号: ${user.studentId || '无'}`)
        console.log(`   星球昵称: ${user.starNick || '无'}`)
        console.log(`   微信昵称: ${user.wechatNick || '无'}`)
        console.log(`   微信ID: ${user.wechatId || '无'}`)
        console.log(`   手机号: ${user.phone || '无'}`)
        console.log(`   原始数据: ${user.line}`)
      })
      
      console.log('\n💡 这些用户未导入的可能原因:')
      console.log('   1. 缺少必要的身份信息')
      console.log('   2. 数据格式有问题')
      console.log('   3. 名称为空或无效')
      
      console.log('\n📌 请检查Excel文件中的这些行，或直接发给我这些行的完整数据。')
    }
    
  } catch (error) {
    console.error('查找失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findMissing3Users()