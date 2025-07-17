import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendCommentNotification } from "@/lib/notifications"

// 获取评论列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id

    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // 只获取一级评论
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("获取评论失败:", error)
    return NextResponse.json(
      { error: "获取评论失败" },
      { status: 500 }
    )
  }
}

// 发布评论
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const postId = params.id
    const { content, parentId } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "评论内容不能为空" },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content: content.trim(),
        parentId,
      },
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
            likes: true,
          },
        },
      },
    })

    // 获取帖子信息以发送通知
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        title: true,
        userId: true
      }
    })

    // 如果评论者不是帖子作者，发送通知
    if (post && post.userId !== session.user.id) {
      await sendCommentNotification(
        post.userId,
        session.user.name || '用户',
        post.title,
        postId
      )
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("发布评论失败:", error)
    return NextResponse.json(
      { error: "发布失败，请稍后重试" },
      { status: 500 }
    )
  }
}