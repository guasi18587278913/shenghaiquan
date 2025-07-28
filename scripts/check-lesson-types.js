const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLessonTypes() {
  try {
    console.log('🔍 检查 Lesson 表中的 type 值...');
    
    // 获取所有不同的 type 值
    const lessons = await prisma.$queryRaw`
      SELECT DISTINCT type, COUNT(*) as count 
      FROM "Lesson" 
      GROUP BY type
    `;
    
    console.log('\n📊 当前 type 字段的值：');
    console.table(lessons);
    
    console.log('\n💡 建议：');
    console.log('1. 如果表为空，可以安全地使用 npx prisma db push --accept-data-loss');
    console.log('2. 如果有数据，需要先运行迁移脚本');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLessonTypes();