const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    // 获取总用户数
    const totalUsers = await prisma.user.count()
    console.log('📊 数据库用户统计')
    console.log('─'.repeat(30))
    console.log(`👥 总用户数: ${totalUsers}`)
    
    // 获取用户角色分布
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const teacherCount = await prisma.user.count({ where: { role: 'TEACHER' } })
    const assistantCount = await prisma.user.count({ where: { role: 'ASSISTANT' } })
    const userCount = await prisma.user.count({ where: { role: 'USER' } })
    
    console.log(`\n角色分布:`)
    console.log(`  管理员: ${adminCount}`)
    console.log(`  教师: ${teacherCount}`)
    console.log(`  助教: ${assistantCount}`)
    console.log(`  普通用户: ${userCount}`)
    
    // 最近添加的5个用户
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, createdAt: true }
    })
    
    console.log(`\n最近添加的用户:`)
    recentUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} - ${user.createdAt.toLocaleString('zh-CN')}`)
    })
    
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()