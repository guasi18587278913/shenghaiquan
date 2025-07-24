const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testCityFilter() {
  console.log('🧪 测试城市筛选功能...\n')
  
  try {
    // 1. 测试数据库查询 - 北京
    console.log('1️⃣ 数据库测试 - 北京用户:')
    const beijingUsers = await prisma.user.findMany({
      where: { location: '北京' },
      take: 5,
      select: {
        name: true,
        location: true,
        position: true
      }
    })
    const beijingTotal = await prisma.user.count({
      where: { location: '北京' }
    })
    
    console.log(`   总数: ${beijingTotal} 人`)
    console.log('   示例用户:')
    beijingUsers.slice(0, 3).forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} - ${user.position || '暂无职位'}`)
    })
    
    // 2. 测试组合查询
    console.log('\n2️⃣ 组合查询测试 - 上海的"工程师":')
    const shanghaiEngineers = await prisma.user.findMany({
      where: {
        location: '上海',
        OR: [
          { position: { contains: '工程师' } },
          { bio: { contains: '工程师' } }
        ]
      },
      take: 5,
      select: {
        name: true,
        position: true,
        location: true
      }
    })
    
    console.log(`   找到 ${shanghaiEngineers.length} 个结果`)
    shanghaiEngineers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} - ${user.position || '暂无职位'}`)
    })
    
    // 3. 显示测试步骤
    console.log('\n✅ 功能实现完成！')
    console.log('\n📋 测试步骤:')
    console.log('1. 访问 http://localhost:3000/map')
    console.log('2. 点击任意城市标记（如北京、上海）')
    console.log('3. 在右侧面板点击"查看全部成员"按钮')
    console.log('4. 会跳转到成员页面，并显示该城市的筛选标签')
    console.log('5. 可以点击标签上的X清除筛选')
    
    console.log('\n🔗 示例URL:')
    console.log('- 北京: http://localhost:3000/members?city=北京')
    console.log('- 上海: http://localhost:3000/members?city=上海')
    console.log('- 深圳: http://localhost:3000/members?city=深圳')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCityFilter()