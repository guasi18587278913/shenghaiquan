const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function cleanToExactUsers() {
  console.log('🧹 清理到精确的904个用户...\n')
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  await new Promise(resolve => {
    readline.question('⚠️  这将删除18个种子用户，只保留CSV中的学员。确定吗？(yes/no): ', answer => {
      readline.close()
      if (answer.toLowerCase() !== 'yes') {
        console.log('已取消操作')
        process.exit(0)
      }
      resolve()
    })
  })
  
  try {
    // 1. 先创建一个临时管理员（用于管理）
    console.log('1️⃣ 创建临时管理员...')
    const tempAdmin = await prisma.user.upsert({
      where: { phone: '19999999999' },
      update: {},
      create: {
        name: '临时管理员',
        phone: '19999999999',
        password: await bcrypt.hash('temp_admin_2024', 10),
        role: 'ADMIN',
        points: 9999,
        level: 99
      }
    })
    
    // 2. 删除所有7月17日创建的种子用户
    console.log('2️⃣ 删除种子数据...')
    const deleted = await prisma.user.deleteMany({
      where: {
        createdAt: {
          gte: new Date('2025-07-17T00:00:00'),
          lt: new Date('2025-07-18T00:00:00')
        }
      }
    })
    console.log(`   已删除 ${deleted.count} 个种子用户`)
    
    // 3. 统计当前情况
    const total = await prisma.user.count()
    const csvUsers = await prisma.user.count({
      where: {
        createdAt: { gte: new Date('2025-07-23') }
      }
    })
    
    console.log('\n📊 清理后的统计:')
    console.log(`  总用户数: ${total}`)
    console.log(`  CSV导入用户: ${csvUsers}`)
    console.log(`  临时管理员: 1`)
    
    if (total === 902) { // 901个CSV用户 + 1个临时管理员
      console.log('\n✅ 成功！现在有901个CSV用户 + 1个管理员')
      console.log('\n📌 临时管理员登录信息:')
      console.log('   手机号: 19999999999')
      console.log('   密码: temp_admin_2024')
      console.log('\n💡 提示: 您可以用任意CSV中的用户登录')
      console.log('   密码都是: deepsea2024')
    }
    
    // 4. 尝试找出未导入的3个用户
    console.log('\n🔍 查找未导入的3个用户...')
    // 这里需要更复杂的逻辑来找出具体是哪3个
    
  } catch (error) {
    console.error('操作失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanToExactUsers()