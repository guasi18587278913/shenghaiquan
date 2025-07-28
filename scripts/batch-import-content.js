// 批量导入课程内容
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// 定义课程内容映射
// 你可以在这里直接粘贴你的手册内容
const courseContents = {
  // 前言部分
  "欢迎来到深海圈": `# 欢迎来到深海圈

## 深海圈是什么

深海圈是一个专注于AI产品开发的学习社区...

[在这里粘贴你的内容]
`,

  "如何高效学习本课程": `# 如何高效学习本课程

## 学习方法

[在这里粘贴你的内容]
`,

  // 基础篇
  "1.1 为什么选择AI产品赛道": `[在这里粘贴你的内容]`,
  
  "1.2 认识主流AI工具": `[在这里粘贴你的内容]`,
  
  "1.3 实战：用ChatGPT做翻译工具": `[在这里粘贴你的内容]`,
  
  "2.1 Cursor基础设置": `[在这里粘贴你的内容]`,
  
  "2.2 让AI帮你写代码": `[在这里粘贴你的内容]`,

  // 继续添加其他课程...
};

async function batchImportContent() {
  try {
    console.log('🚀 开始批量导入课程内容...\n');

    let successCount = 0;
    let failCount = 0;

    for (const [title, content] of Object.entries(courseContents)) {
      // 查找课时
      const lesson = await prisma.lesson.findFirst({
        where: { title },
        include: {
          chapter: {
            include: {
              course: {
                include: {
                  section: true
                }
              }
            }
          }
        }
      });

      if (lesson) {
        // 更新内容
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { content }
        });
        
        console.log(`✅ 已更新：${title}`);
        console.log(`   位置：${lesson.chapter.course.section.title} > ${lesson.chapter.title}`);
        successCount++;
      } else {
        console.log(`❌ 未找到课时：${title}`);
        failCount++;
      }
    }

    console.log(`\n📊 导入完成！`);
    console.log(`✅ 成功：${successCount} 个`);
    console.log(`❌ 失败：${failCount} 个`);

    // 显示所有可用的课时标题，方便对照
    if (failCount > 0) {
      console.log('\n📝 当前系统中的所有课时：');
      const allLessons = await prisma.lesson.findMany({
        select: { title: true },
        orderBy: { title: 'asc' }
      });
      
      allLessons.forEach(lesson => {
        console.log(`   - ${lesson.title}`);
      });
    }

  } catch (error) {
    console.error('❌ 导入失败：', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行批量导入
batchImportContent();