import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 标记单个通知为已读
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const notificationId = params.id

    // 更新通知状态（只能更新自己的通知）
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: '通知不存在或已读' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('标记通知已读失败:', error)
    return NextResponse.json(
      { error: '标记通知已读失败' },
      { status: 500 }
    )
  }
}