const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUrls() {
  try {
    // 查找你刚创建的章节
    const section = await prisma.courseSection.findFirst({
      where: { slug: 'preface-1753955920294' },
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
      console.log('\n=== 找到章节 ===');
      console.log('章节标题:', section.title);
      console.log('章节URL:', section.slug);
      console.log('包含课程数:', section.courses.length);
      
      section.courses.forEach((course, index) => {
        console.log(`\n课程 ${index + 1}:`);
        console.log('  标题:', course.title);
        console.log('  URL:', course.slug);
        console.log('  完整路径: /courses/' + section.slug + '/' + course.slug);
        
        if (course.chapters.length > 0) {
          console.log('  章节数:', course.chapters.length);
          course.chapters.forEach(chapter => {
            console.log(`    - ${chapter.title} (${chapter.lessons.length} 个课时)`);
          });
        }
      });
    } else {
      console.log('未找到指定的章节');
    }
    
    // 列出所有可访问的课程URL
    console.log('\n\n=== 所有可访问的课程URL ===');
    const allSections = await prisma.courseSection.findMany({
      include: {
        courses: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    allSections.forEach(section => {
      section.courses.forEach(course => {
        console.log(`http://localhost:3000/courses/${section.slug}/${course.slug}`);
      });
    });
    
  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUrls();