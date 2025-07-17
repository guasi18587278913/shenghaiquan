import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取消息记录
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    // 获取两个用户之间的所有消息
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            receiverId: userId
          },
          {
            senderId: userId,
            receiverId: session.user.id
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)

  } catch (error) {
    console.error('获取消息失败:', error)
    return NextResponse.json(
      { error: '获取消息失败' },
      { status: 500 }
    )
  }
}

// 发送消息
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { receiverId, content } = body

    // 验证参数
    if (!receiverId || !content?.trim()) {
      return NextResponse.json(
        { error: '接收者ID和消息内容不能为空' },
        { status: 400 }
      )
    }

    // 检查接收者是否存在
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      return NextResponse.json(
        { error: '接收者不存在' },
        { status: 404 }
      )
    }

    // 不能给自己发消息
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: '不能给自己发送消息' },
        { status: 400 }
      )
    }

    // 创建消息
    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json(message)

  } catch (error) {
    console.error('发送消息失败:', error)
    return NextResponse.json(
      { error: '发送消息失败' },
      { status: 500 }
    )
  }
}