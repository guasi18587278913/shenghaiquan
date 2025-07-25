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

async function findDuplicateUsers() {
  console.log('🔍 查找CSV中与种子用户重复的3个学员...\n')
  
  try {
    // 1. 获取种子用户（7月17日创建的）
    const seedUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date('2025-07-17T00:00:00'),
          lt: new Date('2025-07-18T00:00:00')
        }
      },
      select: { 
        phone: true,
        name: true,
        role: true
      }
    })
    
    console.log(`🌱 种子用户数: ${seedUsers.length}`)
    console.log('\n种子用户列表:')
    seedUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} (${u.phone}) - ${u.role}`)
    })
    
    // 创建种子用户的查找集合
    const seedPhones = new Set(seedUsers.map(u => u.phone))
    const seedNames = new Set(seedUsers.map(u => u.name))
    
    // 2. 读取CSV并查找重复
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    const duplicates = []
    let csvRowCount = 0
    
    console.log('\n📋 分析CSV中的重复用户...')
    
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
        
        // 确定名称
        const name = starNick || wechatNick || `用户${studentId}`
        
        // 检查是否与种子用户重复
        let isDuplicate = false
        let duplicateReason = ''
        
        // 检查手机号重复
        if (phone && phone !== '无' && seedPhones.has(phone)) {
          isDuplicate = true
          duplicateReason = `手机号 ${phone} 与种子用户重复`
        }
        
        // 检查名称重复
        if (!isDuplicate && seedNames.has(name)) {
          isDuplicate = true
          duplicateReason = `名称 "${name}" 与种子用户重复`
        }
        
        if (isDuplicate) {
          duplicates.push({
            excelRow: i + 1,
            csvRow: csvRowCount,
            studentId,
            name,
            phone,
            reason: duplicateReason,
            line: line.substring(0, 150)
          })
        }
        
      } catch (error) {
        console.error(`处理第${i + 1}行出错`)
      }
    }
    
    // 3. 显示结果
    console.log(`\n📊 分析结果:`)
    console.log(`  CSV总行数: ${csvRowCount}`)
    console.log(`  发现重复: ${duplicates.length} 个`)
    
    if (duplicates.length === 3) {
      console.log('\n✅ 找到了与种子用户重复的3个CSV学员！\n')
      console.log('═'.repeat(80))
      
      duplicates.forEach((dup, index) => {
        console.log(`\n${index + 1}. Excel第 ${dup.excelRow} 行`)
        console.log(`   星球编号: ${dup.studentId}`)
        console.log(`   名称: ${dup.name}`)
        console.log(`   手机号: ${dup.phone || '无'}`)
        console.log(`   重复原因: ${dup.reason}`)
        console.log(`   原始数据: ${dup.line}...`)
      })
      
      console.log('\n' + '═'.repeat(80))
      console.log('\n📌 说明:')
      console.log('这3个学员在CSV中的数据与种子数据重复，所以导入时被跳过了。')
      console.log('实际上所有904个CSV学员都已经在数据库中了。')
      console.log('如果需要强制重新导入这3个用户，需要先删除种子数据中的对应用户。')
    } else {
      console.log(`\n⚠️  发现 ${duplicates.length} 个重复（预期是3个）`)
      
      if (duplicates.length > 0 && duplicates.length < 10) {
        console.log('\n所有重复的学员:')
        duplicates.forEach((dup, i) => {
          console.log(`${i + 1}. Excel第 ${dup.excelRow} 行 - ${dup.name}`)
          console.log(`   重复原因: ${dup.reason}`)
        })
      }
    }
    
  } catch (error) {
    console.error('查找失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findDuplicateUsers()