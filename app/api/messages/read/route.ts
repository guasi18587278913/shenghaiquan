import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 标记消息为已读
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
    const { senderId } = body

    if (!senderId) {
      return NextResponse.json(
        { error: '缺少发送者ID' },
        { status: 400 }
      )
    }

    // 批量更新该发送者发给当前用户的所有未读消息为已读
    const result = await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      count: result.count 
    })

  } catch (error) {
    console.error('标记消息已读失败:', error)
    return NextResponse.json(
      { error: '标记消息已读失败' },
      { status: 500 }
    )
  }
}