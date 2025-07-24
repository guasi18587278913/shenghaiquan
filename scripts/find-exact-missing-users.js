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

async function findExactMissingUsers() {
  console.log('🔍 精确查找未导入的3个学员...\n')
  
  try {
    // 1. 获取所有数据库用户的手机号和所有可能的标识
    const allUsers = await prisma.user.findMany({
      select: { phone: true, name: true }
    })
    
    // 创建所有可能标识的集合
    const dbIdentifiers = new Set()
    allUsers.forEach(u => {
      dbIdentifiers.add(u.phone)
      // 如果是用星球编号作为phone的，提取编号
      if (u.phone.startsWith('S')) {
        const num = u.phone.substring(1)
        dbIdentifiers.add(num) // 添加纯数字版本
      }
    })
    
    console.log(`💾 数据库总用户数: ${allUsers.length}`)
    
    // 2. 读取CSV文件
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    // 3. 收集CSV中的所有学员
    const csvStudents = []
    let lineNum = 0
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || !line.match(/^\d+,/)) continue
      
      lineNum++
      
      try {
        const values = parseCSVLine(line)
        
        const studentId = values[0]?.trim() || ''
        const wechatNick = values[1]?.trim() || ''
        const starNick = values[2]?.trim() || ''
        const wechatId = values[3]?.trim() || ''
        const phone = values[11]?.trim() || ''
        
        csvStudents.push({
          excelRow: i + 1,
          csvIndex: lineNum,
          studentId,
          wechatNick,
          starNick,
          wechatId,
          phone,
          line: line.substring(0, 150)
        })
        
      } catch (error) {
        console.error(`解析第 ${i + 1} 行时出错`)
      }
    }
    
    console.log(`📋 CSV总学员数: ${csvStudents.length}`)
    
    // 4. 查找未导入的学员
    const missingStudents = []
    
    for (const student of csvStudents) {
      // 检查所有可能的标识
      let found = false
      
      // 检查手机号
      if (student.phone && student.phone !== '无' && student.phone.length > 5) {
        if (dbIdentifiers.has(student.phone)) {
          found = true
        }
      }
      
      // 检查星球编号
      if (!found && student.studentId) {
        if (dbIdentifiers.has(`S${student.studentId}`) || dbIdentifiers.has(student.studentId)) {
          found = true
        }
      }
      
      // 检查微信ID
      if (!found && student.wechatId) {
        if (dbIdentifiers.has(`wx_${student.wechatId}`)) {
          found = true
        }
      }
      
      // 检查user_序号格式
      if (!found) {
        if (dbIdentifiers.has(`user_${student.csvIndex}`)) {
          found = true
        }
      }
      
      if (!found) {
        missingStudents.push(student)
      }
    }
    
    // 5. 显示结果
    console.log(`\n❌ 未导入的学员数: ${missingStudents.length}`)
    
    if (missingStudents.length > 0) {
      console.log('\n未导入学员详情:')
      console.log('═'.repeat(80))
      
      missingStudents.forEach((student, index) => {
        console.log(`\n${index + 1}. Excel第 ${student.excelRow} 行 (CSV第${student.csvIndex}个学员)`)
        console.log(`   星球编号: ${student.studentId || '无'}`)
        console.log(`   星球昵称: ${student.starNick || '无'}`)
        console.log(`   微信昵称: ${student.wechatNick || '无'}`)
        console.log(`   微信ID: ${student.wechatId || '无'}`)
        console.log(`   手机号: ${student.phone || '无'}`)
        console.log(`   原始数据: ${student.line}`)
      })
      
      console.log('\n' + '═'.repeat(80))
      console.log('📌 请检查Excel文件中的这些行，并将完整数据发给我。')
    }
    
    // 6. 验证计算
    const seedUsers = allUsers.length - 901 // 假设导入了901个
    console.log(`\n📊 验证:`)
    console.log(`  种子用户: ${seedUsers}`)
    console.log(`  CSV导入: ${csvStudents.length - missingStudents.length}`)
    console.log(`  未导入: ${missingStudents.length}`)
    console.log(`  总计: ${seedUsers} + ${csvStudents.length - missingStudents.length} = ${allUsers.length}`)
    
  } catch (error) {
    console.error('查找失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findExactMissingUsers()