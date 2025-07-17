import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 获取课程详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id
    const session = await getServerSession(authOptions)

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            order: true,
            isLocked: true,
            unlockType: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: "课程不存在" },
        { status: 404 }
      )
    }

    // 检查用户是否已报名
    let enrollment = null
    let progress = []

    if (session) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId,
          },
        },
      })

      if (enrollment) {
        // 获取学习进度
        progress = await prisma.progress.findMany({
          where: {
            userId: session.user.id,
            chapter: {
              courseId,
            },
          },
          select: {
            chapterId: true,
            isCompleted: true,
            watchTime: true,
            lastPosition: true,
          },
        })
      }
    }

    // 根据解锁规则处理章节状态
    const chaptersWithProgress = course.chapters.map((chapter, index) => {
      const chapterProgress = progress.find(p => p.chapterId === chapter.id)
      
      // 判断章节是否解锁
      let isUnlocked = false
      if (!enrollment) {
        // 未报名只能看第一章
        isUnlocked = index === 0
      } else {
        switch (chapter.unlockType) {
          case "SEQUENTIAL":
            // 顺序解锁：前一章完成才解锁
            if (index === 0) {
              isUnlocked = true
            } else {
              const prevChapterProgress = progress.find(
                p => p.chapterId === course.chapters[index - 1].id
              )
              isUnlocked = prevChapterProgress?.isCompleted || false
            }
            break
          case "TIME_BASED":
            // 时间解锁（简化处理，实际需要根据具体规则）
            isUnlocked = true
            break
          case "TASK_BASED":
            // 任务解锁（简化处理）
            isUnlocked = true
            break
          case "PAID":
            // 付费解锁
            isUnlocked = !course.isPaid || !!enrollment
            break
          default:
            isUnlocked = true
        }
      }

      return {
        ...chapter,
        isUnlocked,
        progress: chapterProgress || null,
      }
    })

    return NextResponse.json({
      ...course,
      chapters: chaptersWithProgress,
      isEnrolled: !!enrollment,
      enrollment,
    })
  } catch (error) {
    console.error("获取课程详情失败:", error)
    return NextResponse.json(
      { error: "获取失败" },
      { status: 500 }
    )
  }
}