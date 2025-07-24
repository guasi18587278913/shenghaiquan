const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function analyzeUserDifference() {
  console.log('=== 分析数据库与CSV之间的4个用户差异 ===\n');

  try {
    // 1. 读取CSV文件并解析
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // 解析CSV数据（跳过标题行）
    const csvUsers = [];
    const csvPhoneMap = new Map(); // 用于检查重复
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // 简单的CSV解析（注意：这假设字段中没有逗号）
      const parts = line.split(',');
      if (parts.length >= 12) {
        const phone = parts[11]?.trim(); // 手机号在第12列
        if (phone && phone !== '无' && phone !== '') {
          const userData = {
            starId: parts[0]?.trim(),
            wechatName: parts[1]?.trim(),
            starName: parts[2]?.trim(),
            wechatId: parts[3]?.trim(),
            avatar: parts[4]?.trim(),
            industry: parts[5]?.trim(),
            identity: parts[6]?.trim(),
            introduction: parts[7]?.trim(),
            tags: parts[8]?.trim(),
            city: parts[9]?.trim(),
            resources: parts[10]?.trim(),
            phone: phone
          };
          
          csvUsers.push(userData);
          
          // 记录重复的手机号
          if (csvPhoneMap.has(phone)) {
            csvPhoneMap.get(phone).push(userData);
          } else {
            csvPhoneMap.set(phone, [userData]);
          }
        }
      }
    }
    
    console.log(`CSV中的有效用户记录数: ${csvUsers.length}`);
    
    // 2. 获取数据库中的所有用户
    const dbUsers = await prisma.user.findMany({
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
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`数据库中的用户总数: ${dbUsers.length}\n`);
    
    // 3. 分析数据库中的重复手机号
    console.log('=== 检查数据库中的重复手机号 ===');
    const dbPhoneMap = new Map();
    
    for (const user of dbUsers) {
      if (user.phone) {
        if (dbPhoneMap.has(user.phone)) {
          dbPhoneMap.get(user.phone).push(user);
        } else {
          dbPhoneMap.set(user.phone, [user]);
        }
      }
    }
    
    let dbDuplicateCount = 0;
    for (const [phone, users] of dbPhoneMap) {
      if (users.length > 1) {
        dbDuplicateCount++;
        console.log(`\n手机号 ${phone} 在数据库中有 ${users.length} 条记录:`);
        users.forEach(u => {
          console.log(`  - ID: ${u.id}, 姓名: ${u.name}, 角色: ${u.role}, 创建时间: ${u.createdAt.toLocaleString('zh-CN')}`);
        });
      }
    }
    
    if (dbDuplicateCount === 0) {
      console.log('数据库中没有重复的手机号');
    }
    
    // 4. 分析CSV中的重复手机号
    console.log('\n=== 检查CSV中的重复手机号 ===');
    let csvDuplicateCount = 0;
    
    for (const [phone, users] of csvPhoneMap) {
      if (users.length > 1) {
        csvDuplicateCount++;
        console.log(`\n手机号 ${phone} 在CSV中有 ${users.length} 条记录:`);
        users.forEach(u => {
          console.log(`  - 微信昵称: ${u.wechatName}, 星球昵称: ${u.starName}, 星球编号: ${u.starId}`);
        });
      }
    }
    
    if (csvDuplicateCount === 0) {
      console.log('CSV中没有重复的手机号');
    }
    
    // 5. 找出数据库中有但CSV中没有的用户
    console.log('\n=== 数据库中有但CSV中没有的用户 ===');
    const csvPhoneSet = new Set(csvUsers.map(u => u.phone));
    const dbOnlyUsers = dbUsers.filter(user => user.phone && !csvPhoneSet.has(user.phone));
    
    console.log(`\n找到 ${dbOnlyUsers.length} 个只在数据库中存在的用户`);
    
    // 只显示前10个用户的详细信息
    if (dbOnlyUsers.length > 0) {
      console.log('\n显示前10个用户的详细信息:');
      dbOnlyUsers.slice(0, 10).forEach(user => {
        console.log(`\n用户信息:`);
        console.log(`  - ID: ${user.id}`);
        console.log(`  - 手机号: ${user.phone}`);
        console.log(`  - 姓名: ${user.name}`);
        console.log(`  - 角色: ${user.role}`);
        console.log(`  - 位置: ${user.location || '未设置'}`);
        console.log(`  - 公司: ${user.company || '未设置'}`);
        console.log(`  - 职位: ${user.position || '未设置'}`);
        console.log(`  - 创建时间: ${user.createdAt.toLocaleString('zh-CN')}`);
      });
      
      if (dbOnlyUsers.length > 10) {
        console.log(`\n... 还有 ${dbOnlyUsers.length - 10} 个用户未显示`);
      }
    }
    
    // 6. 找出CSV中有但数据库中没有的记录
    console.log('\n=== CSV中有但数据库中没有的记录 ===');
    const dbPhoneSet = new Set(dbUsers.map(u => u.phone).filter(Boolean));
    const csvOnlyUsers = csvUsers.filter(user => !dbPhoneSet.has(user.phone));
    
    console.log(`\n找到 ${csvOnlyUsers.length} 条只在CSV中存在的记录`);
    
    // 只显示前10条记录的详细信息
    if (csvOnlyUsers.length > 0) {
      console.log('\n显示前10条记录的详细信息:');
      csvOnlyUsers.slice(0, 10).forEach(user => {
        console.log(`\n记录信息:`);
        console.log(`  - 手机号: ${user.phone}`);
        console.log(`  - 微信昵称: ${user.wechatName}`);
        console.log(`  - 星球昵称: ${user.starName}`);
        console.log(`  - 星球编号: ${user.starId}`);
        console.log(`  - 城市: ${user.city || '未设置'}`);
      });
      
      if (csvOnlyUsers.length > 10) {
        console.log(`\n... 还有 ${csvOnlyUsers.length - 10} 条记录未显示`);
      }
    }
    
    // 7. 分析种子数据
    console.log('\n=== 分析种子数据 ===');
    const seedUsers = dbUsers.filter(user => {
      // 通常种子数据会有特定的创建时间或没有手机号
      return !user.phone || user.role === 'ADMIN' || user.role === 'ASSISTANT';
    });
    
    console.log(`可能的种子数据用户数: ${seedUsers.length}`);
    console.log('管理员和助教用户:');
    seedUsers.filter(u => u.role !== 'USER').forEach(user => {
      console.log(`  - ${user.name} (${user.role})`);
    });
    
    // 8. 最终统计
    console.log('\n=== 最终统计汇总 ===');
    console.log(`数据库总用户数: ${dbUsers.length}`);
    console.log(`CSV有效记录数: ${csvUsers.length}`);
    console.log(`差异: ${dbUsers.length - csvUsers.length} 个用户`);
    console.log(`\n数据库中的唯一手机号数: ${dbPhoneMap.size}`);
    console.log(`CSV中的唯一手机号数: ${csvPhoneMap.size}`);
    console.log(`\n只在数据库中的用户数: ${dbOnlyUsers.length}`);
    console.log(`只在CSV中的记录数: ${csvOnlyUsers.length}`);
    
    // 9. 可能的原因分析
    console.log('\n=== 可能的原因分析 ===');
    const dbDuplicatePhones = Array.from(dbPhoneMap).filter(([phone, users]) => users.length > 1);
    const totalDuplicateRecords = dbDuplicatePhones.reduce((sum, [phone, users]) => sum + users.length - 1, 0);
    
    console.log(`1. 数据库中的重复记录导致的额外用户数: ${totalDuplicateRecords}`);
    console.log(`2. 种子数据（管理员/助教/测试用户）: ${seedUsers.length}`);
    console.log(`3. 只在数据库中存在的用户: ${dbOnlyUsers.length}`);
    
    // 10. 保存详细报告
    const report = {
      summary: {
        dbTotalUsers: dbUsers.length,
        csvTotalRecords: csvUsers.length,
        difference: dbUsers.length - csvUsers.length,
        dbUniquePhones: dbPhoneMap.size,
        csvUniquePhones: csvPhoneMap.size,
        dbOnlyUsers: dbOnlyUsers.length,
        csvOnlyRecords: csvOnlyUsers.length,
        dbDuplicatePhones: dbDuplicatePhones.length,
        totalDuplicateRecords: totalDuplicateRecords
      },
      dbOnlyUsers: dbOnlyUsers.map(u => ({
        id: u.id,
        phone: u.phone,
        name: u.name,
        role: u.role,
        location: u.location,
        company: u.company,
        position: u.position,
        createdAt: u.createdAt
      })),
      csvOnlyRecords: csvOnlyUsers.slice(0, 10).map(u => ({ // 只保存前10条
        phone: u.phone,
        wechatName: u.wechatName,
        starName: u.starName,
        city: u.city
      })),
      duplicatesInDb: dbDuplicatePhones.map(([phone, users]) => ({
        phone,
        count: users.length,
        users: users.map(u => ({
          id: u.id,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt
        }))
      }))
    };
    
    fs.writeFileSync('final-4-diff-analysis.json', JSON.stringify(report, null, 2));
    console.log('\n详细报告已保存到 final-4-diff-analysis.json');
    
  } catch (error) {
    console.error('分析过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行分析
analyzeUserDifference().catch(console.error);