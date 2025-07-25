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

async function find3MissingUsers() {
  console.log('🔍 查找具体未导入的3个学员...\n')
  
  try {
    // 1. 获取所有今天导入的用户的phone（包括各种格式）
    const importedUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: new Date('2025-07-23') }
      },
      select: { phone: true }
    })
    
    // 构建所有已导入的标识集合
    const importedIds = new Set(importedUsers.map(u => u.phone))
    console.log(`💾 今天导入的用户数: ${importedUsers.length}`)
    
    // 2. 读取CSV文件
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    // 3. 收集所有CSV学员并检查
    const allCSVStudents = []
    const notImportedStudents = []
    let csvRowCount = 0
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || !line.match(/^\d+,/)) continue
      
      csvRowCount++
      
      try {
        const values = parseCSVLine(line)
        
        const studentId = values[0]?.trim() || ''
        const wechatNick = values[1]?.trim() || ''
        const starNick = values[2]?.trim() || ''
        const wechatId = values[3]?.trim() || ''
        const phone = values[11]?.trim() || ''
        
        const studentInfo = {
          excelRow: i + 1,
          csvIndex: csvRowCount,
          studentId,
          wechatNick,
          starNick,
          wechatId,
          phone,
          line: line.substring(0, 200)
        }
        
        allCSVStudents.push(studentInfo)
        
        // 检查是否已导入（使用所有可能的ID格式）
        let isImported = false
        
        // 检查手机号
        if (phone && phone !== '无' && phone.length > 5) {
          if (importedIds.has(phone)) {
            isImported = true
          }
        }
        
        // 检查星球编号格式
        if (!isImported && studentId) {
          if (importedIds.has(`S${studentId}`)) {
            isImported = true
          }
        }
        
        // 检查微信ID格式
        if (!isImported && wechatId) {
          if (importedIds.has(`wx_${wechatId}`)) {
            isImported = true
          }
        }
        
        // 检查user_序号格式
        if (!isImported) {
          if (importedIds.has(`user_${csvRowCount}`)) {
            isImported = true
          }
        }
        
        if (!isImported) {
          notImportedStudents.push(studentInfo)
        }
        
      } catch (error) {
        console.error(`解析第 ${i + 1} 行时出错`)
      }
    }
    
    // 4. 显示结果
    console.log(`\n📋 CSV总学员数: ${csvRowCount}`)
    console.log(`✅ 已导入: ${csvRowCount - notImportedStudents.length}`)
    console.log(`❌ 未导入: ${notImportedStudents.length}`)
    
    if (notImportedStudents.length === 3) {
      console.log('\n✅ 确认找到未导入的3个学员！\n')
      console.log('未导入学员详情:')
      console.log('═'.repeat(80))
      
      notImportedStudents.forEach((student, index) => {
        console.log(`\n${index + 1}. Excel第 ${student.excelRow} 行`)
        console.log(`   星球编号: ${student.studentId}`)
        console.log(`   星球昵称: ${student.starNick || '无'}`)
        console.log(`   微信昵称: ${student.wechatNick || '无'}`)
        console.log(`   微信ID: ${student.wechatId || '无'}`)
        console.log(`   手机号: ${student.phone || '无'}`)
        console.log(`   原始数据: ${student.line}`)
      })
      
      console.log('\n' + '═'.repeat(80))
      console.log('\n📌 这3个用户可能因为数据格式问题未能导入。')
      console.log('请检查Excel文件中的这些行，并将完整数据发给我。')
    } else if (notImportedStudents.length > 0) {
      console.log(`\n⚠️  发现 ${notImportedStudents.length} 个未导入的学员（预期是3个）`)
      
      // 只显示前10个
      console.log('\n显示前10个未导入的学员:')
      notImportedStudents.slice(0, 10).forEach((student, index) => {
        console.log(`\n${index + 1}. Excel第 ${student.excelRow} 行`)
        console.log(`   星球编号: ${student.studentId}`)
        console.log(`   星球昵称: ${student.starNick || '无'}`)
        console.log(`   手机号: ${student.phone || '无'}`)
      })
    }
    
  } catch (error) {
    console.error('查找失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

find3MissingUsers()