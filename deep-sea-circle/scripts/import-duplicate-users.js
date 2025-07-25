const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

async function importDuplicateUsers() {
  console.log('🔄 导入重复名字的用户')
  console.log('─'.repeat(50))
  
  try {
    // 读取Excel文件
    const excelPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .xlsx')
    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 转换为JSON
    const excelData = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: '' 
    })
    
    // 获取数据库中所有用户
    const dbUsers = await prisma.user.findMany({
      select: {
        name: true,
        phone: true
      }
    })
    
    const dbUserNames = new Set(dbUsers.map(u => u.name))
    const dbUserPhones = new Set(dbUsers.map(u => u.phone))
    
    // 找出重复的名字
    const nameCount = {}
    const duplicateNames = []
    
    excelData.forEach(row => {
      const name = row['星球昵称']
      if (name && name.trim()) {
        nameCount[name] = (nameCount[name] || 0) + 1
      }
    })
    
    Object.entries(nameCount).forEach(([name, count]) => {
      if (count > 1) {
        duplicateNames.push(name)
      }
    })
    
    console.log(`🔄 找到 ${duplicateNames.length} 个重复的名字：`)
    duplicateNames.forEach(name => {
      console.log(`   - "${name}" (出现 ${nameCount[name]} 次)`)
    })
    
    // 默认密码
    const defaultPassword = await bcrypt.hash('deep123456', 10)
    
    let importCount = 0
    let skipCount = 0
    
    console.log('\n🚀 开始导入重复名字的用户...')
    
    // 对于每个重复的名字，导入所有实例（第一个可能已经存在）
    for (const row of excelData) {
      const studentId = row['星球编号']
      const name = row['星球昵称']
      const wechatId = row['微信ID']
      const avatar = row['星球头像']
      const industry = row['行业']
      const identity = row['身份']
      const bio = row['自我介绍']
      const tags = row['个人标签']
      const location = row['城市']
      const resources = row['可提供的资源']
      const phone = row['手机号']
      const currentIdentity = row['你现在的身份']
      
      // 只处理重复的名字
      if (!duplicateNames.includes(name)) {
        continue
      }
      
      // 生成唯一的名字（添加星球编号）
      const uniqueName = `${name}_${studentId}`
      const uniquePhone = phone || (studentId ? `S${studentId}` : null)
      
      // 检查原始名字是否已存在
      if (dbUserNames.has(name) && !dbUserNames.has(uniqueName)) {
        // 如果原始名字存在但带编号的不存在，则创建带编号的
        try {
          // 构建bio内容
          const bioContent = []
          if (bio?.trim()) bioContent.push(bio.trim())
          if (wechatId?.trim()) bioContent.push(`微信ID: ${wechatId.trim()}`)
          if (resources?.trim()) bioContent.push(`可提供的资源: ${resources.trim()}`)
          
          await prisma.user.create({
            data: {
              name: uniqueName,
              phone: uniquePhone,
              email: wechatId?.trim() ? `${wechatId.trim()}@deepseacircle.com` : 
                     (studentId ? `${studentId}@deepseacircle.com` : null),
              password: defaultPassword,
              bio: bioContent.length > 0 ? bioContent.join('\n') : null,
              location: location?.trim() || null,
              company: industry?.trim() || null,
              position: identity?.trim() || currentIdentity?.trim() || null,
              avatar: avatar?.trim() || null,
              skills: tags ? JSON.stringify([tags]) : null,
              role: 'USER',
              level: 1,
              points: 0,
              isActive: true
            }
          })
          
          importCount++
          console.log(`   ✅ 导入: ${uniqueName}`)
        } catch (error) {
          console.log(`   ❌ 导入失败 ${uniqueName}: ${error.message}`)
        }
      } else if (!dbUserNames.has(name) && !dbUserPhones.has(uniquePhone)) {
        // 如果原始名字不存在，使用原始名字
        try {
          const bioContent = []
          if (bio?.trim()) bioContent.push(bio.trim())
          if (wechatId?.trim()) bioContent.push(`微信ID: ${wechatId.trim()}`)
          if (resources?.trim()) bioContent.push(`可提供的资源: ${resources.trim()}`)
          
          await prisma.user.create({
            data: {
              name: name,
              phone: uniquePhone,
              email: wechatId?.trim() ? `${wechatId.trim()}@deepseacircle.com` : 
                     (studentId ? `${studentId}@deepseacircle.com` : null),
              password: defaultPassword,
              bio: bioContent.length > 0 ? bioContent.join('\n') : null,
              location: location?.trim() || null,
              company: industry?.trim() || null,
              position: identity?.trim() || currentIdentity?.trim() || null,
              avatar: avatar?.trim() || null,
              skills: tags ? JSON.stringify([tags]) : null,
              role: 'USER',
              level: 1,
              points: 0,
              isActive: true
            }
          })
          
          importCount++
          console.log(`   ✅ 导入: ${name}`)
          
          // 更新集合
          dbUserNames.add(name)
          dbUserPhones.add(uniquePhone)
        } catch (error) {
          console.log(`   ❌ 导入失败 ${name}: ${error.message}`)
        }
      } else {
        skipCount++
      }
    }
    
    // 显示最终结果
    const finalCount = await prisma.user.count()
    
    console.log('\n📊 导入完成！')
    console.log(`   ✅ 成功导入: ${importCount} 个用户`)
    console.log(`   ⏭️ 跳过: ${skipCount} 个`)
    console.log(`   👥 数据库总用户数: ${finalCount}`)
    
    if (finalCount === 905) {
      console.log('\n🎉 完美！现在数据库中有完整的904个用户 + 1个管理员！')
    }
    
  } catch (error) {
    console.error('❌ 导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importDuplicateUsers()