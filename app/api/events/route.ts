import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { EventType } from "@prisma/client"

// GET /api/events - 获取活动列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") as EventType | null
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {
      isPublished: true,
    }

    // 类型筛选
    if (type && Object.values(EventType).includes(type)) {
      where.type = type
    }

    // 日期范围筛选
    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) {
        where.startTime.gte = new Date(startDate)
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate)
      }
    }

    // 获取总数
    const total = await prisma.event.count({ where })

    // 获取活动列表
    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
      take: limit,
      skip: offset,
    })

    // 如果用户已登录，添加参与状态
    const session = await getServerSession(authOptions)
    let eventsWithParticipation = events

    if (session?.user?.id) {
      const participations = await prisma.eventParticipant.findMany({
        where: {
          userId: session.user.id,
          eventId: {
            in: events.map(e => e.id),
          },
        },
        select: {
          eventId: true,
        },
      })

      const participatedEventIds = new Set(participations.map(p => p.eventId))
      
      eventsWithParticipation = events.map(event => ({
        ...event,
        isParticipant: participatedEventIds.has(event.id),
      }))
    }

    return NextResponse.json({
      events: eventsWithParticipation,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("获取活动列表失败:", error)
    return NextResponse.json(
      { error: "获取活动列表失败" },
      { status: 500 }
    )
  }
}

// POST /api/events - 创建活动（需要管理员权限）
const createEventSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.nativeEnum(EventType),
  startTime: z.string().transform(str => new Date(str)),
  endTime: z.string().transform(str => new Date(str)).optional(),
  location: z.string().optional(),
  onlineUrl: z.string().url().optional(),
  organizer: z.string().optional(),
  maxParticipants: z.number().int().positive().optional(),
  isPublished: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    // 检查是否是管理员
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "没有权限创建活动" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createEventSchema.parse(body)

    // 验证时间逻辑
    if (validatedData.endTime && validatedData.endTime <= validatedData.startTime) {
      return NextResponse.json(
        { error: "结束时间必须晚于开始时间" },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        ...validatedData,
        organizer: validatedData.organizer || session.user.name || "深海圈",
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("创建活动失败:", error)
    return NextResponse.json(
      { error: "创建活动失败" },
      { status: 500 }
    )
  }
}