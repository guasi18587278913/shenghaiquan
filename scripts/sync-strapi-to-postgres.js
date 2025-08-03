#!/usr/bin/env node

/**
 * 同步 Strapi 数据到 PostgreSQL
 * 
 * 使用方法：
 * node scripts/sync-strapi-to-postgres.js
 */

const STRAPI_URL = 'http://localhost:1337';
const DB_PROXY_URL = 'http://111.231.19.162:3000/api/db-proxy';
const DB_PROXY_KEY = 'your-secure-key-2025';

// 获取 Strapi 数据
async function fetchStrapiData() {
  try {
    // 获取所有章节
    const sectionsRes = await fetch(`${STRAPI_URL}/api/courses?sort=order`);
    const sectionsData = await sectionsRes.json();
    const sections = sectionsData.data;

    // 获取所有课程
    const lessonsRes = await fetch(`${STRAPI_URL}/api/lessons?populate=section&sort=order`);
    const lessonsData = await lessonsRes.json();
    const lessons = lessonsData.data;

    return { sections, lessons };
  } catch (error) {
    console.error('获取 Strapi 数据失败:', error);
    return null;
  }
}

// 通过代理执行数据库操作
async function dbQuery(model, method, args) {
  const response = await fetch(DB_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DB_PROXY_KEY}`
    },
    body: JSON.stringify({ model, method, args })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`数据库操作失败: ${error}`);
  }

  const result = await response.json();
  return result.data;
}

// 同步章节数据
async function syncSections(sections) {
  console.log('开始同步章节数据...');
  
  for (const section of sections) {
    try {
      // 检查章节是否存在
      const existing = await dbQuery('courseSection', 'findFirst', {
        where: { slug: section.slug }
      });

      const sectionData = {
        title: section.title,
        slug: section.slug,
        description: section.description || '',
        order: section.order,
        icon: section.icon || null,
        requiredTier: 'FREE'
      };

      if (existing) {
        // 更新现有章节
        await dbQuery('courseSection', 'update', {
          where: { id: existing.id },
          data: sectionData
        });
        console.log(`更新章节: ${section.title}`);
      } else {
        // 创建新章节
        await dbQuery('courseSection', 'create', {
          data: sectionData
        });
        console.log(`创建章节: ${section.title}`);
      }
    } catch (error) {
      console.error(`同步章节 ${section.title} 失败:`, error);
    }
  }
}

// 同步课程数据
async function syncLessons(lessons) {
  console.log('开始同步课程数据...');
  
  for (const lesson of lessons) {
    try {
      // 获取对应的章节
      const sectionSlug = lesson.section?.slug;
      if (!sectionSlug) {
        console.warn(`课程 ${lesson.title} 没有关联章节，跳过`);
        continue;
      }

      const section = await dbQuery('courseSection', 'findFirst', {
        where: { slug: sectionSlug }
      });

      if (!section) {
        console.warn(`找不到章节 ${sectionSlug}，跳过课程 ${lesson.title}`);
        continue;
      }

      // 检查课程是否存在
      const existing = await dbQuery('course', 'findFirst', {
        where: { 
          slug: lesson.slug,
          sectionId: section.id
        }
      });

      // 准备课程数据
      const courseData = {
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description || '',
        sectionId: section.id,
        isPublished: true,
        order: lesson.order || 0
      };

      let courseId;
      if (existing) {
        // 更新现有课程
        await dbQuery('course', 'update', {
          where: { id: existing.id },
          data: courseData
        });
        courseId = existing.id;
        console.log(`更新课程: ${lesson.title}`);
      } else {
        // 创建新课程
        const newCourse = await dbQuery('course', 'create', {
          data: courseData
        });
        courseId = newCourse.id;
        console.log(`创建课程: ${lesson.title}`);
      }

      // 创建章节（Chapter）
      const existingChapter = await dbQuery('chapter', 'findFirst', {
        where: { 
          courseId: courseId,
          order: 1
        }
      });

      let chapterId;
      if (!existingChapter) {
        const chapter = await dbQuery('chapter', 'create', {
          data: {
            title: lesson.title,
            courseId: courseId,
            order: 1
          }
        });
        chapterId = chapter.id;
      } else {
        chapterId = existingChapter.id;
      }

      // 创建或更新课时（Lesson）
      const existingLesson = await dbQuery('lesson', 'findFirst', {
        where: { 
          chapterId: chapterId,
          order: 1
        }
      });

      const lessonData = {
        title: lesson.title,
        content: lesson.content || '',
        type: lesson.videoUrl ? 'VIDEO_TEXT' : 'TEXT_ONLY',
        videoId: lesson.videoUrl || null,
        videoDuration: lesson.duration ? parseInt(lesson.duration) : 0,
        chapterId: chapterId,
        order: 1,
        isFree: true
      };

      if (existingLesson) {
        await dbQuery('lesson', 'update', {
          where: { id: existingLesson.id },
          data: lessonData
        });
      } else {
        await dbQuery('lesson', 'create', {
          data: lessonData
        });
      }

    } catch (error) {
      console.error(`同步课程 ${lesson.title} 失败:`, error);
    }
  }
}

// 主函数
async function main() {
  console.log('=== 开始同步 Strapi 数据到 PostgreSQL ===');
  
  // 1. 获取 Strapi 数据
  console.log('正在获取 Strapi 数据...');
  const data = await fetchStrapiData();
  
  if (!data) {
    console.error('无法获取 Strapi 数据，请确保 Strapi 正在运行');
    return;
  }
  
  console.log(`找到 ${data.sections.length} 个章节，${data.lessons.length} 个课程`);
  
  // 2. 同步章节
  await syncSections(data.sections);
  
  // 3. 同步课程
  await syncLessons(data.lessons);
  
  console.log('=== 同步完成 ===');
}

// 运行主函数
main().catch(console.error);