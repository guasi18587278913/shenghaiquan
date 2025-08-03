import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 更新用户在线状态
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { isOnline, platform = 'web' } = body;

    // 更新或创建在线状态
    const status = await prisma.userOnlineStatus.upsert({
      where: { userId: session.user.id },
      update: {
        isOnline,
        lastSeenAt: new Date(),
        platform
      },
      create: {
        userId: session.user.id,
        isOnline,
        platform
      }
    });

    return NextResponse.json({
      status,
      success: true
    });
  } catch (error) {
    console.error('更新在线状态失败:', error);
    return NextResponse.json(
      { error: '更新状态失败' },
      { status: 500 }
    );
  }
}

// 获取用户在线状态
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userIds = searchParams.get('userIds')?.split(',') || [];

    if (userIds.length === 0) {
      return NextResponse.json({ statuses: [] });
    }

    // 获取指定用户的在线状态
    const statuses = await prisma.userOnlineStatus.findMany({
      where: {
        userId: { in: userIds }
      },
      select: {
        userId: true,
        isOnline: true,
        lastSeenAt: true,
        platform: true
      }
    });

    // 构建状态映射
    const statusMap = statuses.reduce((acc, status) => {
      acc[status.userId] = status;
      return acc;
    }, {} as Record<string, any>);

    // 确保所有请求的用户都有状态返回
    const result = userIds.map(userId => ({
      userId,
      isOnline: statusMap[userId]?.isOnline || false,
      lastSeenAt: statusMap[userId]?.lastSeenAt || null,
      platform: statusMap[userId]?.platform || null
    }));

    return NextResponse.json({
      statuses: result
    });
  } catch (error) {
    console.error('获取在线状态失败:', error);
    return NextResponse.json(
      { error: '获取状态失败' },
      { status: 500 }
    );
  }
}