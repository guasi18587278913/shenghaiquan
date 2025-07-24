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

async function findExact3Missing() {
  console.log('🔍 精确查找未导入的3个学员...\n')
  
  try {
    // 1. 获取所有导入用户的phone字段值
    const importedUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: new Date('2025-07-23') }
      },
      select: { phone: true }
    })
    
    // 创建已导入的phone集合
    const importedPhones = new Set(importedUsers.map(u => u.phone))
    console.log(`💾 数据库中今天导入的用户: ${importedUsers.length}`)
    
    // 提取所有使用星球编号的
    const importedStudentIds = new Set()
    importedUsers.forEach(u => {
      if (u.phone.startsWith('S')) {
        importedStudentIds.add(u.phone.substring(1))
      }
    })
    
    // 2. 读取CSV并逐行分析
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    const missingStudents = []
    let csvRowCount = 0
    let processedCount = 0
    
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
        
        // 确定这个用户在导入时会使用的phone值
        let expectedPhone = ''
        if (phone && phone !== '无' && phone.length > 5) {
          expectedPhone = phone
        } else if (studentId) {
          expectedPhone = `S${studentId}`
        } else if (wechatId) {
          expectedPhone = `wx_${wechatId}`
        } else {
          expectedPhone = `user_${processedCount + 1}`
        }
        
        processedCount++
        
        // 检查是否已导入
        if (!importedPhones.has(expectedPhone)) {
          missingStudents.push({
            excelRow: i + 1,
            csvRow: csvRowCount,
            studentId,
            wechatNick,
            starNick,
            wechatId,
            phone,
            expectedPhone,
            line: line
          })
        }
      } catch (error) {
        console.error(`解析第 ${i + 1} 行时出错:`, error.message)
      }
    }
    
    // 3. 显示结果
    console.log(`\n📋 CSV文件分析:`)
    console.log(`  总数据行: ${csvRowCount}`)
    console.log(`  已导入: ${csvRowCount - missingStudents.length}`)
    console.log(`  未导入: ${missingStudents.length}`)
    
    if (missingStudents.length === 3) {
      console.log('\n✅ 找到了未导入的3个学员！\n')
      console.log('═'.repeat(80))
      
      missingStudents.forEach((student, index) => {
        console.log(`\n${index + 1}. Excel第 ${student.excelRow} 行`)
        console.log('─'.repeat(40))
        console.log(`星球编号: ${student.studentId || '(空)'}`)
        console.log(`星球昵称: ${student.starNick || '(空)'}`)
        console.log(`微信昵称: ${student.wechatNick || '(空)'}`)
        console.log(`微信ID: ${student.wechatId || '(空)'}`)
        console.log(`手机号: ${student.phone || '(空)'}`)
        console.log(`预期登录ID: ${student.expectedPhone}`)
        console.log(`\n原始数据:`)
        console.log(student.line)
      })
      
      console.log('\n' + '═'.repeat(80))
      console.log('\n📌 这3个用户未能导入的可能原因:')
      console.log('1. 数据中存在特殊字符或格式问题')
      console.log('2. 必要字段（如名称）为空或无效')
      console.log('3. 数据重复或冲突')
      console.log('\n请将这3行的完整数据发给我，我来手动导入。')
    } else {
      console.log(`\n⚠️  发现 ${missingStudents.length} 个未导入的学员（预期是3个）`)
      
      if (missingStudents.length > 0 && missingStudents.length < 10) {
        console.log('\n所有未导入的学员:')
        missingStudents.forEach((student, index) => {
          console.log(`\n${index + 1}. Excel第 ${student.excelRow} 行`)
          console.log(`   星球编号: ${student.studentId}`)
          console.log(`   昵称: ${student.starNick || student.wechatNick}`)
          console.log(`   预期登录ID: ${student.expectedPhone}`)
        })
      }
    }
    
  } catch (error) {
    console.error('查找失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findExact3Missing()