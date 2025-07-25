const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// 简单的CSV解析
function parseCSV(content) {
  content = content.replace(/^\uFEFF/, '')
  const lines = content.split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',')
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      data.push(row)
    }
  }
  
  return data
}

async function checkMissingUsers() {
  try {
    // 读取CSV文件
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const csvUsers = parseCSV(csvContent)
    
    console.log(`📄 CSV文件中的用户数: ${csvUsers.length}`)
    
    // 获取数据库中所有用户的手机号
    const dbUsers = await prisma.user.findMany({
      select: { phone: true, name: true }
    })
    
    console.log(`💾 数据库中的用户数: ${dbUsers.length}`)
    
    // 找出CSV中有但数据库中没有的用户
    const dbPhones = new Set(dbUsers.map(u => u.phone))
    const missing = []
    
    for (const csvUser of csvUsers) {
      const phone = csvUser['手机号']?.toString().trim()
      const studentId = csvUser['星球编号']?.toString().trim()
      const wechatId = csvUser['微信ID']?.trim()
      
      // 构建可能的登录ID
      const possibleIds = [
        phone,
        studentId ? `S${studentId}` : null,
        wechatId ? `wx_${wechatId}` : null
      ].filter(id => id)
      
      // 检查是否有任何一个ID在数据库中
      const exists = possibleIds.some(id => dbPhones.has(id))
      
      if (!exists && csvUser['星球昵称']) {
        missing.push({
          name: csvUser['星球昵称'] || csvUser['微信昵称'],
          phone: phone || '无',
          studentId: studentId || '无'
        })
      }
    }
    
    console.log(`\n❓ 未导入的用户数: ${missing.length}`)
    
    if (missing.length > 0) {
      console.log('\n未导入的用户列表:')
      missing.slice(0, 10).forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} - 手机:${user.phone} - 编号:${user.studentId}`)
      })
      
      if (missing.length > 10) {
        console.log(`... 还有 ${missing.length - 10} 个用户未显示`)
      }
    }
    
  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMissingUsers()