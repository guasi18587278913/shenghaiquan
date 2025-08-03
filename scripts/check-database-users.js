const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseUsers() {
  try {
    console.log('🔌 连接数据库...')
    
    // 获取用户总数
    const userCount = await prisma.user.count()
    console.log(`\n📊 数据库中共有 ${userCount} 个用户\n`)
    
    // 获取前10个用户的信息
    const users = await prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        location: true,
        company: true,
        position: true,
        createdAt: true
      }
    })
    
    console.log('👥 最近创建的10个用户：')
    console.log('----------------------------------------')
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || '未设置姓名'}`)
      console.log(`   邮箱: ${user.email || '无'}`)
      console.log(`   手机: ${user.phone || '无'}`)
      console.log(`   位置: ${user.location || '未设置'}`)
      console.log(`   公司: ${user.company || '未设置'}`)
      console.log(`   职位: ${user.position || '未设置'}`)
      console.log(`   创建时间: ${user.createdAt.toLocaleString('zh-CN')}`)
      console.log('----------------------------------------')
    })
    
    // 统计各个字段的填充情况
    const stats = await prisma.user.aggregate({
      _count: {
        name: true,
        email: true,
        phone: true,
        location: true,
        company: true,
        position: true,
        bio: true
      }
    })
    
    console.log('\n📈 数据完整性统计：')
    console.log(`姓名已填写: ${stats._count.name} 个`)
    console.log(`邮箱已填写: ${stats._count.email} 个`)
    console.log(`手机已填写: ${stats._count.phone} 个`)
    console.log(`位置已填写: ${stats._count.location} 个`)
    console.log(`公司已填写: ${stats._count.company} 个`)
    console.log(`职位已填写: ${stats._count.position} 个`)
    console.log(`简介已填写: ${stats._count.bio} 个`)
    
    // 按城市统计用户分布
    const locationStats = await prisma.user.groupBy({
      by: ['location'],
      _count: {
        location: true
      },
      where: {
        location: {
          not: null
        }
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: 10
    })
    
    console.log('\n🏙️ 用户城市分布 TOP 10：')
    locationStats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.location}: ${stat._count.location} 人`)
    })
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message)
    console.log('\n💡 提示：')
    console.log('1. 确保已经启动了 SSH 隧道')
    console.log('2. 检查 .env 文件中的 DATABASE_URL 配置')
    console.log('3. 如果使用远程数据库，确保网络连接正常')
  } finally {
    await prisma.$disconnect()
  }
}

// 运行检查
checkDatabaseUsers()