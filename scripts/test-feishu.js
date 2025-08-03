const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

async function testFeishuAPI() {
  console.log('开始测试飞书API配置...\n');

  // 1. 检查环境变量
  console.log('1. 检查环境变量:');
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  if (!appId) {
    console.log('❌ FEISHU_APP_ID 未配置');
  } else {
    console.log(`✅ FEISHU_APP_ID: ${appId.substring(0, 8)}...`);
  }

  if (!appSecret) {
    console.log('❌ FEISHU_APP_SECRET 未配置');
  } else {
    console.log(`✅ FEISHU_APP_SECRET: ${appSecret.substring(0, 8)}...`);
  }

  if (!appId || !appSecret) {
    console.log('\n请在 .env.local 中配置飞书应用凭证');
    return;
  }

  // 2. 测试获取 Token
  console.log('\n2. 测试获取访问令牌:');
  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: appId,
        app_secret: appSecret,
      }
    );

    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    if (response.data.code === 0) {
      console.log('✅ 成功获取访问令牌');
      console.log(`- Token 长度: ${response.data.tenant_access_token.length} 字符`);
      console.log(`- 有效期: ${response.data.expire} 秒`);
      
      // 保存token供后续测试使用
      return response.data.tenant_access_token;
    } else {
      console.log(`❌ 获取令牌失败: ${response.data.msg || '未知错误'}`);
      console.log(`- 错误代码: ${response.data.code}`);
    }
  } catch (error) {
    console.log(`❌ 请求失败: ${error.message}`);
    if (error.response) {
      console.log(`- 状态码: ${error.response.status}`);
      console.log(`- 响应: ${JSON.stringify(error.response.data)}`);
    }
  }
}

// 运行测试
testFeishuAPI().then(() => {
  console.log('\n测试完成');
}).catch(error => {
  console.error('测试出错:', error);
});