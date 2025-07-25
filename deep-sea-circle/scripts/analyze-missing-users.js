const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function parseCSV(content) {
  content = content.replace(/^\uFEFF/, '')
  const lines = content.split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  let currentRow = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    
    if (/^\d+,/.test(line)) {
      if (currentRow.length > 0) {
        const values = currentRow.join('\n').split(',')
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }
      currentRow = [line]
    } else if (currentRow.length > 0) {
      currentRow.push(line)
    }
  }
  
  if (currentRow.length > 0) {
    const values = currentRow.join('\n').split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    data.push(row)
  }
  
  return data
}

async function analyzeMissingUsers() {
  console.log('🔍 分析未导入用户的详细原因...\n')
  
  try {
    // 读取CSV
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const csvUsers = parseCSV(csvContent)
    
    // 获取数据库中所有用户的标识
    const dbUsers = await prisma.user.findMany({
      select: { phone: true, name: true }
    })
    
    const existingIds = new Set(dbUsers.map(u => u.phone))
    const existingNames = new Set(dbUsers.map(u => u.name))
    
    // 分类统计
    const missing = {
      noName: [],        // 缺少姓名
      duplicate: [],     // 重复数据
      noIdentifier: [],  // 缺少任何标识符
      other: []          // 其他原因
    }
    
    // 分析每条CSV数据
    csvUsers.forEach((csvUser, index) => {
      const phone = csvUser['手机号']?.toString().trim()
      const name = csvUser['星球昵称']?.trim() || csvUser['微信昵称']?.trim()
      const studentId = csvUser['星球编号']?.toString().trim()
      const wechatId = csvUser['微信ID']?.trim()
      
      // 构建可能的登录ID
      const loginId = phone || (studentId ? `S${studentId}` : `wx_${wechatId || index}`)
      
      // 检查是否已导入
      if (!existingIds.has(loginId) && !existingNames.has(name)) {
        // 分析未导入原因
        if (!name) {
          missing.noName.push({
            row: index + 2, // Excel行号（+1是表头，+1是从1开始）
            studentId,
            phone,
            wechatId
          })
        } else if (!phone && !studentId && !wechatId) {
          missing.noIdentifier.push({
            row: index + 2,
            name
          })
        } else {
          // 可能是其他原因，打印详情
          missing.other.push({
            row: index + 2,
            name,
            loginId,
            phone: phone || '无',
            studentId: studentId || '无'
          })
        }
      }
    })
    
    // 打印分析结果
    console.log('📊 未导入用户分析结果：')
    console.log('─'.repeat(50))
    
    if (missing.noName.length > 0) {
      console.log(`\n❌ 缺少姓名: ${missing.noName.length} 条`)
      console.log('前5条记录：')
      missing.noName.slice(0, 5).forEach(u => {
        console.log(`  行${u.row}: 学号=${u.studentId || '无'}, 手机=${u.phone || '无'}`)
      })
    }
    
    if (missing.noIdentifier.length > 0) {
      console.log(`\n❌ 缺少标识符: ${missing.noIdentifier.length} 条`)
      console.log('前5条记录：')
      missing.noIdentifier.slice(0, 5).forEach(u => {
        console.log(`  行${u.row}: ${u.name}`)
      })
    }
    
    if (missing.other.length > 0) {
      console.log(`\n❓ 其他原因: ${missing.other.length} 条`)
      console.log('详细信息：')
      missing.other.forEach(u => {
        console.log(`  行${u.row}: ${u.name}`)
        console.log(`    登录ID: ${u.loginId}`)
        console.log(`    手机: ${u.phone}, 学号: ${u.studentId}`)
      })
    }
    
    const totalMissing = missing.noName.length + missing.noIdentifier.length + missing.other.length
    console.log(`\n📊 总计未导入: ${totalMissing} 条`)
    
    // 尝试强制导入"其他原因"的用户
    if (missing.other.length > 0) {
      console.log('\n🔧 尝试强制导入"其他原因"类别的用户...')
      
      for (const user of missing.other) {
        // 这里可以尝试强制导入
        console.log(`尝试导入: ${user.name} (${user.loginId})`)
      }
    }
    
  } catch (error) {
    console.error('分析失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeMissingUsers()