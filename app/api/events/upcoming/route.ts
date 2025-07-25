import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET /api/events/upcoming - 获取即将开始的活动
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "5")

    // 获取即将开始的活动（未来7天内）
    const now = new Date()
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
        startTime: {
          gte: now,
          lte: sevenDaysLater,
        },
      },
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
      total: eventsWithParticipation.length,
    })
  } catch (error) {
    console.error("获取即将开始的活动失败:", error)
    return NextResponse.json(
      { error: "获取即将开始的活动失败" },
      { status: 500 }
    )
  }
}