import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取会话列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取所有相关消息
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 整理会话列表
    const conversationsMap = new Map<string, any>()
    
    messages.forEach(message => {
      const otherUser = message.senderId === session.user.id 
        ? message.receiver 
        : message.sender
      
      const existing = conversationsMap.get(otherUser.id)
      
      if (!existing || new Date(message.createdAt) > new Date(existing.lastMessage.createdAt)) {
        conversationsMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            isSent: message.senderId === session.user.id
          }
        })
      }
    })

    // 计算未读消息数
    const conversations = Array.from(conversationsMap.values())
    
    for (const conv of conversations) {
      const unreadCount = await prisma.message.count({
        where: {
          senderId: conv.user.id,
          receiverId: session.user.id,
          isRead: false
        }
      })
      conv.unreadCount = unreadCount
    }

    // 按最后消息时间排序
    conversations.sort((a, b) => 
      new Date(b.lastMessage.createdAt).getTime() - 
      new Date(a.lastMessage.createdAt).getTime()
    )

    return NextResponse.json(conversations)

  } catch (error) {
    console.error('获取会话列表失败:', error)
    return NextResponse.json(
      { error: '获取会话列表失败' },
      { status: 500 }
    )
  }
}