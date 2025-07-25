import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取用户的收藏列表
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        post: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            },
            _count: {
              select: {
                comments: true,
                likes: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 提取帖子信息
    const posts = bookmarks.map(bookmark => bookmark.post)

    return NextResponse.json(posts)

  } catch (error) {
    console.error('获取收藏列表失败:', error)
    return NextResponse.json(
      { error: '获取收藏列表失败' },
      { status: 500 }
    )
  }
}