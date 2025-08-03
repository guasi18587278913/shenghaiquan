import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // 搜索用户
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: { not: session.user.id } // 排除自己
          },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        onlineStatus: {
          select: {
            isOnline: true,
            lastSeenAt: true
          }
        }
      },
      take: limit
    });

    // 格式化返回数据
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      avatar: user.image,
      role: user.role || 'STUDENT',
      isOnline: user.onlineStatus?.isOnline || false,
      lastSeenAt: user.onlineStatus?.lastSeenAt || null
    }));

    return NextResponse.json({
      users: formattedUsers,
      total: formattedUsers.length
    });
  } catch (error) {
    console.error('搜索用户失败:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}