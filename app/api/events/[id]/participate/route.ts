import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// POST /api/events/[id]/participate - 参与活动
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    // 检查活动是否存在
    const event = await prisma.event.findUnique({
      where: { 
        id: params.id,
        isPublished: true,
      },
      include: {
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

    // 检查活动是否已开始
    if (new Date() >= event.startTime) {
      return NextResponse.json(
        { error: "活动已开始，无法报名" },
        { status: 400 }
      )
    }

    // 检查是否已参与
    const existingParticipation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (existingParticipation) {
      return NextResponse.json(
        { error: "您已经报名参加此活动" },
        { status: 400 }
      )
    }

    // 检查是否已满
    if (event.maxParticipants && event._count.participants >= event.maxParticipants) {
      return NextResponse.json(
        { error: "活动报名已满" },
        { status: 400 }
      )
    }

    // 创建参与记录
    const participation = await prisma.eventParticipant.create({
      data: {
        eventId: params.id,
        userId: session.user.id,
      },
    })

    // 创建通知
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "EVENT",
        title: "活动报名成功",
        content: `您已成功报名参加「${event.title}」`,
        link: `/calendar/${params.id}`,
      },
    })

    return NextResponse.json(participation, { status: 201 })
  } catch (error) {
    console.error("参与活动失败:", error)
    return NextResponse.json(
      { error: "参与活动失败" },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id]/participate - 取消参与活动
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    // 检查活动是否存在
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    })

    if (!event) {
      return NextResponse.json(
        { error: "活动不存在" },
        { status: 404 }
      )
    }

    // 检查活动是否已开始
    if (new Date() >= event.startTime) {
      return NextResponse.json(
        { error: "活动已开始，无法取消报名" },
        { status: 400 }
      )
    }

    // 检查是否已参与
    const participation = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
    })

    if (!participation) {
      return NextResponse.json(
        { error: "您尚未报名参加此活动" },
        { status: 400 }
      )
    }

    // 删除参与记录
    await prisma.eventParticipant.delete({
      where: {
        id: participation.id,
      },
    })

    // 创建通知
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "EVENT",
        title: "已取消活动报名",
        content: `您已取消参加「${event.title}」`,
        link: `/calendar/${params.id}`,
      },
    })

    return NextResponse.json({ message: "已取消参与" })
  } catch (error) {
    console.error("取消参与活动失败:", error)
    return NextResponse.json(
      { error: "取消参与活动失败" },
      { status: 500 }
    )
  }
}