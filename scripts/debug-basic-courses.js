const STRAPI_URL = 'http://localhost:1337';

async function debugBasicCourses() {
  console.log('调试基础篇课程数据...\n');
  
  try {
    // 1. 获取基础篇信息
    console.log('1. 获取基础篇信息:');
    const sectionResponse = await fetch(`${STRAPI_URL}/api/courses?filters[slug][$eq]=basic`);
    const sectionData = await sectionResponse.json();
    console.log('基础篇数据:', JSON.stringify(sectionData.data[0], null, 2));
    
    if (!sectionData.data || sectionData.data.length === 0) {
      console.log('❌ 未找到基础篇');
      return;
    }
    
    const basicSectionId = sectionData.data[0].id;
    console.log(`\n基础篇 ID: ${basicSectionId}\n`);
    
    // 2. 获取基础篇下的所有课程
    console.log('2. 获取基础篇下的所有课程:');
    const lessonsResponse = await fetch(
      `${STRAPI_URL}/api/lessons?filters[section][id][$eq]=${basicSectionId}&populate[modules]=true&sort=order`
    );
    const lessonsData = await lessonsResponse.json();
    
    console.log(`找到 ${lessonsData.data.length} 个课程:\n`);
    
    lessonsData.data.forEach((lesson, index) => {
      console.log(`课程 ${index + 1}: ${lesson.title}`);
      console.log(`  - ID: ${lesson.id}`);
      console.log(`  - Slug: ${lesson.slug}`);
      console.log(`  - Order: ${lesson.order}`);
      console.log(`  - 模块数: ${lesson.modules ? lesson.modules.length : 0}`);
      if (lesson.modules && lesson.modules.length > 0) {
        lesson.modules.forEach(module => {
          console.log(`    - ${module.title} (${module.type})`);
        });
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('发生错误:', error);
  }
}

debugBasicCourses();