// 准备课程数据导入
// 此脚本用于准备导入课程数据的模板

const fs = require('fs');
const path = require('path');

// 课程结构模板
const courseStructure = {
  sections: [
    {
      title: "前言",
      slug: "preface",
      description: "了解深海圈的核心理念与学习方法",
      order: 1,
      requiredTier: "FREE",
      courses: [
        {
          title: "欢迎来到深海圈",
          slug: "welcome",
          order: 1,
          chapters: [
            {
              title: "第1章：为什么创建深海圈",
              order: 1,
              lessons: [
                {
                  title: "1.1 创始人的话",
                  type: "VIDEO_TEXT",
                  order: 1,
                  content: "这里是课程文稿内容（Markdown格式）",
                  videoId: "", // 腾讯云点播fileId
                  videoDuration: 0, // 秒
                  isFree: true
                },
                {
                  title: "1.2 深海圈能帮你什么",
                  type: "TEXT_ONLY",
                  order: 2,
                  content: "这里是纯文本内容",
                  isFree: true
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: "基础篇",
      slug: "basic",
      description: "快速上手AI产品开发",
      order: 2,
      requiredTier: "ANNUAL",
      courses: [
        {
          title: "10分钟搞定产品雏形",
          slug: "quick-start",
          order: 1,
          chapters: [
            {
              title: "第1章：为什么选择AI产品赛道",
              order: 1,
              lessons: [
                {
                  title: "1.1 AI时代的机遇",
                  type: "VIDEO_TEXT",
                  order: 1,
                  content: "",
                  videoId: "",
                  videoDuration: 0,
                  isFree: false
                }
              ]
            }
          ]
        }
      ]
    },
    {
      title: "认知篇",
      slug: "cognition",
      description: "建立正确的产品思维",
      order: 3,
      requiredTier: "ANNUAL",
      courses: []
    },
    {
      title: "内功篇",
      slug: "internal-skills",
      description: "打磨核心竞争力",
      order: 4,
      requiredTier: "ANNUAL",
      courses: []
    },
    {
      title: "进阶篇",
      slug: "advanced",
      description: "成为行业专家",
      order: 5,
      requiredTier: "ANNUAL",
      courses: []
    }
  ],
  liveReplays: [
    {
      title: "如何选择AI产品方向",
      description: "深度解析2025年AI产品趋势",
      category: "product-selection",
      videoId: "",
      videoDuration: 0,
      liveDate: new Date("2025-01-20"),
      presenter: "深海圈创始人"
    }
  ]
};

// 创建导入模板文件
const templatePath = path.join(__dirname, 'course-import-template.json');
fs.writeFileSync(templatePath, JSON.stringify(courseStructure, null, 2));

console.log('✅ 课程导入模板已创建：', templatePath);
console.log('\n请按以下步骤操作：');
console.log('1. 编辑 course-import-template.json 文件，填入您的真实课程内容');
console.log('2. 将视频上传到腾讯云点播，获取fileId');
console.log('3. 将课程文稿以Markdown格式填入content字段');
console.log('4. 运行 npm run import-courses 导入数据');

// 创建实际导入脚本
const importScript = `// 导入课程数据到数据库
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
      
      console.log(\`✓ 创建篇章：\${section.title}\`);
      
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
        
        console.log(\`  ✓ 创建课程：\${course.title}\`);
        
        // 3. 导入章节
        for (const chapterData of courseData.chapters || []) {
          const chapter = await prisma.chapter.create({
            data: {
              title: chapterData.title,
              order: chapterData.order,
              courseId: course.id
            }
          });
          
          console.log(\`    ✓ 创建章节：\${chapter.title}\`);
          
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
            
            console.log(\`      ✓ 创建课时：\${lesson.title}\`);
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
      
      console.log(\`✓ 创建直播回放：\${replay.title}\`);
    }
    
    console.log('\\n✅ 课程数据导入完成！');
    
    // 统计信息
    const stats = {
      sections: await prisma.courseSection.count(),
      courses: await prisma.course.count(),
      chapters: await prisma.chapter.count(),
      lessons: await prisma.lesson.count(),
      liveReplays: await prisma.liveReplay.count()
    };
    
    console.log('\\n📊 导入统计：');
    console.log(\`- 篇章数：\${stats.sections}\`);
    console.log(\`- 课程数：\${stats.courses}\`);
    console.log(\`- 章节数：\${stats.chapters}\`);
    console.log(\`- 课时数：\${stats.lessons}\`);
    console.log(\`- 直播回放数：\${stats.liveReplays}\`);
    
  } catch (error) {
    console.error('导入失败：', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行导入
importCourses();
`;

const importScriptPath = path.join(__dirname, 'import-courses.js');
fs.writeFileSync(importScriptPath, importScript);

console.log('\n✅ 导入脚本已创建：', importScriptPath);