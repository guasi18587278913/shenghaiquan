const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('测试数据库连接...');
    const userCount = await prisma.user.count();
    console.log(`数据库中有 ${userCount} 个用户`);
    
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    console.log('前5个用户:', users);
  } catch (error) {
    console.error('数据库连接失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();