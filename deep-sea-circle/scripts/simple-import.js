const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const csv = require('csv-parse/sync')

const prisma = new PrismaClient()

async function importUsers(csvFile) {
  console.log('📥 深海圈用户导入工具')
  console.log('─'.repeat(50))
  
  try {
    // 读取CSV文件
    const csvPath = path.join(process.cwd(), csvFile)
    if (!fs.existsSync(csvPath)) {
      console.error('❌ 找不到文件:', csvPath)
      return
    }
    
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    
    // 解析CSV
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    })
    
    console.log(`\n📊 解析到 ${records.length} 条记录`)
    
    // 显示当前状态
    const currentCount = await prisma.user.count()
    console.log(`📊 当前数据库用户数: ${currentCount}`)
    
    // 默认密码
    const defaultPassword = await bcrypt.hash('deep123456', 10)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    console.log('\n🚀 开始导入...')
    
    for (const [index, record] of records.entries()) {
      try {
        // 提取字段（根据你的CSV格式调整）
        const name = record['姓名'] || record['星球昵称'] || record['微信昵称'] || record['name']
        const phone = record['手机号'] || record['电话'] || record['phone'] || `user${index + 1}`
        const email = record['邮箱'] || record['email'] || null
        const location = record['城市'] || record['地区'] || record['location'] || null
        const bio = record['自我介绍'] || record['简介'] || record['bio'] || null
        
        if (!name) {
          skipCount++
          continue
        }
        
        // 检查是否已存在
        const exists = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: phone },
              { name: name }
            ]
          }
        })
        
        if (exists) {
          skipCount++
          continue
        }
        
        // 创建用户
        await prisma.user.create({
          data: {
            name: name.trim(),
            phone: phone.toString().trim(),
            email: email?.trim(),
            password: defaultPassword,
            bio: bio?.trim(),
            location: location?.trim(),
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
        console.error(`   ❌ 导入失败 [行 ${index + 2}]: ${error.message}`)
      }
    }
    
    // 显示结果
    const finalCount = await prisma.user.count()
    
    console.log('\n📊 导入完成！')
    console.log(`   ✅ 成功导入: ${successCount}`)
    console.log(`   ⏭️ 跳过: ${skipCount}`)
    console.log(`   ❌ 失败: ${errorCount}`)
    console.log(`   📊 数据库总用户数: ${finalCount}`)
    
  } catch (error) {
    console.error('❌ 导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 获取命令行参数
const csvFile = process.argv[2]
if (!csvFile) {
  console.log('使用方法: node scripts/simple-import.js <CSV文件路径>')
  console.log('例如: node scripts/simple-import.js data/users.csv')
} else {
  importUsers(csvFile)
}