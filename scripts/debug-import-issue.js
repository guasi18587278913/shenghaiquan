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

async function debugImportIssue() {
  console.log('🔍 调试导入问题...\n')
  
  try {
    // 1. 获取所有导入的用户
    const allUsers = await prisma.user.findMany({
      select: { 
        phone: true,
        name: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    })
    
    // 分离种子用户和导入用户
    const seedUsers = []
    const importedUsers = []
    
    allUsers.forEach(u => {
      if (u.createdAt < new Date('2025-07-23')) {
        seedUsers.push(u)
      } else {
        importedUsers.push(u)
      }
    })
    
    console.log(`📊 用户分析:`)
    console.log(`  种子用户: ${seedUsers.length}`)
    console.log(`  导入用户: ${importedUsers.length}`)
    console.log(`  总计: ${allUsers.length}`)
    
    // 2. 创建已导入用户的映射
    const phoneMap = new Map()
    const nameMap = new Map()
    
    importedUsers.forEach(u => {
      phoneMap.set(u.phone, u)
      nameMap.set(u.name, u)
    })
    
    // 3. 读取CSV并分析
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    let csvRowCount = 0
    let foundCount = 0
    let notFoundCount = 0
    const notFoundStudents = []
    
    console.log('\n📋 开始逐行分析CSV...')
    
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
        
        // 尝试匹配
        let found = false
        let matchedBy = ''
        
        // 1. 尝试用手机号匹配
        if (phone && phone !== '无' && phone.length > 5) {
          if (phoneMap.has(phone)) {
            found = true
            matchedBy = `手机号: ${phone}`
          }
        }
        
        // 2. 尝试用星球编号匹配
        if (!found && studentId) {
          if (phoneMap.has(`S${studentId}`)) {
            found = true
            matchedBy = `星球编号: S${studentId}`
          }
        }
        
        // 3. 尝试用名称匹配
        if (!found) {
          const possibleName = starNick || wechatNick || `用户${studentId}`
          if (nameMap.has(possibleName)) {
            found = true
            matchedBy = `名称: ${possibleName}`
          }
        }
        
        if (found) {
          foundCount++
        } else {
          notFoundCount++
          notFoundStudents.push({
            row: i + 1,
            studentId,
            starNick: starNick || '(空)',
            wechatNick: wechatNick || '(空)',
            phone: phone || '(空)'
          })
        }
        
      } catch (error) {
        console.error(`处理第${i + 1}行出错`)
      }
    }
    
    console.log(`\n📊 CSV分析结果:`)
    console.log(`  CSV总行数: ${csvRowCount}`)
    console.log(`  找到匹配: ${foundCount}`)
    console.log(`  未找到匹配: ${notFoundCount}`)
    
    if (notFoundCount === 3) {
      console.log('\n✅ 确认！未导入的3个学员是:\n')
      notFoundStudents.forEach((s, i) => {
        console.log(`${i + 1}. Excel第 ${s.row} 行`)
        console.log(`   星球编号: ${s.studentId}`)
        console.log(`   星球昵称: ${s.starNick}`)
        console.log(`   微信昵称: ${s.wechatNick}`)
        console.log(`   手机号: ${s.phone}`)
        console.log('')
      })
    } else if (notFoundCount > 0 && notFoundCount < 10) {
      console.log('\n未找到匹配的学员:')
      notFoundStudents.forEach((s, i) => {
        console.log(`${i + 1}. Excel第 ${s.row} 行 - ${s.starNick || s.wechatNick}`)
      })
    }
    
    // 4. 最后验证
    console.log('\n🔢 最终验证:')
    console.log(`  数据库总用户: ${allUsers.length}`)
    console.log(`  种子用户: ${seedUsers.length}`)
    console.log(`  CSV用户: ${csvRowCount}`)
    console.log(`  预期总数: ${seedUsers.length + csvRowCount} = ${seedUsers.length + csvRowCount}`)
    console.log(`  实际总数: ${allUsers.length}`)
    console.log(`  差异: ${seedUsers.length + csvRowCount - allUsers.length}`)
    
  } catch (error) {
    console.error('调试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugImportIssue()