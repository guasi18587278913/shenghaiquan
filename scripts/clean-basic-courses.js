const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanBasicCourses() {
  console.log('开始清理基础篇的旧课程内容...');
  
  try {
    // 1. 首先查找基础篇章节
    const basicSection = await prisma.courseSection.findUnique({
      where: { slug: 'basic' },
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

    if (!basicSection) {
      console.log('未找到基础篇章节');
      return;
    }

    console.log(`\n基础篇章节包含 ${basicSection.courses.length} 个课程`);
    console.log('\n当前所有课程：');
    basicSection.courses.forEach(course => {
      console.log(`\n课程：${course.title} (${course.slug})`);
      course.chapters.forEach(chapter => {
        console.log(`  章节：${chapter.title}`);
        chapter.lessons.forEach(lesson => {
          console.log(`    - ${lesson.title}`);
        });
      });
    });

    // 2. 查找包含旧内容的课程
    // 根据章节标题特征来识别旧课程
    const oldCourses = await prisma.course.findMany({
      where: {
        sectionId: basicSection.id,
        chapters: {
          some: {
            OR: [
              { title: { contains: '10分钟做成产品雏形' } },
              { title: { contains: 'Cursor与AI编程实战' } }
            ]
          }
        }
      },
      include: {
        chapters: {
          include: {
            lessons: true
          }
        }
      }
    });

    if (oldCourses.length > 0) {
      console.log(`\n找到 ${oldCourses.length} 个包含旧内容的课程需要删除：`);
      oldCourses.forEach(course => {
        console.log(`- ${course.title}`);
        course.chapters.forEach(chapter => {
          console.log(`  - ${chapter.title}`);
        });
      });

      // 3. 执行删除
      const deleteResult = await prisma.course.deleteMany({
        where: {
          id: {
            in: oldCourses.map(c => c.id)
          }
        }
      });
      
      console.log(`\n成功删除 ${deleteResult.count} 个旧课程`);
    } else {
      console.log('\n未找到需要删除的旧课程');
    }

    // 4. 验证结果
    const updatedSection = await prisma.courseSection.findUnique({
      where: { slug: 'basic' },
      include: {
        courses: {
          orderBy: { order: 'asc' }
        }
      }
    });

    console.log(`\n清理后，基础篇包含 ${updatedSection.courses.length} 个课程：`);
    updatedSection.courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
    });

  } catch (error) {
    console.error('清理过程中出现错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行清理
cleanBasicCourses();