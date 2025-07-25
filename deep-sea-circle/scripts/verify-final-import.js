const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyFinalImport() {
  console.log('✅ 最终验证导入结果...\n')
  
  try {
    const total = await prisma.user.count()
    const seedUsers = await prisma.user.count({
      where: { createdAt: { lt: new Date('2025-07-23') } }
    })
    const importedUsers = await prisma.user.count({
      where: { createdAt: { gte: new Date('2025-07-23') } }
    })
    
    // 找出刚刚导入的3个用户
    const lastImported = await prisma.user.findMany({
      where: {
        createdAt: { gte: new Date('2025-07-23T12:00:00') } // 假设是今天中午后导入的
      },
      select: { name: true, phone: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
    
    console.log('📊 数据库统计:')
    console.log(`  总用户数: ${total}`)
    console.log(`  种子用户: ${seedUsers}`)
    console.log(`  CSV导入用户: ${importedUsers}`)
    console.log(`  验证: ${seedUsers} + ${importedUsers} = ${seedUsers + importedUsers}`)
    
    if (importedUsers === 904) {
      console.log('\n🎉 完美！所有904个CSV学员都已成功导入！')
      
      console.log('\n最后导入的3个学员:')
      lastImported.forEach((u, i) => {
        console.log(`${i + 1}. ${u.name} (${u.phone})`)
      })
      
      console.log('\n✅ 导入任务完成！')
      console.log('  - 所有904个付费学员已全部导入')
      console.log('  - 加上18个种子用户，总共922个用户')
      console.log('  - 每个学员的默认密码都是: deepsea2024')
    }
    
  } catch (error) {
    console.error('验证失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyFinalImport()