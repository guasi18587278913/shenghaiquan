import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 获取课程学习进度
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 检查是否已报名
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: params.id
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: '请先报名该课程' },
        { status: 403 }
      )
    }

    // 获取课程章节和进度
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            progress: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: '课程不存在' },
        { status: 404 }
      )
    }

    // 计算进度统计
    const totalChapters = course.chapters.length
    const completedChapters = course.chapters.filter(
      chapter => chapter.progress[0]?.isCompleted
    ).length
    const progressPercentage = totalChapters > 0 
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0

    // 计算总学习时长
    const totalWatchTime = course.chapters.reduce((total, chapter) => {
      return total + (chapter.progress[0]?.watchTime || 0)
    }, 0)

    // 整理章节进度数据
    const chaptersWithProgress = course.chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      duration: chapter.duration,
      isCompleted: chapter.progress[0]?.isCompleted || false,
      watchTime: chapter.progress[0]?.watchTime || 0,
      lastPosition: chapter.progress[0]?.lastPosition || 0,
      completedAt: chapter.progress[0]?.completedAt
    }))

    return NextResponse.json({
      enrollment: {
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt
      },
      progress: {
        percentage: progressPercentage,
        completedChapters,
        totalChapters,
        totalWatchTime
      },
      chapters: chaptersWithProgress
    })

  } catch (error) {
    console.error('获取学习进度错误:', error)
    return NextResponse.json(
      { error: '获取学习进度失败' },
      { status: 500 }
    )
  }
}