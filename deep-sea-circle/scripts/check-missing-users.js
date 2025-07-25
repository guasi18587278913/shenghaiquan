const { PrismaClient } = require('@prisma/client')
const XLSX = require('xlsx')
const path = require('path')

const prisma = new PrismaClient()

async function findMissingUsers() {
  console.log('🔍 检查缺失的用户数据')
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
    
    console.log(`📊 Excel文件中的总记录数: ${excelData.length}`)
    
    // 获取数据库中所有用户
    const dbUsers = await prisma.user.findMany({
      select: {
        name: true,
        phone: true,
        email: true
      }
    })
    
    console.log(`💾 数据库中的总用户数: ${dbUsers.length}`)
    console.log('')
    
    // 创建数据库用户的查找集合
    const dbUserNames = new Set(dbUsers.map(u => u.name))
    const dbUserPhones = new Set(dbUsers.map(u => u.phone))
    
    // 查找缺失的用户
    const missingUsers = []
    const duplicateUsers = []
    const emptyNameUsers = []
    
    for (const [index, row] of excelData.entries()) {
      const studentId = row['星球编号']
      const name = row['星球昵称']
      const wechatId = row['微信ID']
      const phone = row['手机号']
      
      // 检查是否有空名字
      if (!name || name.trim() === '') {
        emptyNameUsers.push({
          row: index + 2, // Excel行号（加上表头）
          studentId,
          wechatId,
          phone
        })
        continue
      }
      
      // 生成与导入脚本相同的phone值
      const uniquePhone = phone || (studentId ? `S${studentId}` : `U${index + 1}`)
      
      // 检查是否在数据库中
      if (!dbUserNames.has(name.trim()) && !dbUserPhones.has(uniquePhone)) {
        missingUsers.push({
          row: index + 2,
          studentId,
          name,
          phone: uniquePhone,
          wechatId
        })
      }
      
      // 检查重复
      const duplicateCount = excelData.filter(r => r['星球昵称'] === name).length
      if (duplicateCount > 1 && !duplicateUsers.some(d => d.name === name)) {
        duplicateUsers.push({
          name,
          count: duplicateCount
        })
      }
    }
    
    // 显示结果
    console.log('📋 分析结果：')
    console.log(`   ✅ 成功导入: ${dbUsers.length - 1} 个用户（不含管理员）`)
    console.log(`   ❌ 缺失用户: ${missingUsers.length} 个`)
    console.log(`   🚫 空名字记录: ${emptyNameUsers.length} 个`)
    console.log(`   🔄 重复名字: ${duplicateUsers.length} 组`)
    
    // 显示缺失用户详情
    if (missingUsers.length > 0) {
      console.log('\n❌ 缺失的用户（前10个）：')
      missingUsers.slice(0, 10).forEach(user => {
        console.log(`   行${user.row}: ${user.studentId} - ${user.name} - ${user.phone}`)
      })
      if (missingUsers.length > 10) {
        console.log(`   ... 还有 ${missingUsers.length - 10} 个缺失用户`)
      }
    }
    
    // 显示空名字用户
    if (emptyNameUsers.length > 0) {
      console.log('\n🚫 空名字的记录：')
      emptyNameUsers.forEach(user => {
        console.log(`   行${user.row}: 星球编号=${user.studentId}, 微信ID=${user.wechatId}`)
      })
    }
    
    // 显示重复用户
    if (duplicateUsers.length > 0) {
      console.log('\n🔄 重复的名字：')
      duplicateUsers.forEach(dup => {
        console.log(`   "${dup.name}" 出现了 ${dup.count} 次`)
      })
    }
    
    // 建议解决方案
    console.log('\n💡 建议解决方案：')
    console.log('1. 对于空名字的记录，可以使用微信ID或星球编号作为名字')
    console.log('2. 对于重复的名字，可以在名字后添加星球编号以区分')
    console.log('3. 运行修复脚本自动处理这些问题')
    
  } catch (error) {
    console.error('❌ 分析失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

findMissingUsers()