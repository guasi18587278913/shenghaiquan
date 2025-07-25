const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function demonstrateAutoSync() {
  console.log('🎯 演示新用户自动同步功能\n')
  
  // 1. 显示当前深圳的用户数
  console.log('1️⃣ 添加前的深圳用户数:')
  const beforeCount = await prisma.user.count({
    where: { location: '深圳' }
  })
  console.log(`   深圳: ${beforeCount} 人\n`)
  
  // 2. 添加一个新用户
  console.log('2️⃣ 添加新用户...')
  const timestamp = new Date().getTime()
  const newUserName = `演示用户_${timestamp}`
  
  try {
    const hashedPassword = await bcrypt.hash('123456', 10)
    const newUser = await prisma.user.create({
      data: {
        email: `demo_${timestamp}@example.com`,
        password: hashedPassword,
        name: newUserName,
        location: '深圳',
        position: 'AI产品经理',
        company: '深海圈科技',
        bio: '这是一个演示用户，用于展示数据自动同步功能',
        skills: JSON.stringify(['AI', '产品管理', '数据分析']),
        role: 'USER',
        level: 1,
        points: 100,
        isActive: true
      }
    })
    
    console.log(`   ✅ 成功添加: ${newUser.name}`)
    console.log(`   位置: ${newUser.location}`)
    console.log(`   职位: ${newUser.position}\n`)
    
    // 3. 显示添加后的深圳用户数
    console.log('3️⃣ 添加后的深圳用户数:')
    const afterCount = await prisma.user.count({
      where: { location: '深圳' }
    })
    console.log(`   深圳: ${afterCount} 人 (+${afterCount - beforeCount})\n`)
    
    // 4. 查询最新的深圳用户（前3个）
    console.log('4️⃣ 深圳最新的3个用户:')
    const latestUsers = await prisma.user.findMany({
      where: { location: '深圳' },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        name: true,
        position: true,
        createdAt: true
      }
    })
    
    latestUsers.forEach((user, i) => {
      const time = user.createdAt.toLocaleString('zh-CN')
      console.log(`   ${i + 1}. ${user.name} - ${user.position} (${time})`)
    })
    
    console.log('\n✨ 演示完成！')
    console.log('📌 现在你可以:')
    console.log('   1. 访问 http://localhost:3000/map - 查看深圳的用户数增加了')
    console.log('   2. 点击深圳城市标记 - 看到新用户出现在列表中')
    console.log('   3. 访问 http://localhost:3000/members - 搜索新用户')
    console.log(`   4. 搜索 "${newUserName}" 可以找到刚添加的用户`)
    
  } catch (error) {
    console.error('❌ 添加失败:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

demonstrateAutoSync()