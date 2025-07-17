import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取通知列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // 限制返回最近100条
    })

    return NextResponse.json(notifications)

  } catch (error) {
    console.error('获取通知失败:', error)
    return NextResponse.json(
      { error: '获取通知失败' },
      { status: 500 }
    )
  }
}

// 创建通知（内部使用）
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
    const { userId, type, title, content, link } = body

    // 验证参数
    if (!userId || !type || !title || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 创建通知
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        link
      }
    })

    return NextResponse.json(notification)

  } catch (error) {
    console.error('创建通知失败:', error)
    return NextResponse.json(
      { error: '创建通知失败' },
      { status: 500 }
    )
  }
}