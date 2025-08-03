const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restructureCourse() {
  console.log('开始重组课程结构...');
  
  try {
    // 1. 查找"一、玩起来!"课程
    const course = await prisma.course.findFirst({
      where: {
        title: { contains: '玩起来! 通过 AI' }
      },
      include: {
        chapters: {
          include: {
            lessons: true
          }
        }
      }
    });

    if (!course) {
      console.log('未找到目标课程');
      return;
    }

    console.log(`找到课程: ${course.title}`);
    console.log(`当前包含 ${course.chapters.length} 个章节`);

    // 2. 删除现有的所有课时
    const chapter = course.chapters[0];
    if (chapter) {
      console.log(`删除章节"${chapter.title}"下的所有课时...`);
      
      await prisma.lesson.deleteMany({
        where: {
          chapterId: chapter.id
        }
      });
      
      console.log('课时删除完成');

      // 3. 创建新的3个课时
      const newLessons = [
        {
          title: '视频教学',
          type: 'VIDEO_TEXT',
          content: '',
          order: 1,
          chapterId: chapter.id,
          isFree: true,
          videoDuration: 540 // 9分钟
        },
        {
          title: '文字版教学',
          type: 'TEXT_ONLY',
          content: '',
          order: 2,
          chapterId: chapter.id,
          isFree: true
        },
        {
          title: '课后作业',
          type: 'TEXT_ONLY',
          content: '',
          order: 3,
          chapterId: chapter.id,
          isFree: false
        }
      ];

      console.log('\n创建新课时结构:');
      for (const lessonData of newLessons) {
        const lesson = await prisma.lesson.create({
          data: lessonData
        });
        console.log(`✅ 创建课时: ${lesson.title} (${lesson.type})`);
      }

      // 4. 更新章节标题
      await prisma.chapter.update({
        where: { id: chapter.id },
        data: { title: '课程内容' }
      });

      console.log('\n✅ 课程结构重组完成！');
    }

    // 5. 验证结果
    const updatedCourse = await prisma.course.findFirst({
      where: { id: course.id },
      include: {
        chapters: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });

    console.log('\n新的课程结构:');
    console.log(`课程: ${updatedCourse.title}`);
    updatedCourse.chapters.forEach(ch => {
      console.log(`  章节: ${ch.title}`);
      ch.lessons.forEach(lesson => {
        const icon = lesson.type === 'VIDEO_TEXT' ? '📹' : '📖';
        console.log(`    ${icon} ${lesson.title}`);
      });
    });

  } catch (error) {
    console.error('重组过程中出现错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行重组
restructureCourse();