import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;

  return NextResponse.json({
    hasAppId: !!appId,
    hasAppSecret: !!appSecret,
    appIdPreview: appId ? `${appId.substring(0, 8)}...` : null,
  });
}