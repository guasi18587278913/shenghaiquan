// 检查课程数据的脚本
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourseData() {
  try {
    console.log('=== 检查数据库中的课程数据 ===\n');

    // 1. 查询所有课程章节
    const sections = await prisma.courseSection.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5, // 只显示最新的5个
      include: {
        courses: true
      }
    });

    console.log(`找到 ${sections.length} 个课程章节：\n`);
    
    sections.forEach((section, index) => {
      console.log(`${index + 1}. 章节: ${section.title}`);
      console.log(`   URL标识: ${section.slug}`);
      console.log(`   描述: ${section.description || '无描述'}`);
      console.log(`   创建时间: ${section.createdAt}`);
      console.log(`   包含课程数: ${section.courses.length}`);
      console.log('---');
    });

    // 2. 查询最新的课时内容
    console.log('\n=== 最新的课时内容 ===\n');
    
    const lessons = await prisma.lesson.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        chapter: {
          include: {
            course: true
          }
        }
      }
    });

    lessons.forEach((lesson, index) => {
      console.log(`${index + 1}. 课时: ${lesson.title}`);
      console.log(`   所属课程: ${lesson.chapter.course.title}`);
      console.log(`   内容类型: ${lesson.type}`);
      console.log(`   内容长度: ${lesson.content.length} 字符`);
      console.log(`   是否包含图片: ${lesson.content.includes('![') ? '是' : '否'}`);
      if (lesson.content.includes('![')) {
        const imageMatches = lesson.content.match(/!\[.*?\]\((.*?)\)/g);
        console.log(`   图片数量: ${imageMatches ? imageMatches.length : 0}`);
      }
      console.log(`   创建时间: ${lesson.createdAt}`);
      console.log('---');
    });

    // 3. 统计总数
    const totalSections = await prisma.courseSection.count();
    const totalCourses = await prisma.course.count();
    const totalLessons = await prisma.lesson.count();

    console.log('\n=== 数据统计 ===');
    console.log(`总章节数: ${totalSections}`);
    console.log(`总课程数: ${totalCourses}`);
    console.log(`总课时数: ${totalLessons}`);

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourseData();