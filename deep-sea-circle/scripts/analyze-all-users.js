const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function analyzeAllUsers() {
  try {
    // 1. 查找所有非普通用户（管理员、助教等）
    const nonRegularUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: { not: 'USER' } },
          { createdAt: { lt: new Date('2025-07-23') } } // 今天之前创建的
        ]
      },
      select: { 
        name: true, 
        role: true, 
        phone: true,
        createdAt: true 
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log('🌱 种子数据（非CSV导入）:')
    console.log('─'.repeat(50))
    nonRegularUsers.forEach((u, i) => {
      console.log(`${i + 1}. ${u.name} - ${u.role} - ${u.phone} - ${u.createdAt.toLocaleDateString()}`)
    })
    
    // 2. 统计总数
    const total = await prisma.user.count()
    const userRole = await prisma.user.count({ where: { role: 'USER' } })
    const adminRole = await prisma.user.count({ where: { role: 'ADMIN' } })
    const assistantRole = await prisma.user.count({ where: { role: 'ASSISTANT' } })
    
    console.log('\n📊 用户统计:')
    console.log('─'.repeat(50))
    console.log(`总用户数: ${total}`)
    console.log(`├─ 普通用户(USER): ${userRole}`)
    console.log(`├─ 管理员(ADMIN): ${adminRole}`)
    console.log(`└─ 助教(ASSISTANT): ${assistantRole}`)
    
    // 3. 分析CSV导入情况
    const todayUsers = await prisma.user.count({
      where: { createdAt: { gte: new Date('2025-07-23') } }
    })
    
    console.log('\n📈 导入分析:')
    console.log('─'.repeat(50))
    console.log(`今天导入的用户: ${todayUsers}`)
    console.log(`种子数据: ${total - todayUsers}`)
    console.log(`CSV应有: 904`)
    console.log(`实际CSV导入: ${todayUsers}`)
    console.log(`差异: ${904 - todayUsers}`)
    
    // 4. 如果需要清理种子数据
    if (total > 904) {
      console.log('\n⚠️  数据库中有额外的种子数据！')
      console.log('如果要精确匹配904个用户，需要删除种子数据。')
      console.log('但这可能会影响系统功能（需要管理员账号）。')
    }
    
  } catch (error) {
    console.error('分析失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

analyzeAllUsers()