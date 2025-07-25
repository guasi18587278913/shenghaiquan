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

async function importFinal3Users() {
  console.log('🔍 导入最后3个学员...\n')
  
  try {
    // 1. 获取已导入的用户
    const existingUsers = await prisma.user.findMany({
      where: {
        createdAt: { gte: new Date('2025-07-23') }
      },
      select: { phone: true }
    })
    
    const existingPhones = new Set(existingUsers.map(u => u.phone))
    console.log(`💾 已导入的用户数: ${existingUsers.length}`)
    
    // 2. 读取CSV
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    let csvRowCount = 0
    let notImportedCount = 0
    const notImported = []
    let importedCount = 0
    
    // 3. 逐行检查并导入
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
        const avatar = values[4]?.trim() || ''
        const industry = values[5]?.trim() || ''
        const identity = values[6]?.trim() || ''
        const intro = values[7]?.trim() || ''
        const tags = values[8]?.trim() || ''
        const city = values[9]?.trim() || ''
        const resources = values[10]?.trim() || ''
        const phone = values[11]?.trim() || ''
        
        // 确定登录ID
        let loginId
        if (phone && phone !== '无' && phone.length > 5) {
          loginId = phone
        } else if (studentId) {
          loginId = `S${studentId}`
        } else if (wechatId) {
          loginId = `wx_${wechatId}`
        } else {
          loginId = `user_${csvRowCount}`
        }
        
        // 检查是否已存在
        if (existingPhones.has(loginId)) {
          continue
        }
        
        notImportedCount++
        
        // 确定用户名
        const name = starNick || wechatNick || `用户${studentId}`
        
        // 如果是前3个未导入的，尝试导入
        if (notImportedCount <= 3) {
          console.log(`\n尝试导入第${notImportedCount}个未导入用户:`)
          console.log(`  Excel行: ${i + 1}`)
          console.log(`  星球编号: ${studentId}`)
          console.log(`  名称: ${name}`)
          console.log(`  登录ID: ${loginId}`)
          
          try {
            // 处理标签
            const tagArray = tags
              .split(/[,，;；、\\/]+/)
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
            
            importedCount++
            console.log(`  ✅ 导入成功！`)
            
            // 添加到已存在集合
            existingPhones.add(loginId)
            
          } catch (error) {
            console.log(`  ❌ 导入失败: ${error.message}`)
            notImported.push({
              row: i + 1,
              studentId,
              name,
              error: error.message
            })
          }
        } else {
          // 收集信息但不导入
          notImported.push({
            row: i + 1,
            studentId,
            name,
            loginId
          })
        }
        
      } catch (error) {
        console.error(`解析第 ${i + 1} 行时出错`)
      }
    }
    
    // 4. 显示最终结果
    console.log('\n' + '═'.repeat(60))
    console.log('📊 导入完成统计:')
    console.log(`  CSV总行数: ${csvRowCount}`)
    console.log(`  之前已导入: ${existingUsers.length}`)
    console.log(`  本次成功导入: ${importedCount}`)
    console.log(`  未能导入: ${notImported.length}`)
    
    const totalNow = await prisma.user.count()
    console.log(`\n  数据库总用户数: ${totalNow}`)
    
    if (importedCount === 3) {
      console.log('\n✅ 成功导入了最后3个学员！')
      console.log('现在所有904个CSV学员都已导入完成。')
    } else if (notImported.length > 0) {
      console.log('\n❌ 仍有学员未能导入:')
      notImported.slice(0, 5).forEach(u => {
        console.log(`  Excel第${u.row}行 - ${u.name} (${u.error || '未尝试'})`)
      })
    }
    
  } catch (error) {
    console.error('导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importFinal3Users()