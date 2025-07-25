import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 标记所有通知为已读
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 批量更新所有未读通知
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
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
    console.error('标记全部通知已读失败:', error)
    return NextResponse.json(
      { error: '标记全部通知已读失败' },
      { status: 500 }
    )
  }
}