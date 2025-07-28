// 导入课程数据到数据库 - 新版本
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function importCourses() {
  try {
    // 使用新的课程结构文件
    const dataPath = path.join(__dirname, '../data/courses/course-structure.json');
    const courseData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    console.log('🚀 开始导入课程数据...');
    console.log(`📁 数据文件：${dataPath}`);
    
    // 清理旧数据（可选）
    console.log('\n🧹 清理旧数据...');
    await prisma.lesson.deleteMany({});
    await prisma.chapter.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.courseSection.deleteMany({});
    await prisma.liveReplay.deleteMany({});
    console.log('✅ 旧数据清理完成');
    
    const courseSystem = courseData.courseSystem;
    
    // 1. 导入课程篇章
    console.log('\n📚 开始导入课程篇章...');
    for (const sectionData of courseSystem.sections) {
      const section = await prisma.courseSection.create({
        data: {
          title: sectionData.title,
          slug: sectionData.id,
          description: sectionData.description,
          order: sectionData.order,
          requiredTier: mapMembershipTier(sectionData.requiredTier),
        }
      });
      
      console.log(`✓ 创建篇章：${section.title}`);
      
      // 2. 为每个篇章创建一个默认课程（因为数据结构中章节直接在篇章下）
      const course = await prisma.course.create({
        data: {
          title: sectionData.title,
          slug: sectionData.id,
          order: 1,
          sectionId: section.id,
          isPublished: true
        }
      });
      
      // 3. 导入章节
      for (let chapterIndex = 0; chapterIndex < sectionData.chapters.length; chapterIndex++) {
        const chapterData = sectionData.chapters[chapterIndex];
        
        // 判断是否有子课时
        if (chapterData.lessons && chapterData.lessons.length > 0) {
          // 有子课时的情况
          const chapter = await prisma.chapter.create({
            data: {
              title: chapterData.title,
              order: chapterIndex + 1,
              courseId: course.id
            }
          });
          
          console.log(`  ✓ 创建章节：${chapter.title}`);
          
          // 导入课时
          for (let lessonIndex = 0; lessonIndex < chapterData.lessons.length; lessonIndex++) {
            const lessonData = chapterData.lessons[lessonIndex];
            
            const lesson = await prisma.lesson.create({
              data: {
                title: lessonData.title,
                type: mapLessonType(lessonData.type),
                order: lessonIndex + 1,
                content: generateLessonContent(lessonData),
                videoId: lessonData.videoId || null,
                videoDuration: lessonData.duration || 0,
                isFree: lessonData.isFree || false,
                chapterId: chapter.id
              }
            });
            
            console.log(`    ✓ 创建课时：${lesson.title}`);
          }
        } else {
          // 没有子课时，章节本身就是课时
          const chapter = await prisma.chapter.create({
            data: {
              title: `第${chapterIndex + 1}章`,
              order: chapterIndex + 1,
              courseId: course.id
            }
          });
          
          const lesson = await prisma.lesson.create({
            data: {
              title: chapterData.title,
              type: mapLessonType(chapterData.type),
              order: 1,
              content: generateLessonContent(chapterData),
              videoId: chapterData.videoId || null,
              videoDuration: chapterData.duration || 0,
              isFree: chapterData.isFree || false,
              chapterId: chapter.id
            }
          });
          
          console.log(`  ✓ 创建课时：${lesson.title}`);
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
    
    // 4. 导入直播回放
    if (courseSystem.liveReplays) {
      console.log('\n📹 开始导入直播回放...');
      
      for (const category of courseSystem.liveReplays.categories) {
        for (const replayData of category.replays || []) {
          const replay = await prisma.liveReplay.create({
            data: {
              title: replayData.title,
              description: replayData.description || '',
              category: category.id,
              videoId: replayData.videoId || '',
              videoDuration: replayData.duration || 0,
              liveDate: new Date(),
              presenter: '深海圈团队',
              isPublished: true
            }
          });
          
          console.log(`✓ 创建直播回放：${replay.title}`);
        }
      }
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
    console.error('❌ 导入失败：', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 会员等级映射
function mapMembershipTier(tier) {
  const tierMap = {
    'free': 'FREE',
    'monthly': 'ANNUAL',  // 将月度会员映射为年度会员
    'annual': 'ANNUAL'
  };
  return tierMap[tier.toLowerCase()] || 'FREE';
}

// 课时类型映射
function mapLessonType(type) {
  const typeMap = {
    'text': 'TEXT_ONLY',
    'video': 'VIDEO_ONLY',
    'video_text': 'VIDEO_TEXT'
  };
  return typeMap[type] || 'TEXT_ONLY';
}

// 生成课时内容
function generateLessonContent(lessonData) {
  // 这里可以根据实际需要生成内容
  return `# ${lessonData.title}

## 课程内容

这是${lessonData.title}的课程内容。

### 学习目标
- 理解核心概念
- 掌握实践技能
- 完成课程作业

### 课程时长
约${Math.ceil(lessonData.duration / 60)}分钟

---

*请根据实际内容替换此模板*`;
}

// 执行导入
importCourses().catch(console.error);