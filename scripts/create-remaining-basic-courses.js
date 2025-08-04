/**
 * 创建基础篇剩余的9节课程
 * 注意：需要先在 Strapi 管理面板设置 Public 权限
 */

const STRAPI_URL = 'http://localhost:1337';

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

console.log(`
=====================================
在运行此脚本之前，请确保：

1. 登录 Strapi 管理面板: http://localhost:1337/admin
2. 进入 Settings → USERS & PERMISSIONS PLUGIN → Roles → Public
3. 勾选以下权限并保存：
   - Lesson: create, find, findOne
   - Module: create, find, findOne
   - Course: find, findOne

按 Enter 继续，或按 Ctrl+C 取消...
=====================================
`);

// 等待用户确认
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('', async () => {
  rl.close();
  
  console.log('\n开始创建课程...\n');
  
  // 模块模板
  const moduleTemplates = [
    { title: '课前准备', type: 'reading', order: 1, duration: '10分钟' },
    { title: '课程内容', type: 'video', order: 2, duration: '15分钟' },
    { title: '课后作业', type: 'assignment', order: 3, duration: '10分钟' },
  ];
  
  let successCount = 0;
  
  for (const course of remainingCourses) {
    console.log(`创建课程 ${course.order}: ${course.title}`);
    
    try {
      // 创建课程
      const lessonResponse = await fetch(`${STRAPI_URL}/api/lessons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          headers: {
            'Content-Type': 'application/json',
          },
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
  
  if (successCount < remainingCourses.length) {
    console.log('部分课程创建失败，请检查 Strapi 权限设置或手动创建。');
  }
});