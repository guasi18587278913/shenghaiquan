/**
 * 为基础篇创建10节课程，每节课程包含3个固定模块
 */

const STRAPI_URL = 'http://localhost:1337';

// 基础篇的10节课程
const basicCourses = [
  {
    title: '玩起来! 通过 AI，10 分钟发布你的第一款网站产品!',
    slug: 'play-with-ai',
    order: 1,
  },
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
  { title: '课前准备', type: 'reading', order: 1 },
  { title: '课程内容', type: 'video', order: 2 },
  { title: '课后作业', type: 'assignment', order: 3 },
];

async function createBasicCourses() {
  try {
    // 1. 首先获取基础篇的ID
    console.log('获取基础篇章节...');
    const sectionsResponse = await fetch(`${STRAPI_URL}/api/courses?filters[slug][$eq]=basic`);
    const sectionsData = await sectionsResponse.json();
    
    if (!sectionsData.data || sectionsData.data.length === 0) {
      console.error('未找到基础篇章节，请先在Strapi中创建');
      return;
    }
    
    const basicSectionId = sectionsData.data[0].id;
    console.log(`找到基础篇，ID: ${basicSectionId}`);
    
    // 2. 为每个课程创建记录
    for (const course of basicCourses) {
      console.log(`\n创建课程: ${course.title}`);
      
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
            section: basicSectionId,
            description: `基础篇第${course.order}课`,
            content: `<p>课程内容即将上线...</p>`,
            publishedAt: new Date().toISOString(),
          }
        })
      });
      
      if (!lessonResponse.ok) {
        const error = await lessonResponse.text();
        console.error(`创建课程失败: ${error}`);
        continue;
      }
      
      const lessonData = await lessonResponse.json();
      const lessonId = lessonData.data.id;
      console.log(`课程创建成功，ID: ${lessonId}`);
      
      // 3. 为每个课程创建3个固定模块
      for (const moduleTemplate of moduleTemplates) {
        console.log(`  创建模块: ${moduleTemplate.title}`);
        
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
              content: `<p>${moduleTemplate.title}内容即将上线...</p>`,
              duration: moduleTemplate.type === 'video' ? '15分钟' : '10分钟',
              publishedAt: new Date().toISOString(),
            }
          })
        });
        
        if (!moduleResponse.ok) {
          const error = await moduleResponse.text();
          console.error(`  创建模块失败: ${error}`);
        } else {
          console.log(`  模块创建成功`);
        }
      }
    }
    
    console.log('\n✅ 基础篇课程创建完成！');
    
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 执行脚本
createBasicCourses();