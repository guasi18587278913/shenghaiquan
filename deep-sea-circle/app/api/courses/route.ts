import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 获取课程列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const level = searchParams.get("level")

    // 构建查询条件
    const where: any = {
      isPublished: true,
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (level && level !== "all") {
      where.level = level
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        _count: {
          select: {
            chapters: true,
            enrollments: true,
          },
        },
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
    })

    // 获取当前用户的报名状态
    const session = await getServerSession(authOptions)
    let enrolledCourseIds: string[] = []

    if (session) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          courseId: true,
        },
      })
      enrolledCourseIds = enrollments.map(e => e.courseId)
    }

    // 添加报名状态
    const coursesWithEnrollment = courses.map(course => ({
      ...course,
      isEnrolled: enrolledCourseIds.includes(course.id),
    }))

    return NextResponse.json(coursesWithEnrollment)
  } catch (error) {
    console.error("获取课程列表失败:", error)
    return NextResponse.json(
      { error: "获取课程失败" },
      { status: 500 }
    )
  }
}

// 创建课程（仅管理员/教师）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "无权限创建课程" },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { title, description, category, level, cover, price = 0, isPaid = false } = data

    // 验证必填字段
    if (!title || !description || !category || !level) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      )
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level,
        cover,
        price,
        isPaid,
        isPublished: false, // 默认不发布
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("创建课程失败:", error)
    return NextResponse.json(
      { error: "创建失败" },
      { status: 500 }
    )
  }
}