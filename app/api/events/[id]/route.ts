import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { EventType } from "@prisma/client"

// GET /api/events/[id] - 获取单个活动详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { 
        id,
        isPublished: true,
      },
      include: {
        participants: {
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
            joinedAt: "desc",
          },
          take: 10, // 只返回最近10个参与者
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json(
        { error: "活动不存在" },
        { status: 404 }
      )
    }

    // 检查当前用户是否已参与
    const session = await getServerSession(authOptions)
    let isParticipant = false
    
    if (session?.user?.id) {
      const participation = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: id,
            userId: session.user.id,
          },
        },
      })
      isParticipant = !!participation
    }

    return NextResponse.json({
      ...event,
      isParticipant,
    })
  } catch (error) {
    console.error("获取活动详情失败:", error)
    return NextResponse.json(
      { error: "获取活动详情失败" },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id] - 更新活动（需要管理员权限）
const updateEventSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  type: z.nativeEnum(EventType).optional(),
  startTime: z.string().transform(str => new Date(str)).optional(),
  endTime: z.string().transform(str => new Date(str)).optional().nullable(),
  location: z.string().optional().nullable(),
  onlineUrl: z.string().url().optional().nullable(),
  organizer: z.string().optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  isPublished: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        { error: "没有权限更新活动" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateEventSchema.parse(body)

    // 如果更新了时间，验证时间逻辑
    if (validatedData.startTime || validatedData.endTime) {
      const event = await prisma.event.findUnique({
        where: { id },
        select: { startTime: true, endTime: true },
      })

      if (!event) {
        return NextResponse.json(
          { error: "活动不存在" },
          { status: 404 }
        )
      }

      const startTime = validatedData.startTime || event.startTime
      const endTime = validatedData.endTime || event.endTime

      if (endTime && endTime <= startTime) {
        return NextResponse.json(
          { error: "结束时间必须晚于开始时间" },
          { status: 400 }
        )
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.issues },
        { status: 400 }
      )
    }
    
    console.error("更新活动失败:", error)
    return NextResponse.json(
      { error: "更新活动失败" },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - 删除活动（需要管理员权限）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        { error: "没有权限删除活动" },
        { status: 403 }
      )
    }

    // 检查活动是否存在
    const event = await prisma.event.findUnique({
      where: { id },
    })

    if (!event) {
      return NextResponse.json(
        { error: "活动不存在" },
        { status: 404 }
      )
    }

    // 删除活动（会级联删除参与记录）
    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ message: "活动已删除" })
  } catch (error) {
    console.error("删除活动失败:", error)
    return NextResponse.json(
      { error: "删除活动失败" },
      { status: 500 }
    )
  }
}