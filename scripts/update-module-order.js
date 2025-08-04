/**
 * 更新第一节课的模块顺序和文案
 */

const STRAPI_URL = 'http://localhost:1337';

async function updateModuleOrder() {
  console.log('开始更新模块顺序和文案...\n');
  
  try {
    // 1. 获取第一节课的信息
    console.log('1. 获取第一节课的模块信息...');
    const lessonResponse = await fetch(
      `${STRAPI_URL}/api/lessons/7?populate[modules]=true`
    );
    
    if (!lessonResponse.ok) {
      console.error('获取课程失败');
      return;
    }
    
    const lessonData = await lessonResponse.json();
    const modules = lessonData.data.modules || [];
    
    console.log(`找到 ${modules.length} 个模块:\n`);
    modules.forEach(m => {
      console.log(`- ${m.title} (ID: ${m.id}, Order: ${m.order}, Type: ${m.type})`);
    });
    
    // 2. 找到各个模块
    const preparationModule = modules.find(m => m.title.includes('准备工作'));
    const introModule = modules.find(m => m.title.includes('课程介绍'));
    const practiceModule = modules.find(m => m.title.includes('动手实践'));
    
    if (!preparationModule || !introModule || !practiceModule) {
      console.error('\n未找到所有必需的模块');
      return;
    }
    
    console.log('\n2. 开始更新模块...\n');
    
    // 3. 更新准备工作模块 - 改为第1位
    console.log('更新准备工作模块顺序...');
    const prep1Response = await fetch(`${STRAPI_URL}/api/modules/${preparationModule.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          order: 1
        }
      })
    });
    
    if (prep1Response.ok) {
      console.log('✅ 准备工作模块更新为第1位');
    } else {
      console.error('❌ 更新失败:', await prep1Response.text());
    }
    
    // 4. 更新课程介绍模块 - 改为第2位
    console.log('\n更新课程介绍模块顺序...');
    const intro2Response = await fetch(`${STRAPI_URL}/api/modules/${introModule.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          order: 2
        }
      })
    });
    
    if (intro2Response.ok) {
      console.log('✅ 课程介绍模块更新为第2位');
    } else {
      console.error('❌ 更新失败:', await intro2Response.text());
    }
    
    // 5. 更新动手实践模块 - 改为第3位，并修改标题
    console.log('\n更新动手实践模块...');
    const practice3Response = await fetch(`${STRAPI_URL}/api/modules/${practiceModule.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          order: 3,
          title: '课后作业 - 创建你的第一个网站'
        }
      })
    });
    
    if (practice3Response.ok) {
      console.log('✅ 动手实践模块更新为第3位，标题已修改为"课后作业"');
    } else {
      console.error('❌ 更新失败:', await practice3Response.text());
    }
    
    console.log('\n\n=====================================');
    console.log('请注意：');
    console.log('1. 确保在 Strapi 管理面板中给 Public 角色添加了 Module 的 update 权限');
    console.log('2. 或者直接在 Strapi 管理面板中手动调整：');
    console.log('   - Content Manager → Module');
    console.log('   - 找到对应的模块，修改 Order 和 Title');
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('发生错误:', error);
  }
}

updateModuleOrder();