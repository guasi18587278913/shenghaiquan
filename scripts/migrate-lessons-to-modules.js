#!/usr/bin/env node

// 迁移脚本：将现有的Lesson数据迁移到新的Module结构

const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN; // 需要设置管理员token

async function fetchWithAuth(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

async function migrateLessons() {
  try {
    console.log('开始迁移Lesson数据到Module结构...');
    
    // 1. 获取所有Lessons
    const lessonsResponse = await fetchWithAuth(`${STRAPI_API_URL}/api/lessons?populate=*`);
    const lessons = lessonsResponse.data;
    
    console.log(`找到 ${lessons.length} 个课程需要迁移`);
    
    for (const lesson of lessons) {
      console.log(`\n迁移课程: ${lesson.attributes.title}`);
      
      // 创建默认的视频模块（如果有视频）
      if (lesson.attributes.videoUrl) {
        const videoModule = {
          data: {
            title: lesson.attributes.title,
            type: 'video',
            order: 0,
            duration: lesson.attributes.duration,
            videoUrl: lesson.attributes.videoUrl,
            content: lesson.attributes.description || '',
            lesson: lesson.id,
            publishedAt: new Date()
          }
        };
        
        try {
          await fetchWithAuth(`${STRAPI_API_URL}/api/modules`, {
            method: 'POST',
            body: JSON.stringify(videoModule)
          });
          console.log('  ✓ 创建视频模块');
        } catch (error) {
          console.error('  ✗ 创建视频模块失败:', error.message);
        }
      }
      
      // 创建阅读模块（如果有内容）
      if (lesson.attributes.content && lesson.attributes.content.trim() !== '') {
        const readingModule = {
          data: {
            title: `${lesson.attributes.title} - 学习材料`,
            type: 'reading',
            order: 1,
            content: lesson.attributes.content,
            lesson: lesson.id,
            publishedAt: new Date()
          }
        };
        
        try {
          await fetchWithAuth(`${STRAPI_API_URL}/api/modules`, {
            method: 'POST',
            body: JSON.stringify(readingModule)
          });
          console.log('  ✓ 创建阅读模块');
        } catch (error) {
          console.error('  ✗ 创建阅读模块失败:', error.message);
        }
      }
      
      // 可以根据需要添加默认的作业或讨论模块
      // 例如：为每个课程添加一个讨论模块
      const discussionModule = {
        data: {
          title: `${lesson.attributes.title} - 讨论`,
          type: 'discussion',
          order: 2,
          content: '<p>欢迎在这里讨论本节课的内容。</p>',
          lesson: lesson.id,
          publishedAt: new Date()
        }
      };
      
      try {
        await fetchWithAuth(`${STRAPI_API_URL}/api/modules`, {
          method: 'POST',
          body: JSON.stringify(discussionModule)
        });
        console.log('  ✓ 创建讨论模块');
      } catch (error) {
        console.error('  ✗ 创建讨论模块失败:', error.message);
      }
    }
    
    console.log('\n迁移完成！');
    console.log('\n注意事项：');
    console.log('1. 请在Strapi管理面板中检查Module数据');
    console.log('2. 可以根据需要调整每个模块的内容和顺序');
    console.log('3. 记得重启Strapi服务器以确保新的Content Type生效');
    
  } catch (error) {
    console.error('迁移失败:', error);
  }
}

// 运行迁移
migrateLessons();