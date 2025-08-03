const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanPrefaceCourses() {
  console.log('开始清理前言部分的多余课程...');
  
  try {
    // 1. 首先查找前言章节
    const prefaceSection = await prisma.courseSection.findUnique({
      where: { slug: 'preface' },
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

    if (!prefaceSection) {
      console.log('未找到前言章节');
      return;
    }

    console.log(`\n前言章节包含 ${prefaceSection.courses.length} 个课程：`);
    prefaceSection.courses.forEach(course => {
      console.log(`- ${course.title} (${course.slug})`);
      course.chapters.forEach(chapter => {
        console.log(`  - ${chapter.title}`);
        chapter.lessons.forEach(lesson => {
          console.log(`    - ${lesson.title}`);
        });
      });
    });

    // 2. 查找名为"前言"的课程（包含多余的课时）
    const prefaceCourse = await prisma.course.findFirst({
      where: {
        sectionId: prefaceSection.id,
        title: '前言'
      }
    });

    if (prefaceCourse) {
      console.log('\n找到名为"前言"的课程，准备删除...');
      
      // 删除这个课程（会级联删除相关的章节和课时）
      await prisma.course.delete({
        where: {
          id: prefaceCourse.id
        }
      });
      
      console.log('成功删除"前言"课程及其包含的课时');
    }

    // 3. 要保留的课程标题
    const coursesToKeep = [
      '这套课程有什么不同？',
      '你要学什么？',
      '学习方法',
      '课前准备'
    ];

    console.log('\n保留的课程：');
    console.log(coursesToKeep.join('\n'));

    // 6. 验证结果
    const updatedSection = await prisma.courseSection.findUnique({
      where: { slug: 'preface' },
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

    console.log(`\n清理后，前言章节包含 ${updatedSection.courses.length} 个课程：`);
    updatedSection.courses.forEach(course => {
      console.log(`- ${course.title}`);
    });

  } catch (error) {
    console.error('清理过程中出现错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行清理
cleanPrefaceCourses();