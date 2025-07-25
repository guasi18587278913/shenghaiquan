const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function analyzeDifference() {
  console.log('=== 分析数据库与CSV之间的差异 ===\n');

  try {
    // 1. 获取数据库用户数
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log(`数据库用户总数: ${dbUsers.length}`);
    
    // 2. 按角色统计
    const usersByRole = {
      USER: 0,
      ADMIN: 0,
      ASSISTANT: 0
    };
    
    dbUsers.forEach(user => {
      usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
    });
    
    console.log('\n按角色统计:');
    console.log(`  - 普通用户 (USER): ${usersByRole.USER}`);
    console.log(`  - 管理员 (ADMIN): ${usersByRole.ADMIN}`);
    console.log(`  - 助教 (ASSISTANT): ${usersByRole.ASSISTANT}`);
    
    // 3. 统计CSV数据行
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // 统计以数字开头的行（真实数据行）
    const dataLines = lines.filter(line => /^\d+,/.test(line));
    console.log(`\nCSV数据行数（以数字开头）: ${dataLines.length}`);
    
    // 4. 计算差异
    console.log('\n=== 差异分析 ===');
    console.log(`数据库用户数 - CSV数据行数 = ${dbUsers.length} - ${dataLines.length} = ${dbUsers.length - dataLines.length}`);
    
    // 5. 检查种子数据（没有手机号的用户）
    const usersWithoutPhone = dbUsers.filter(user => !user.phone);
    console.log(`\n没有手机号的用户数: ${usersWithoutPhone.length}`);
    
    // 6. 检查非USER角色的用户
    const nonUserRoles = dbUsers.filter(user => user.role !== 'USER');
    console.log(`\n非USER角色的用户数: ${nonUserRoles.length}`);
    if (nonUserRoles.length > 0) {
      console.log('详细信息:');
      nonUserRoles.forEach(user => {
        console.log(`  - ${user.name} (${user.role})`);
      });
    }
    
    // 7. 查看最早创建的用户（可能是种子数据）
    const earliestUsers = dbUsers.sort((a, b) => a.createdAt - b.createdAt).slice(0, 20);
    console.log('\n最早创建的20个用户:');
    earliestUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.role}) - ${user.createdAt.toLocaleString('zh-CN')} - 手机号: ${user.phone || '无'}`);
    });
    
    // 8. 计算真实差异
    const seedDataCount = usersWithoutPhone.length + nonUserRoles.length;
    const realDifference = dbUsers.length - dataLines.length - seedDataCount;
    
    console.log('\n=== 最终结论 ===');
    console.log(`数据库总用户数: ${dbUsers.length}`);
    console.log(`CSV有效数据行: ${dataLines.length}`);
    console.log(`可能的种子数据: ${seedDataCount}`);
    console.log(`无法解释的差异: ${realDifference}`);
    
  } catch (error) {
    console.error('分析过程中出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行分析
analyzeDifference().catch(console.error);