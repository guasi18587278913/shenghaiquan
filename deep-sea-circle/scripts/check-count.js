const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCount() {
  const totalUsers = await prisma.user.count()
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
  const userCount = await prisma.user.count({ where: { role: 'USER' } })
  
  console.log('📊 数据库用户统计：')
  console.log(`   总用户数: ${totalUsers}`)
  console.log(`   管理员: ${adminCount}`)
  console.log(`   普通用户: ${userCount}`)
  console.log('')
  console.log(`   预期总数: 905 (904个用户 + 1个管理员)`)
  console.log(`   差异: ${905 - totalUsers}`)
}

checkCount().finally(() => prisma.$disconnect())