import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 测试用户数据
const testUsers = [
  {
    name: '亦仁',
    phone: '13800000001',
    email: 'yiren@test.com',
    bio: '深海圈创始人，专注AI产品创新',
    level: 10,
    points: 8888,
    role: 'USER',
    position: '产品总监',
    company: '深海圈',
    location: '北京'
  },
  {
    name: '欢欢',
    phone: '13800000002',
    email: 'huanhuan@test.com',
    bio: '热爱学习的活跃学员，擅长快速原型开发',
    level: 7,
    points: 3500,
    role: 'USER',
    position: '产品经理',
    company: '科技公司',
    location: '上海'
  },
  {
    name: '宝芙',
    phone: '13800000003',
    email: 'baofu@test.com',
    bio: '高级学员，已完成多个AI项目',
    level: 8,
    points: 4200,
    role: 'USER',
    position: '高级开发',
    company: '互联网公司',
    location: '深圳'
  },
  {
    name: '瓜斯',
    phone: '13800000004',
    email: 'guasi@test.com',
    bio: '刚入门的新手，充满学习热情',
    level: 2,
    points: 500,
    role: 'USER',
    position: '初级开发',
    company: '创业公司',
    location: '广州'
  },
  {
    name: '雪雪',
    phone: '13800000005',
    email: 'xuexue@test.com',
    bio: '课程助教，帮助大家解决学习问题',
    level: 9,
    points: 5000,
    role: 'ASSISTANT',
    position: '课程助教',
    company: '深海圈',
    location: '北京'
  },
  {
    name: '明德',
    phone: '13800000006',
    email: 'mingde@test.com',
    bio: '稳步前进的学员，注重基础',
    level: 5,
    points: 2000,
    role: 'USER',
    position: '全栈开发',
    company: '技术公司',
    location: '杭州'
  },
  {
    name: '梦吟',
    phone: '13800000007',
    email: 'mengyin@test.com',
    bio: '创意无限，喜欢探索新技术',
    level: 6,
    points: 2800,
    role: 'USER',
    position: '设计师',
    company: '设计工作室',
    location: '成都'
  },
  {
    name: '桑桑',
    phone: '13800000008',
    email: 'sangsang@test.com',
    bio: '认真学习中，每天都在进步',
    level: 3,
    points: 800,
    role: 'USER',
    position: '产品助理',
    company: '初创公司',
    location: '南京'
  },
  {
    name: '沐阳',
    phone: '13800000009',
    email: 'muyang@test.com',
    bio: '实战派学员，已有小成',
    level: 4,
    points: 1500,
    role: 'USER',
    position: '独立开发者',
    company: '自由职业',
    location: '厦门'
  },
  {
    name: '君潇',
    phone: '13800000010',
    email: 'junxiao@test.com',
    bio: '技术大牛，乐于分享经验',
    level: 8,
    points: 4500,
    role: 'USER',
    position: '技术负责人',
    company: '大厂',
    location: '北京'
  }
];

async function seedTestUsers() {
  console.log('开始创建测试用户...');
  
  // 统一密码
  const defaultPassword = 'test123456';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  try {
    // 创建用户
    for (const userData of testUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { phone: userData.phone }
      });
      
      if (existingUser) {
        console.log(`用户 ${userData.name} (${userData.phone}) 已存在，跳过`);
        continue;
      }
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          isActive: true,
          // 设置默认的技能
          skills: JSON.stringify(['AI产品', 'Cursor', '快速开发']),
          // 创建初始的在线状态
          onlineStatus: {
            create: {
              isOnline: false,
              platform: 'web'
            }
          }
        }
      });
      
      console.log(`✅ 创建用户: ${user.name} (${user.phone})`);
    }
    
    // 创建一些预设的关注关系
    console.log('\n创建关注关系...');
    
    // 让亦仁关注一些人
    const yiren = await prisma.user.findUnique({ where: { phone: '13800000001' } });
    const huanhuan = await prisma.user.findUnique({ where: { phone: '13800000002' } });
    const xuexue = await prisma.user.findUnique({ where: { phone: '13800000005' } });
    
    if (yiren && huanhuan && xuexue) {
      // 亦仁关注欢欢和雪雪
      await prisma.follow.createMany({
        data: [
          { followerId: yiren.id, followingId: huanhuan.id },
          { followerId: yiren.id, followingId: xuexue.id }
        ],
        skipDuplicates: true
      });
      
      // 欢欢和雪雪也关注亦仁（互相关注）
      await prisma.follow.createMany({
        data: [
          { followerId: huanhuan.id, followingId: yiren.id },
          { followerId: xuexue.id, followingId: yiren.id }
        ],
        skipDuplicates: true
      });
      
      console.log('✅ 创建关注关系成功');
    }
    
    console.log('\n测试用户创建完成！');
    console.log('\n登录信息：');
    console.log('统一密码：test123456');
    console.log('\n用户列表：');
    testUsers.forEach(user => {
      console.log(`${user.name}: ${user.phone}`);
    });
    
  } catch (error) {
    console.error('创建测试用户时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行种子脚本
seedTestUsers();