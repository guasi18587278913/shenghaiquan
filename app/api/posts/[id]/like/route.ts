import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

    // 检查是否已经点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    })

    if (existingLike) {
      // 取消点赞
      await prisma.like.delete({
        where: { id: existingLike.id },
      })
      return NextResponse.json({ liked: false })
    } else {
      // 点赞
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("点赞操作失败:", error)
    return NextResponse.json(
      { error: "操作失败，请稍后重试" },
      { status: 500 }
    )
  }
}