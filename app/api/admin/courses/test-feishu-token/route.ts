import { NextResponse } from 'next/server';
import { FeishuAPI } from '@/lib/feishu-api';

export async function GET() {
  try {
    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json({
        success: false,
        error: '环境变量未配置'
      });
    }

    // 创建API实例并尝试获取token
    const feishuAPI = new FeishuAPI({ appId, appSecret });
    
    // 通过调用一个简单的API来测试token
    const testResponse = await fetch(
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

    const data = await testResponse.json();

    if (data.code === 0) {
      return NextResponse.json({
        success: true,
        tokenLength: data.tenant_access_token?.length || 0,
        expiresIn: data.expire,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `飞书API错误: ${data.msg || '未知错误'}`,
        code: data.code,
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取token失败',
    });
  }
}