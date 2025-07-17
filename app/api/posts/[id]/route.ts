import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const postId = params.id

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "动态不存在" },
        { status: 404 }
      )
    }

    // 增加浏览量
    await prisma.post.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
    })

    // 检查是否已点赞
    let isLiked = false
    if (session) {
      const like = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
      })
      isLiked = !!like
    }

    return NextResponse.json({
      ...post,
      isLiked,
    })
  } catch (error) {
    console.error("获取动态详情失败:", error)
    return NextResponse.json(
      { error: "获取失败" },
      { status: 500 }
    )
  }
}