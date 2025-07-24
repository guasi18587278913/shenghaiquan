const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function addUser() {
  // 从命令行参数获取用户信息
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('❌ 用法: node scripts/add-single-user.js "姓名" "手机号" ["城市"] ["标签"]')
    console.log('示例: node scripts/add-single-user.js "张三" "13800138000" "北京" "AI开发"')
    return
  }
  
  const [name, phone, city = '未知', tags = ''] = args
  
  try {
    const hashedPassword = await bcrypt.hash('deepsea2024', 10)
    
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        location: city,
        skills: JSON.stringify(tags.split(',').filter(t => t)),
        role: 'USER',
        points: 100,
        level: 1,
      }
    })
    
    console.log('✅ 用户添加成功!')
    console.log(`   姓名: ${user.name}`)
    console.log(`   手机: ${user.phone}`)
    console.log(`   城市: ${user.location}`)
    console.log(`   登录密码: deepsea2024`)
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ 该手机号已存在!')
    } else {
      console.error('❌ 添加失败:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

addUser()