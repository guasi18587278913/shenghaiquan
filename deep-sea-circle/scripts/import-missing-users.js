const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// 更准确的CSV解析函数
function parseCSV(content) {
  content = content.replace(/^\uFEFF/, '')
  const lines = content.split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',').map(h => h.trim())
  const data = []
  let currentRow = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    
    // 如果行以数字开头（星球编号），认为是新行
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
  
  // 处理最后一行
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

async function importMissingUsers() {
  console.log('🔍 开始查找未导入的用户...')
  
  try {
    // 读取CSV文件
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const csvUsers = parseCSV(csvContent)
    
    console.log(`📄 CSV文件中的用户数: ${csvUsers.length}`)
    
    // 获取数据库中所有用户
    const dbUsers = await prisma.user.findMany({
      select: { phone: true, name: true }
    })
    
    console.log(`💾 数据库中的用户数: ${dbUsers.length}`)
    
    // 创建已存在用户的集合（用于快速查找）
    const existingPhones = new Set(dbUsers.map(u => u.phone))
    const existingNames = new Set(dbUsers.map(u => u.name))
    
    let attemptCount = 0
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    // 遍历CSV用户，找出未导入的
    for (const [index, csvUser] of csvUsers.entries()) {
      const phone = csvUser['手机号']?.toString().trim()
      const name = csvUser['星球昵称']?.trim() || csvUser['微信昵称']?.trim()
      const studentId = csvUser['星球编号']?.toString().trim()
      
      // 跳过没有名字的记录
      if (!name) {
        continue
      }
      
      // 构建登录ID
      const loginId = phone || (studentId ? `S${studentId}` : `wx_${csvUser['微信ID']?.trim() || index}`)
      
      // 检查是否已存在
      if (existingPhones.has(loginId) || existingNames.has(name)) {
        continue
      }
      
      attemptCount++
      
      try {
        // 处理标签
        const tagString = csvUser['个人标签'] || ''
        const tags = tagString
          .split(/[,，;；、\/]+/)
          .map(t => t.trim())
          .filter(t => t && t !== '无' && t.length > 0)
          .slice(0, 5)
        
        const skillsJson = JSON.stringify(tags)
        
        // 其他字段
        const location = csvUser['城市']?.trim() || '未知'
        const bio = (csvUser['自我介绍']?.trim() || '').substring(0, 500)
        const industry = csvUser['行业']?.trim() || ''
        const identity = csvUser['身份']?.trim() || ''
        
        // 创建用户
        const hashedPassword = await bcrypt.hash('deepsea2024', 10)
        
        await prisma.user.create({
          data: {
            name: name,
            phone: loginId,
            password: hashedPassword,
            avatar: csvUser['星球头像']?.trim() || null,
            bio: bio,
            skills: skillsJson,
            location: location,
            company: industry,
            position: identity,
            role: 'USER',
            points: 100,
            level: 1,
          }
        })
        
        successCount++
        console.log(`✅ 成功导入: ${name} (${loginId})`)
        
      } catch (error) {
        if (error.code === 'P2002') {
          skipCount++
          console.log(`⚠️  用户已存在: ${name}`)
        } else {
          errorCount++
          console.error(`❌ 导入失败: ${name} - ${error.message}`)
        }
      }
    }
    
    // 最终统计
    console.log('\n📊 补充导入完成！')
    console.log(`🔍 尝试导入: ${attemptCount} 条`)
    console.log(`✅ 成功导入: ${successCount} 条`)
    console.log(`⏭️  已存在: ${skipCount} 条`)
    console.log(`❌ 失败: ${errorCount} 条`)
    
    const totalUsers = await prisma.user.count()
    console.log(`\n👥 数据库总用户数: ${totalUsers}`)
    
    // 验证是否达到904
    const expectedTotal = 904 + 18 // CSV用户 + 种子数据
    if (totalUsers < expectedTotal) {
      console.log(`\n⚠️  还差 ${expectedTotal - totalUsers} 个用户未导入`)
      console.log('可能原因：')
      console.log('1. 某些用户缺少必要信息（如姓名）')
      console.log('2. 存在重复数据')
      console.log('3. 数据格式问题')
    } else {
      console.log('\n✅ 所有用户已成功导入！')
    }
    
  } catch (error) {
    console.error('❌ 导入过程出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行补充导入
importMissingUsers()