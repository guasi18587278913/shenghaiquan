import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const postId = params.id
    const userId = session.user.id

    // 检查是否已经收藏
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    })

    if (existingBookmark) {
      // 如果已收藏，则取消收藏
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      })

      // 获取更新后的收藏数
      const bookmarkCount = await prisma.bookmark.count({
        where: { postId },
      })

      return NextResponse.json({
        isBookmarked: false,
        bookmarkCount,
      })
    } else {
      // 如果未收藏，则添加收藏
      await prisma.bookmark.create({
        data: {
          userId,
          postId,
        },
      })

      // 获取更新后的收藏数
      const bookmarkCount = await prisma.bookmark.count({
        where: { postId },
      })

      return NextResponse.json({
        isBookmarked: true,
        bookmarkCount,
      })
    }
  } catch (error) {
    console.error("收藏操作失败:", error)
    return NextResponse.json(
      { error: "收藏操作失败" },
      { status: 500 }
    )
  }
}

// 获取收藏状态
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const postId = params.id

    // 获取收藏数
    const bookmarkCount = await prisma.bookmark.count({
      where: { postId },
    })

    // 如果用户已登录，检查是否已收藏
    let isBookmarked = false
    if (session?.user?.id) {
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      })
      isBookmarked = !!bookmark
    }

    return NextResponse.json({
      isBookmarked,
      bookmarkCount,
    })
  } catch (error) {
    console.error("获取收藏状态失败:", error)
    return NextResponse.json(
      { error: "获取收藏状态失败" },
      { status: 500 }
    )
  }
}