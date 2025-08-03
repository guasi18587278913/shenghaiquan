import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { IMService } from '@/lib/im-server';

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 生成 UserSig
    const imService = new IMService();
    const userId = session.user.id || session.user.email || '';
    const userSig = imService.generateUserSig(userId);

    return NextResponse.json({
      userId,
      userSig,
      sdkAppId: process.env.NEXT_PUBLIC_IM_APPID
    });
  } catch (error) {
    console.error('生成UserSig失败:', error);
    return NextResponse.json(
      { error: '生成UserSig失败' },
      { status: 500 }
    );
  }
}