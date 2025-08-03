require('dotenv').config({ path: '.env.local' });

async function testFeishu() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  console.log('App ID:', appId);
  console.log('App Secret:', appSecret ? '已配置' : '未配置');

  try {
    const response = await fetch(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret,
        }),
      }
    );

    const data = await response.json();
    console.log('\n响应:', data);

    if (data.code === 0) {
      console.log('\n✅ 测试成功！');
      console.log('Token:', data.tenant_access_token.substring(0, 20) + '...');
      console.log('有效期:', data.expire, '秒');
      
      // 测试文档访问
      if (process.argv[2]) {
        console.log('\n测试文档访问...');
        const docId = process.argv[2].match(/\/docx\/([^/?]+)/)?.[1];
        if (docId) {
          await testDocument(data.tenant_access_token, docId);
        }
      }
    } else {
      console.log('\n❌ 获取 token 失败:', data);
    }
  } catch (error) {
    console.error('错误:', error);
  }
}

async function testDocument(token, docId) {
  try {
    const response = await fetch(
      `https://open.feishu.cn/open-apis/docx/v1/documents/${docId}/blocks?page_size=50`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    
    if (data.code === 0) {
      console.log('✅ 文档访问成功');
      console.log('文档块数量:', data.data.items?.length || 0);
    } else {
      console.log('❌ 文档访问失败:', data);
    }
  } catch (error) {
    console.error('文档测试错误:', error);
  }
}

testFeishu();