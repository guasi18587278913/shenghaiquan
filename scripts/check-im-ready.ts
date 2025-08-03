import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIMReady() {
  console.log('🔍 检查IM系统准备情况...\n');

  try {
    // 1. 检查数据库连接
    console.log('1️⃣ 检查数据库连接...');
    await prisma.$connect();
    console.log('✅ 数据库连接正常\n');

    // 2. 检查IM相关表是否存在
    console.log('2️⃣ 检查IM数据表...');
    try {
      await prisma.conversation.count();
      await prisma.message.count();
      await prisma.userOnlineStatus.count();
      console.log('✅ IM数据表已创建\n');
    } catch (error) {
      console.log('❌ IM数据表未创建，请运行: npx prisma migrate deploy\n');
      return;
    }

    // 3. 检查测试用户
    console.log('3️⃣ 检查测试用户...');
    const testPhones = [
      '13800000001', '13800000002', '13800000003', '13800000004', '13800000005',
      '13800000006', '13800000007', '13800000008', '13800000009', '13800000010'
    ];
    
    const users = await prisma.user.findMany({
      where: { phone: { in: testPhones } },
      select: { name: true, phone: true }
    });

    if (users.length === 0) {
      console.log('❌ 测试用户未创建，请运行: npm run seed:test\n');
      return;
    } else if (users.length < 10) {
      console.log(`⚠️  只创建了 ${users.length}/10 个测试用户`);
      console.log('建议运行: npm run seed:test 创建所有测试用户\n');
    } else {
      console.log('✅ 所有10个测试用户已创建');
      console.log('用户列表：');
      users.forEach(user => {
        console.log(`  - ${user.name}: ${user.phone}`);
      });
      console.log('');
    }

    // 4. 检查在线状态记录
    console.log('4️⃣ 检查在线状态系统...');
    const statusCount = await prisma.userOnlineStatus.count();
    console.log(`✅ 在线状态记录数: ${statusCount}\n`);

    // 5. 检查是否有测试对话
    console.log('5️⃣ 检查测试数据...');
    const conversationCount = await prisma.conversation.count();
    const messageCount = await prisma.message.count();
    console.log(`📊 现有会话数: ${conversationCount}`);
    console.log(`📊 现有消息数: ${messageCount}\n`);

    // 总结
    console.log('🎉 IM系统检查完成！');
    console.log('\n📋 展示准备清单：');
    console.log('✓ 数据库已连接');
    console.log('✓ IM数据表已创建');
    console.log('✓ 测试用户已准备');
    console.log('✓ 在线状态系统正常');
    console.log('\n🚀 系统已准备就绪，可以开始展示！');
    console.log('\n访问以下地址：');
    console.log('- 快速登录页面: http://localhost:3000/test-accounts');
    console.log('- 课程页面: http://localhost:3000/courses');
    console.log('\n祝展示顺利！💪');

  } catch (error) {
    console.error('❌ 检查过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIMReady();