import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

// 生成VOD上传签名
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const secretId = process.env.VOD_SECRET_ID;
    const secretKey = process.env.VOD_SECRET_KEY;
    
    if (!secretId || !secretKey) {
      return NextResponse.json({ error: 'VOD配置缺失' }, { status: 500 });
    }

    // 生成签名
    const current = Math.floor(Date.now() / 1000);
    const expired = current + 86400; // 24小时有效期
    
    const signature = {
      secretId: secretId,
      currentTimeStamp: current,
      expireTime: expired,
      random: Math.floor(Math.random() * 999999),
      classId: 0,
      procedure: 'DefaultProcedure' // 默认转码模板
    };

    // 计算签名
    const original = Object.entries(signature)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(original);
    const signatureStr = hmac.digest('base64');
    
    const finalSignature = Buffer.from(
      JSON.stringify({ ...signature, signature: signatureStr })
    ).toString('base64');

    return NextResponse.json({
      signature: finalSignature,
      vodUserId: session.user?.id
    });
  } catch (error) {
    console.error('VOD签名生成错误:', error);
    return NextResponse.json(
      { error: '签名生成失败' },
      { status: 500 }
    );
  }
}