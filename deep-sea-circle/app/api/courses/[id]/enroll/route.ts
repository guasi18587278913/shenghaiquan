import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 报名课程
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const courseId = id

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: "课程不存在" },
        { status: 404 }
      )
    }

    if (!course.isPublished) {
      return NextResponse.json(
        { error: "课程暂未开放" },
        { status: 400 }
      )
    }

    // 检查是否已报名
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "您已报名该课程" },
        { status: 400 }
      )
    }

    // 创建报名记录
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
      },
    })

    return NextResponse.json({
      message: "报名成功",
      enrollment,
    })
  } catch (error) {
    console.error("报名失败:", error)
    return NextResponse.json(
      { error: "报名失败，请稍后重试" },
      { status: 500 }
    )
  }
}