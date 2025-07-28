// 导入课程数据到数据库
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importCourses() {
  try {
    const dataPath = path.join(__dirname, 'course-import-template.json');
    const courseData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    console.log('开始导入课程数据...');
    
    // 1. 导入课程篇章
    for (const sectionData of courseData.sections) {
      const section = await prisma.courseSection.create({
        data: {
          title: sectionData.title,
          slug: sectionData.slug,
          description: sectionData.description,
          order: sectionData.order,
          requiredTier: sectionData.requiredTier,
        }
      });
      
      console.log(`✓ 创建篇章：${section.title}`);
      
      // 2. 导入课程
      for (const courseData of sectionData.courses || []) {
        const course = await prisma.course.create({
          data: {
            title: courseData.title,
            slug: courseData.slug,
            order: courseData.order,
            sectionId: section.id,
            isPublished: true
          }
        });
        
        console.log(`  ✓ 创建课程：${course.title}`);
        
        // 3. 导入章节
        for (const chapterData of courseData.chapters || []) {
          const chapter = await prisma.chapter.create({
            data: {
              title: chapterData.title,
              order: chapterData.order,
              courseId: course.id
            }
          });
          
          console.log(`    ✓ 创建章节：${chapter.title}`);
          
          // 4. 导入课时
          for (const lessonData of chapterData.lessons || []) {
            const lesson = await prisma.lesson.create({
              data: {
                title: lessonData.title,
                type: lessonData.type,
                order: lessonData.order,
                content: lessonData.content,
                videoId: lessonData.videoId || null,
                videoDuration: lessonData.videoDuration || 0,
                isFree: lessonData.isFree || false,
                attachments: lessonData.attachments ? JSON.stringify(lessonData.attachments) : null,
                codeExamples: lessonData.codeExamples ? JSON.stringify(lessonData.codeExamples) : null,
                homework: lessonData.homework || null,
                chapterId: chapter.id
              }
            });
            
            console.log(`      ✓ 创建课时：${lesson.title}`);
          }
        }
        
        // 更新课程统计
        const totalLessons = await prisma.lesson.count({
          where: {
            chapter: {
              courseId: course.id
            }
          }
        });
        
        const totalDuration = await prisma.lesson.aggregate({
          where: {
            chapter: {
              courseId: course.id
            }
          },
          _sum: {
            videoDuration: true
          }
        });
        
        await prisma.course.update({
          where: { id: course.id },
          data: {
            totalLessons,
            totalDuration: totalDuration._sum.videoDuration || 0
          }
        });
      }
    }
    
    // 5. 导入直播回放
    for (const replayData of courseData.liveReplays || []) {
      const replay = await prisma.liveReplay.create({
        data: {
          title: replayData.title,
          description: replayData.description,
          category: replayData.category,
          videoId: replayData.videoId,
          videoDuration: replayData.videoDuration,
          liveDate: new Date(replayData.liveDate),
          presenter: replayData.presenter,
          attachments: replayData.attachments ? JSON.stringify(replayData.attachments) : null,
          isPublished: true
        }
      });
      
      console.log(`✓ 创建直播回放：${replay.title}`);
    }
    
    console.log('\n✅ 课程数据导入完成！');
    
    // 统计信息
    const stats = {
      sections: await prisma.courseSection.count(),
      courses: await prisma.course.count(),
      chapters: await prisma.chapter.count(),
      lessons: await prisma.lesson.count(),
      liveReplays: await prisma.liveReplay.count()
    };
    
    console.log('\n📊 导入统计：');
    console.log(`- 篇章数：${stats.sections}`);
    console.log(`- 课程数：${stats.courses}`);
    console.log(`- 章节数：${stats.chapters}`);
    console.log(`- 课时数：${stats.lessons}`);
    console.log(`- 直播回放数：${stats.liveReplays}`);
    
  } catch (error) {
    console.error('导入失败：', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行导入
importCourses();
