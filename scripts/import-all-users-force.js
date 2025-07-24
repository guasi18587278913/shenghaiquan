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

async function forceImportAllUsers() {
  console.log('💪 强制导入所有用户数据...\n')
  
  try {
    // 先删除所有非种子用户（可选）
    console.log('🗑️  清理旧数据...')
    await prisma.user.deleteMany({
      where: {
        AND: [
          { role: 'USER' },
          { NOT: { name: { in: ['刘小排', '王助教', '李助教'] } } }
        ]
      }
    })
    
    // 读取CSV
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    // 获取表头
    const headers = parseCSVLine(lines[0].replace(/^\uFEFF/, ''))
    console.log('📋 CSV列数:', headers.length)
    
    let successCount = 0
    let errorCount = 0
    let lineNumber = 0
    
    // 逐行处理
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line || !line.match(/^\d+,/)) continue
      
      lineNumber++
      
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
        
        // 确定用户名（优先使用星球昵称）
        const name = starNick || wechatNick || `用户${studentId}`
        
        // 创建唯一的登录ID
        let loginId
        if (phone && phone !== '无' && phone.length > 5) {
          loginId = phone
        } else if (studentId) {
          loginId = `S${studentId}` // 学号登录
        } else if (wechatId) {
          loginId = `wx_${wechatId}` // 微信ID登录
        } else {
          loginId = `user_${lineNumber}` // 序号登录
        }
        
        // 处理标签
        const tagArray = tags
          .split(/[,，;；、\/]+/)
          .map(t => t.trim())
          .filter(t => t && t !== '无')
          .slice(0, 5)
        
        // 创建用户
        const hashedPassword = await bcrypt.hash('deepsea2024', 10)
        
        await prisma.user.create({
          data: {
            name: name.substring(0, 50), // 限制长度
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
        
        if (successCount % 100 === 0) {
          console.log(`✅ 已导入 ${successCount} 条...`)
        }
        
      } catch (error) {
        errorCount++
        console.error(`❌ 第 ${lineNumber} 行导入失败:`, error.message)
      }
    }
    
    // 重新添加管理员和助教
    console.log('\n👑 恢复管理员和助教账号...')
    
    // 检查并创建管理员
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!adminExists) {
      await prisma.user.create({
        data: {
          name: '刘小排',
          phone: '13800000000',
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
          bio: '深海圈创始人，专注AI产品开发与商业化',
          avatar: '/avatars/admin.jpg',
          location: '北京',
          points: 9999,
          level: 99,
        }
      })
    }
    
    // 最终统计
    console.log('\n📊 导入完成！')
    console.log(`✅ 成功导入: ${successCount} 条`)
    console.log(`❌ 失败: ${errorCount} 条`)
    console.log(`📋 CSV数据行: ${lineNumber} 条`)
    
    const total = await prisma.user.count()
    const users = await prisma.user.count({ where: { role: 'USER' } })
    
    console.log(`\n👥 数据库统计:`)
    console.log(`  总用户数: ${total}`)
    console.log(`  普通用户: ${users}`)
    console.log(`  预期用户: 904`)
    console.log(`  完成度: ${Math.round(users / 904 * 100)}%`)
    
  } catch (error) {
    console.error('导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 确认执行
console.log('⚠️  警告：此操作将删除现有用户数据并重新导入！')
console.log('按 Ctrl+C 取消，或等待5秒继续...')

setTimeout(() => {
  forceImportAllUsers()
}, 5000)