import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 检查是否已收藏
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: id
        }
      }
    })

    return NextResponse.json({ bookmarked: !!bookmark })

  } catch (error) {
    console.error('检查收藏状态失败:', error)
    return NextResponse.json(
      { error: '检查收藏状态失败' },
      { status: 500 }
    )
  }
}

// 收藏或取消收藏
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const postId = id

    // 检查帖子是否存在
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: '帖子不存在' },
        { status: 404 }
      )
    }

    // 检查是否已收藏
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId
        }
      }
    })

    if (existingBookmark) {
      // 已收藏，取消收藏
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id }
      })
      return NextResponse.json({ bookmarked: false })
    } else {
      // 未收藏，添加收藏
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          postId
        }
      })
      return NextResponse.json({ bookmarked: true })
    }

  } catch (error) {
    console.error('收藏操作失败:', error)
    return NextResponse.json(
      { error: '收藏操作失败' },
      { status: 500 }
    )
  }
}