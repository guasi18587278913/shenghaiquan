const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPreviewUrl() {
  try {
    // 查找最新的前言章节
    const section = await prisma.courseSection.findFirst({
      where: {
        slug: { contains: 'preface' }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        courses: {
          include: {
            chapters: {
              include: {
                lessons: true
              }
            }
          }
        }
      }
    });
    
    if (section) {
      console.log('\n=== 章节信息 ===');
      console.log('章节标题:', section.title);
      console.log('章节slug:', section.slug);
      console.log('课程数量:', section.courses.length);
      
      if (section.courses.length > 0) {
        console.log('\n=== 课程信息 ===');
        section.courses.forEach((course, index) => {
          console.log(`\n课程 ${index + 1}:`);
          console.log('标题:', course.title);
          console.log('Slug:', course.slug);
          console.log('\n✅ 正确的预览URL:');
          console.log(`http://localhost:3000/courses/preview/${section.slug}/${course.slug}`);
          
          // 显示课时信息
          const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
          console.log(`\n包含 ${course.chapters.length} 个章节，共 ${totalLessons} 个课时`);
        });
      }
    } else {
      console.log('未找到前言章节');
    }
    
    // 列出所有可预览的课程
    console.log('\n\n=== 所有可预览的课程URL ===');
    const allSections = await prisma.courseSection.findMany({
      include: { courses: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    allSections.forEach(s => {
      s.courses.forEach(c => {
        console.log(`http://localhost:3000/courses/preview/${s.slug}/${c.slug}`);
      });
    });
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPreviewUrl();