import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取会话列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 获取用户的所有会话
    const conversations = await prisma.conversationParticipant.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc'
        }
      }
    });

    // 格式化会话数据
    const formattedConversations = conversations.map(cp => {
      const otherParticipants = cp.conversation.participants.filter(
        p => p.userId !== session.user.id
      );
      
      const lastMessage = cp.conversation.messages[0];
      const otherUser = otherParticipants[0]?.user;

      return {
        id: cp.conversation.id,
        type: cp.conversation.type,
        name: cp.conversation.name || otherUser?.name || otherUser?.email || '未知用户',
        avatar: cp.conversation.avatar || otherUser?.image,
        unreadCount: cp.unreadCount,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          senderName: lastMessage.sender.name,
          createdAt: lastMessage.createdAt
        } : null,
        participants: cp.conversation.participants.map(p => ({
          userId: p.user.id,
          name: p.user.name || p.user.email,
          avatar: p.user.image
        }))
      };
    });

    return NextResponse.json({
      conversations: formattedConversations,
      total: formattedConversations.length
    });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    return NextResponse.json(
      { error: '获取会话列表失败' },
      { status: 500 }
    );
  }
}

// 创建新会话
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const body = await request.json();
    const { participantIds, type = 'C2C', name = null } = body;

    if (!participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json(
        { error: '参数错误' },
        { status: 400 }
      );
    }

    // 检查是否已存在相同的会话（C2C）
    if (type === 'C2C' && participantIds.length === 1) {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: 'C2C',
          participants: {
            every: {
              userId: {
                in: [session.user.id, participantIds[0]]
              }
            }
          }
        }
      });

      if (existingConversation) {
        return NextResponse.json({
          conversation: existingConversation,
          isNew: false
        });
      }
    }

    // 创建新会话
    const conversation = await prisma.conversation.create({
      data: {
        type,
        name,
        participants: {
          create: [
            { userId: session.user.id },
            ...participantIds.map((id: string) => ({ userId: id }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      conversation,
      isNew: true
    });
  } catch (error) {
    console.error('创建会话失败:', error);
    return NextResponse.json(
      { error: '创建会话失败' },
      { status: 500 }
    );
  }
}