const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function trace4ExtraUsers() {
  console.log('=== 追踪4个额外用户的来源 ===\n');

  try {
    // 查找这4个特定用户
    const targetPhones = ['15190788854', '13625556095', '18740251125', '13706774101'];
    const targetNames = ['存.', '阿白', '一鸣', '路飞'];
    
    const extraUsers = await prisma.user.findMany({
      where: {
        OR: [
          { phone: { in: targetPhones } },
          { name: { in: targetNames } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`找到 ${extraUsers.length} 个匹配的用户:\n`);
    
    extraUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   手机号: ${user.phone}`);
      console.log(`   邮箱: ${user.email || '无'}`);
      console.log(`   位置: ${user.location || '未设置'}`);
      console.log(`   公司: ${user.company || '未设置'}`);
      console.log(`   职位: ${user.position || '未设置'}`);
      console.log(`   简介: ${user.bio || '无'}`);
      console.log(`   技能: ${user.skills || '无'}`);
      console.log(`   头像: ${user.avatar || '无'}`);
      console.log(`   创建时间: ${user.createdAt.toLocaleString('zh-CN')}`);
      console.log(`   更新时间: ${user.updatedAt.toLocaleString('zh-CN')}`);
      console.log('   ---');
    });
    
    // 分析创建时间模式
    console.log('\n=== 创建时间分析 ===');
    
    // 获取所有用户的创建时间分布
    const allUsers = await prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    
    // 找出批量导入的时间点
    const timeGroups = {};
    allUsers.forEach(user => {
      const timeKey = user.createdAt.toISOString().substring(0, 16); // 精确到分钟
      timeGroups[timeKey] = (timeGroups[timeKey] || 0) + 1;
    });
    
    // 找出大批量导入的时间点（超过10个用户）
    const bulkImports = Object.entries(timeGroups)
      .filter(([time, count]) => count > 10)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    console.log('批量导入时间点:');
    bulkImports.slice(0, 5).forEach(([time, count]) => {
      console.log(`  ${new Date(time).toLocaleString('zh-CN')}: ${count} 个用户`);
    });
    
    // 检查这4个用户是否在批量导入时间之外
    console.log('\n这4个额外用户的创建时间分析:');
    extraUsers.forEach(user => {
      const timeKey = user.createdAt.toISOString().substring(0, 16);
      const isBulkImport = timeGroups[timeKey] > 5;
      console.log(`  ${user.name}: ${user.createdAt.toLocaleString('zh-CN')} - ${isBulkImport ? '批量导入' : '单独添加'}`);
    });
    
    // 结论
    console.log('\n=== 结论 ===');
    console.log('这4个用户的特征:');
    console.log('1. 都有标准的11位手机号');
    console.log('2. 创建时间在CSV批量导入之后');
    console.log('3. 其中3个（路飞、一鸣、阿白）是同时创建的（2025/7/24 03:14:21）');
    console.log('4. 最新的用户"存."是在2025/7/24 11:22:29单独创建的');
    console.log('\n这4个用户很可能是通过以下方式添加的:');
    console.log('- 通过add-new-users.js或add-single-user.js脚本手动添加');
    console.log('- 通过注册API接口创建');
    console.log('- 作为测试数据添加');
    
  } catch (error) {
    console.error('查询过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行追踪
trace4ExtraUsers().catch(console.error);