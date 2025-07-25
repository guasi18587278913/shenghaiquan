const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMemberData() {
  try {
    // 1. 检查用户总数
    const totalUsers = await prisma.user.count()
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const userCount = await prisma.user.count({ where: { role: 'USER' } })
    
    console.log('📊 数据库用户统计：')
    console.log('================================')
    console.log('总用户数：', totalUsers)
    console.log('管理员数：', adminCount)
    console.log('普通用户数：', userCount)
    
    // 2. 检查最近创建的用户
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { 
        name: true, 
        role: true, 
        createdAt: true,
        location: true,
        company: true,
        phone: true
      }
    })
    
    console.log('\n📋 最近创建的10个用户：')
    console.log('--------------------------------')
    recentUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.name || '未命名'} (${u.role})`)
      console.log(`   位置: ${u.location || '未知'}`)
      console.log(`   创建时间: ${u.createdAt.toLocaleString()}`)
    })
    
    // 3. 检查是否有批量导入的用户
    const usersWithLocation = await prisma.user.count({
      where: {
        location: { not: null },
        role: 'USER'
      }
    })
    
    console.log(`\n📍 有位置信息的用户数: ${usersWithLocation}`)
    
    // 4. 按位置统计
    const locationStats = await prisma.user.groupBy({
      by: ['location'],
      _count: true,
      where: {
        location: { not: null }
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: 10
    })
    
    console.log('\n🗺️  用户位置分布（前10）：')
    console.log('--------------------------------')
    locationStats.forEach(stat => {
      console.log(`${stat.location}: ${stat._count} 人`)
    })
    
    // 5. 检查特定的测试数据
    const testUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: '王工程师' },
          { name: '周大学生' },
          { phone: { endsWith: '0001' } }
        ]
      }
    })
    
    if (testUser) {
      console.log('\n✅ 发现导入的测试用户数据')
    } else {
      console.log('\n⚠️  未找到之前导入的测试用户数据')
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMemberData()