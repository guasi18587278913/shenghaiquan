/**
 * 使用 API Token 创建基础篇剩余的9节课程
 * 
 * 使用前请先在 Strapi 管理面板创建 API Token：
 * 1. 登录 Strapi 管理面板
 * 2. 进入 Settings → API Tokens
 * 3. 点击 Create new API Token
 * 4. Name: Basic Courses Creator
 * 5. Token duration: 7 days
 * 6. Token type: Full access
 * 7. 点击 Save，复制生成的 token
 */

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = 'YOUR_API_TOKEN_HERE'; // 请替换为你的 API Token

// 剩余的9节课程
const remainingCourses = [
  {
    title: '怎么做「AI 产品」?',
    slug: 'how-to-make-ai-product',
    order: 2,
  },
  {
    title: '如何使用 Cursor 打磨产品?',
    slug: 'how-to-use-cursor',
    order: 3,
  },
  {
    title: '如何使用 GitHub 管理源代码?',
    slug: 'how-to-use-github',
    order: 4,
  },
  {
    title: '如何正式发布你的网站产品?',
    slug: 'how-to-publish-website',
    order: 5,
  },
  {
    title: '如何分析用户行为?',
    slug: 'how-to-analyze-user-behavior',
    order: 6,
  },
  {
    title: '如何让产品变得高端大气上档次?',
    slug: 'how-to-make-product-premium',
    order: 7,
  },
  {
    title: '如何借助开源软件加快开发过程?',
    slug: 'how-to-use-opensource',
    order: 8,
  },
  {
    title: '如何冷启动?',
    slug: 'how-to-cold-start',
    order: 9,
  },
  {
    title: '如何让 AI发挥最大的潜力?',
    slug: 'how-to-maximize-ai-potential',
    order: 10,
  }
];

// 每节课的3个固定模块
const moduleTemplates = [
  { title: '课前准备', type: 'reading', order: 1, duration: '10分钟' },
  { title: '课程内容', type: 'video', order: 2, duration: '15分钟' },
  { title: '课后作业', type: 'assignment', order: 3, duration: '10分钟' },
];

async function createBasicCourses() {
  if (API_TOKEN === 'YOUR_API_TOKEN_HERE') {
    console.error('请先设置 API_TOKEN！');
    console.log('\n获取 API Token 的步骤：');
    console.log('1. 登录 Strapi 管理面板: http://localhost:1337/admin');
    console.log('2. 进入 Settings → API Tokens');
    console.log('3. 点击 Create new API Token');
    console.log('4. 设置名称和权限，点击 Save');
    console.log('5. 复制生成的 token，替换脚本中的 API_TOKEN');
    return;
  }

  console.log('开始创建基础篇剩余课程...\n');
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`
  };
  
  let successCount = 0;
  
  for (const course of remainingCourses) {
    console.log(`创建课程 ${course.order}: ${course.title}`);
    
    try {
      // 创建课程
      const lessonResponse = await fetch(`${STRAPI_URL}/api/lessons`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          data: {
            title: course.title,
            slug: course.slug,
            order: course.order,
            section: 4, // 基础篇的ID
            description: `基础篇第${course.order}课`,
            content: `<p>${course.title}的课程内容即将上线...</p>`,
            publishedAt: new Date().toISOString(),
          }
        })
      });
      
      if (!lessonResponse.ok) {
        const error = await lessonResponse.text();
        console.error(`  ❌ 创建课程失败: ${error}`);
        continue;
      }
      
      const lessonData = await lessonResponse.json();
      const lessonId = lessonData.data.id;
      console.log(`  ✅ 课程创建成功，ID: ${lessonId}`);
      
      // 为每个课程创建3个模块
      for (const moduleTemplate of moduleTemplates) {
        console.log(`    创建模块: ${moduleTemplate.title}`);
        
        const moduleResponse = await fetch(`${STRAPI_URL}/api/modules`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: {
              title: moduleTemplate.title,
              type: moduleTemplate.type,
              order: moduleTemplate.order,
              lesson: lessonId,
              content: `<p>${course.title} - ${moduleTemplate.title}内容即将上线...</p>`,
              duration: moduleTemplate.duration,
              publishedAt: new Date().toISOString(),
            }
          })
        });
        
        if (!moduleResponse.ok) {
          const error = await moduleResponse.text();
          console.error(`    ❌ 创建模块失败: ${error}`);
        } else {
          console.log(`    ✅ 模块创建成功`);
        }
      }
      
      successCount++;
      console.log('');
      
    } catch (error) {
      console.error(`创建课程时发生错误: ${error.message}`);
    }
  }
  
  console.log(`\n=====================================`);
  console.log(`总结：成功创建了 ${successCount} 个课程`);
  console.log(`=====================================\n`);
}

createBasicCourses();