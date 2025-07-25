const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
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

async function importRemainingUsers() {
  console.log('🔍 导入剩余的用户数据...\n')
  
  try {
    // 获取已存在的用户
    const existingUsers = await prisma.user.findMany({
      select: { phone: true, name: true }
    })
    
    const existingPhones = new Set(existingUsers.map(u => u.phone))
    const existingNames = new Set(existingUsers.map(u => u.name))
    
    console.log(`💾 数据库现有用户: ${existingUsers.length}`)
    
    // 读取CSV
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    // 获取表头
    const headers = parseCSVLine(lines[0].replace(/^\uFEFF/, ''))
    
    let totalCSVUsers = 0
    let attemptCount = 0
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const errorDetails = []
    
    // 逐行处理
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || !line.match(/^\d+,/)) continue
      
      totalCSVUsers++
      
      try {
        const values = parseCSVLine(line)
        
        // 映射字段
        const studentId = values[0]?.trim() || ''
        const wechatNick = values[1]?.trim() || ''
        const starNick = values[2]?.trim() || ''
        const wechatId = values[3]?.trim() || ''
        const avatar = values[4]?.trim() || ''
        const industry = values[5]?.trim() || ''
        const identity = values[6]?.trim() || ''
        const intro = values[7]?.trim() || ''
        const tags = values[8]?.trim() || ''
        const city = values[9]?.trim() || ''
        const resources = values[10]?.trim() || ''
        const phone = values[11]?.trim() || ''
        
        // 确定用户名
        const name = starNick || wechatNick || `用户${studentId}`
        
        // 创建唯一的登录ID
        let loginId
        if (phone && phone !== '无' && phone.length > 5) {
          loginId = phone
        } else if (studentId) {
          loginId = `S${studentId}`
        } else if (wechatId) {
          loginId = `wx_${wechatId}`
        } else {
          loginId = `user_${totalCSVUsers}`
        }
        
        // 检查是否已存在
        if (existingPhones.has(loginId) || existingNames.has(name)) {
          skipCount++
          continue
        }
        
        attemptCount++
        
        // 处理标签
        const tagArray = tags
          .split(/[,，;；、\/]+/)
          .map(t => t.trim())
          .filter(t => t && t !== '无')
          .slice(0, 5)
        
        // 创建用户
        const hashedPassword = await bcrypt.hash('deepsea2024', 10)
        
        const newUser = await prisma.user.create({
          data: {
            name: name.substring(0, 50),
            phone: loginId,
            password: hashedPassword,
            avatar: avatar || null,
            bio: intro.substring(0, 500),
            skills: JSON.stringify(tagArray),
            location: city || '未知',
            company: industry || '',
            position: identity || '',
            role: 'USER',
            points: 100,
            level: 1,
          }
        })
        
        successCount++
        console.log(`✅ 导入成功 [${successCount}]: ${name} (${loginId})`)
        
        // 添加到已存在集合，避免重复
        existingPhones.add(loginId)
        existingNames.add(name)
        
      } catch (error) {
        errorCount++
        errorDetails.push({
          line: i + 1,
          name: values[2] || values[1] || '未知',
          error: error.message
        })
      }
    }
    
    // 最终统计
    console.log('\n📊 导入完成！')
    console.log(`📋 CSV总用户数: ${totalCSVUsers}`)
    console.log(`🔍 尝试导入: ${attemptCount} 条`)
    console.log(`✅ 成功导入: ${successCount} 条`)
    console.log(`⏭️  已存在跳过: ${skipCount} 条`)
    console.log(`❌ 失败: ${errorCount} 条`)
    
    if (errorDetails.length > 0) {
      console.log('\n❌ 错误详情:')
      errorDetails.slice(0, 5).forEach(e => {
        console.log(`  行${e.line}: ${e.name} - ${e.error}`)
      })
      if (errorDetails.length > 5) {
        console.log(`  ... 还有 ${errorDetails.length - 5} 个错误`)
      }
    }
    
    const total = await prisma.user.count()
    console.log(`\n👥 数据库总用户数: ${total}`)
    console.log(`📈 导入完成度: ${Math.round((total - 18) / totalCSVUsers * 100)}%`)
    
    if (total < totalCSVUsers + 18) {
      console.log(`\n💡 提示: 还有 ${totalCSVUsers + 18 - total} 个用户未导入`)
      console.log('可能原因: 数据格式问题或缺少必要信息')
    }
    
  } catch (error) {
    console.error('导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importRemainingUsers()