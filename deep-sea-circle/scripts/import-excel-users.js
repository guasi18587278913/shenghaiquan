const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

async function importFromExcel() {
  console.log('📊 深海圈 Excel 用户导入工具')
  console.log('─'.repeat(50))
  
  try {
    // 读取Excel文件
    const excelPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .xlsx')
    console.log(`📖 读取文件: ${excelPath}`)
    
    const workbook = XLSX.readFile(excelPath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // 转换为JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      raw: false,
      defval: '' 
    })
    
    console.log(`✅ 成功读取 ${data.length} 条数据`)
    
    // 显示前3条数据预览
    console.log('\n📋 数据预览（前3条）：')
    data.slice(0, 3).forEach((row, index) => {
      console.log(`${index + 1}. ${JSON.stringify(row).substring(0, 100)}...`)
    })
    
    // 显示列名
    if (data.length > 0) {
      console.log('\n📋 检测到的列名：')
      Object.keys(data[0]).forEach(key => {
        console.log(`   - ${key}`)
      })
    }
    
    // 默认密码
    const defaultPassword = await bcrypt.hash('deep123456', 10)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const errors = []
    
    console.log('\n🚀 开始导入用户...')
    
    for (const [index, row] of data.entries()) {
      try {
        // 根据用户提供的具体列名读取数据
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
        
        // 必须有名字
        if (!name || name.trim() === '') {
          skipCount++
          continue
        }
        
        // 生成唯一标识
        const uniquePhone = phone || (studentId ? `S${studentId}` : `U${index + 1}`)
        
        // 检查是否已存在
        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: uniquePhone },
              { name: name.trim() }
            ]
          }
        })
        
        if (existing) {
          skipCount++
          continue
        }
        
        // 创建用户，将微信ID和可提供的资源合并到bio中
        const bioContent = []
        if (bio?.trim()) bioContent.push(bio.trim())
        if (wechatId?.trim()) bioContent.push(`微信ID: ${wechatId.trim()}`)
        if (resources?.trim()) bioContent.push(`可提供的资源: ${resources.trim()}`)
        
        await prisma.user.create({
          data: {
            name: name.trim(),
            phone: uniquePhone,
            email: wechatId?.trim() ? `${wechatId.trim()}@deepseacircle.com` : (studentId ? `${studentId}@deepseacircle.com` : null),
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
        
        successCount++
        
        if (successCount % 50 === 0) {
          console.log(`   ✅ 已导入 ${successCount} 个用户...`)
        }
        
      } catch (error) {
        errorCount++
        errors.push({
          row: index + 2,
          name: row['星球昵称'] || '未知',
          error: error.message
        })
      }
    }
    
    // 显示结果
    const finalCount = await prisma.user.count()
    
    console.log('\n📊 导入完成！')
    console.log(`   ✅ 成功导入: ${successCount} 个用户`)
    console.log(`   ⏭️ 跳过已存在: ${skipCount} 个`)
    console.log(`   ❌ 导入失败: ${errorCount} 个`)
    console.log(`   👥 数据库总用户数: ${finalCount}`)
    
    // 显示错误详情
    if (errors.length > 0) {
      console.log('\n❌ 错误详情（前5条）：')
      errors.slice(0, 5).forEach(e => {
        console.log(`   行 ${e.row}: ${e.name} - ${e.error}`)
      })
      if (errors.length > 5) {
        console.log(`   ... 还有 ${errors.length - 5} 个错误`)
      }
    }
    
    // 验证是否达到904个用户
    const expectedTotal = 904 + 1 // 904个用户 + 1个管理员
    if (finalCount === expectedTotal) {
      console.log('\n✅ 完美！已成功导入所有904个用户！')
    } else if (finalCount < expectedTotal) {
      console.log(`\n⚠️ 注意：预期 ${expectedTotal} 个用户，实际只有 ${finalCount} 个`)
      console.log(`   缺少 ${expectedTotal - finalCount} 个用户`)
    }
    
  } catch (error) {
    console.error('❌ 导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行导入
importFromExcel()