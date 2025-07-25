const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findNewest4Users() {
  console.log('=== 查找最新添加的4个用户 ===\n');

  try {
    // 获取所有用户，按创建时间排序
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        location: true,
        company: true,
        position: true,
        role: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`数据库总用户数: ${allUsers.length}`);
    
    // 获取最新的4个用户
    const newest4 = allUsers.slice(0, 4);
    
    console.log('\n最新添加的4个用户:');
    newest4.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   手机号: ${user.phone}`);
      console.log(`   位置: ${user.location || '未设置'}`);
      console.log(`   公司: ${user.company || '未设置'}`);
      console.log(`   职位: ${user.position || '未设置'}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   创建时间: ${user.createdAt.toLocaleString('zh-CN')}`);
      console.log(`   更新时间: ${user.updatedAt.toLocaleString('zh-CN')}`);
    });
    
    // 检查这4个用户的创建时间是否相近
    const times = newest4.map(u => u.createdAt.getTime());
    const timeDiffs = [];
    for (let i = 1; i < times.length; i++) {
      timeDiffs.push(times[i-1] - times[i]);
    }
    
    console.log('\n时间间隔分析:');
    timeDiffs.forEach((diff, index) => {
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        console.log(`  用户${index+1}和用户${index+2}之间: ${hours}小时${minutes % 60}分钟`);
      } else if (minutes > 0) {
        console.log(`  用户${index+1}和用户${index+2}之间: ${minutes}分钟${seconds % 60}秒`);
      } else {
        console.log(`  用户${index+1}和用户${index+2}之间: ${seconds}秒`);
      }
    });
    
    // 查看第5个用户，看是否和前4个有明显时间差异
    if (allUsers.length > 4) {
      const user5 = allUsers[4];
      const timeDiff = newest4[3].createdAt.getTime() - user5.createdAt.getTime();
      const hours = Math.floor(timeDiff / 1000 / 60 / 60);
      
      console.log(`\n第4个和第5个用户之间的时间差: ${hours}小时`);
      console.log(`\n第5个用户: ${user5.name}`);
      console.log(`   创建时间: ${user5.createdAt.toLocaleString('zh-CN')}`);
    }
    
    // 分析这4个用户的特征
    console.log('\n=== 这4个用户的特征分析 ===');
    
    // 检查手机号格式
    console.log('\n手机号格式:');
    newest4.forEach((user, index) => {
      const phone = user.phone;
      if (!phone) {
        console.log(`  用户${index+1}: 无手机号`);
      } else if (/^1\d{10}$/.test(phone)) {
        console.log(`  用户${index+1}: 标准11位手机号`);
      } else if (phone.startsWith('S')) {
        console.log(`  用户${index+1}: 星球编号格式 (${phone})`);
      } else {
        console.log(`  用户${index+1}: 其他格式 (${phone})`);
      }
    });
    
  } catch (error) {
    console.error('查询过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行查询
findNewest4Users().catch(console.error);