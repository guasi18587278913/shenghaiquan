const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBioDetails() {
  try {
    // 1. 查找bio为"无"的用户
    const usersWithWu = await prisma.user.findMany({
      where: {
        bio: '无'
      },
      select: {
        name: true,
        bio: true,
        location: true,
        phone: true
      },
      take: 10
    });
    
    console.log('📋 bio为"无"的用户示例:');
    usersWithWu.forEach(u => {
      console.log(`  - ${u.name} (${u.location}): "${u.bio}"`);
    });
    
    // 2. 查看最短的bio内容
    const shortBios = await prisma.user.findMany({
      where: {
        AND: [
          { bio: { not: null } },
          { bio: { not: '' } },
          { role: 'USER' } // 只看普通用户
        ]
      },
      select: {
        name: true,
        bio: true
      },
      orderBy: {
        bio: 'asc'
      },
      take: 20
    });
    
    console.log('\n📋 最短的bio内容:');
    shortBios.forEach(u => {
      console.log(`  - ${u.name}: "${u.bio}" (长度: ${u.bio.length})`);
    });
    
    // 3. 统计bio长度分布
    const allUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { bio: true }
    });
    
    const lengthStats = {
      empty: 0,
      veryShort: 0, // 1-10
      short: 0,     // 11-50
      medium: 0,    // 51-200
      long: 0       // 200+
    };
    
    allUsers.forEach(u => {
      const len = u.bio?.length || 0;
      if (len === 0) lengthStats.empty++;
      else if (len <= 10) lengthStats.veryShort++;
      else if (len <= 50) lengthStats.short++;
      else if (len <= 200) lengthStats.medium++;
      else lengthStats.long++;
    });
    
    console.log('\n📊 bio长度分布:');
    console.log(`  - 空: ${lengthStats.empty}`);
    console.log(`  - 很短(1-10): ${lengthStats.veryShort}`);
    console.log(`  - 短(11-50): ${lengthStats.short}`);
    console.log(`  - 中(51-200): ${lengthStats.medium}`);
    console.log(`  - 长(200+): ${lengthStats.long}`);
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBioDetails();