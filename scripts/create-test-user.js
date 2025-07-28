const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // 检查是否已存在测试用户
    const existingUser = await prisma.user.findUnique({
      where: { phone: '13800138000' }
    });

    if (existingUser) {
      console.log('测试用户已存在');
      return;
    }

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.user.create({
      data: {
        name: '测试用户',
        phone: '13800138000',
        email: 'test@deepsea.com',
        password: hashedPassword,
        role: 'USER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      }
    });

    console.log('测试用户创建成功:', {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email
    });

    // 创建一个年度会员测试用户
    const vipUser = await prisma.user.create({
      data: {
        name: 'VIP测试用户',
        phone: '13900139000',
        email: 'vip@deepsea.com',
        password: hashedPassword,
        role: 'USER',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vip',
        // membershipTier 和 membershipExpiry 字段需要先在数据库schema中添加
      }
    });

    console.log('VIP测试用户创建成功:', {
      id: vipUser.id,
      name: vipUser.name,
      phone: vipUser.phone,
      email: vipUser.email,
    });

  } catch (error) {
    console.error('创建测试用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();