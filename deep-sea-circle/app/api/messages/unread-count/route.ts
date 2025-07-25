import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取未读消息数
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取未读消息总数
    const count = await prisma.message.count({
      where: {
        receiverId: session.user.id,
        isRead: false
      }
    })

    return NextResponse.json({ count })

  } catch (error) {
    console.error('获取未读消息数失败:', error)
    return NextResponse.json(
      { error: '获取未读消息数失败' },
      { status: 500 }
    )
  }
}