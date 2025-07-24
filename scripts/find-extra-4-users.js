const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function findExtra4Users() {
  console.log('=== 查找数据库中额外的4个用户 ===\n');

  try {
    // 1. 获取CSV中所有的手机号
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // 提取CSV中的手机号（第12列）
    const csvPhones = new Set();
    lines.forEach((line, index) => {
      if (index === 0 || !line.trim()) return; // 跳过标题行和空行
      
      const parts = line.split(',');
      if (parts.length >= 12 && parts[11]) {
        const phone = parts[11].trim();
        if (phone && phone !== '无' && phone !== '') {
          csvPhones.add(phone);
        }
      }
    });
    
    console.log(`CSV中的唯一手机号数量: ${csvPhones.size}`);
    
    // 2. 获取数据库中所有用户
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        location: true,
        company: true
      },
      orderBy: { createdAt: 'desc' } // 按创建时间倒序，最新的在前
    });
    
    console.log(`数据库中的用户总数: ${dbUsers.length}`);
    
    // 3. 找出数据库中有但CSV中没有的用户
    const extraUsers = [];
    const dbPhoneCount = {};
    
    // 先统计数据库中每个手机号的出现次数
    dbUsers.forEach(user => {
      if (user.phone) {
        dbPhoneCount[user.phone] = (dbPhoneCount[user.phone] || 0) + 1;
      }
    });
    
    // 找出额外的用户
    dbUsers.forEach(user => {
      if (user.phone && !csvPhones.has(user.phone)) {
        extraUsers.push(user);
      }
    });
    
    console.log(`\n数据库中有但CSV中没有的用户数: ${extraUsers.length}`);
    
    // 4. 检查是否有重复导入的情况
    console.log('\n=== 检查重复的手机号 ===');
    const duplicates = Object.entries(dbPhoneCount)
      .filter(([phone, count]) => count > 1)
      .sort((a, b) => b[1] - a[1]); // 按重复次数降序排序
    
    if (duplicates.length > 0) {
      console.log('发现以下手机号在数据库中有重复:');
      duplicates.forEach(([phone, count]) => {
        console.log(`  - 手机号: ${phone}, 出现次数: ${count}`);
        
        // 显示该手机号对应的所有用户
        const duplicateUsers = dbUsers.filter(u => u.phone === phone);
        duplicateUsers.forEach(u => {
          console.log(`    * ID: ${u.id}, 姓名: ${u.name}, 创建时间: ${u.createdAt.toLocaleString('zh-CN')}`);
        });
      });
    } else {
      console.log('没有发现重复的手机号');
    }
    
    // 5. 显示最新创建的用户（可能是手动添加的）
    console.log('\n=== 最新创建的10个用户 ===');
    const latestUsers = dbUsers.slice(0, 10);
    latestUsers.forEach(user => {
      const inCSV = csvPhones.has(user.phone);
      console.log(`\n用户: ${user.name}`);
      console.log(`  - ID: ${user.id}`);
      console.log(`  - 手机号: ${user.phone}`);
      console.log(`  - 位置: ${user.location || '未设置'}`);
      console.log(`  - 创建时间: ${user.createdAt.toLocaleString('zh-CN')}`);
      console.log(`  - 更新时间: ${user.updatedAt.toLocaleString('zh-CN')}`);
      console.log(`  - 在CSV中: ${inCSV ? '是' : '否'}`);
    });
    
    // 6. 查找可能是手动添加或测试的用户
    console.log('\n=== 可能的额外用户（基于创建时间分析）===');
    
    // 获取大部分用户的创建时间范围
    const createTimes = dbUsers.map(u => u.createdAt.getTime()).sort((a, b) => a - b);
    const median = createTimes[Math.floor(createTimes.length / 2)];
    const firstQuartile = createTimes[Math.floor(createTimes.length * 0.25)];
    const thirdQuartile = createTimes[Math.floor(createTimes.length * 0.75)];
    
    // 找出创建时间异常的用户（太早或太晚）
    const outlierUsers = dbUsers.filter(user => {
      const time = user.createdAt.getTime();
      return time < firstQuartile || time > thirdQuartile;
    });
    
    console.log(`\n创建时间异常的用户数: ${outlierUsers.length}`);
    
    // 最终结论
    console.log('\n=== 最终结论 ===');
    console.log(`1. 数据库总用户数: ${dbUsers.length}`);
    console.log(`2. CSV唯一手机号数: ${csvPhones.size}`);
    console.log(`3. 数据库中额外的用户数: ${extraUsers.length}`);
    console.log(`4. 数据库与CSV的差异: ${dbUsers.length - 904} 个用户`);
    
    // 如果恰好是4个额外用户，显示它们
    if (dbUsers.length - 904 === 4) {
      console.log('\n这4个额外的用户可能是:');
      console.log('1. 手动添加的测试用户');
      console.log('2. 重复导入的用户');
      console.log('3. 通过其他方式（如注册接口）创建的用户');
      console.log('4. CSV文件中某些记录的手机号格式问题导致的重复导入');
    }
    
  } catch (error) {
    console.error('分析过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行分析
findExtra4Users().catch(console.error);