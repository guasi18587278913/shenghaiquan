import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 发送消息
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, content, type = 'text', metadata } = body;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400 }
      );
    }

    // 验证用户是否是会话参与者
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id
        }
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: '无权发送消息' },
        { status: 403 }
      );
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        type,
        content,
        metadata
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // 更新会话的最后更新时间
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // 更新其他参与者的未读数
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: session.user.id }
      },
      data: {
        unreadCount: { increment: 1 }
      }
    });

    return NextResponse.json({
      message,
      success: true
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    return NextResponse.json(
      { error: '发送消息失败' },
      { status: 500 }
    );
  }
}

// 获取会话消息列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // 用于分页

    if (!conversationId) {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400 }
      );
    }

    // 验证用户是否是会话参与者
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id
        }
      }
    });

    if (!participant) {
      return NextResponse.json(
        { error: '无权查看消息' },
        { status: 403 }
      );
    }

    // 获取消息
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
        ...(before && { createdAt: { lt: new Date(before) } })
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        readBy: {
          where: { userId: session.user.id },
          select: { readAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    // 标记消息为已读
    const unreadMessageIds = messages
      .filter(msg => msg.readBy.length === 0 && msg.senderId !== session.user.id)
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      await prisma.messageRead.createMany({
        data: unreadMessageIds.map(messageId => ({
          messageId,
          userId: session.user.id
        })),
        skipDuplicates: true
      });

      // 重置未读数
      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: session.user.id
          }
        },
        data: { unreadCount: 0 }
      });
    }

    return NextResponse.json({
      messages: messages.reverse(), // 按时间正序返回
      hasMore: messages.length === limit
    });
  } catch (error) {
    console.error('获取消息失败:', error);
    return NextResponse.json(
      { error: '获取消息失败' },
      { status: 500 }
    );
  }
}