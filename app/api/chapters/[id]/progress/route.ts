import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// 更新章节学习进度
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      watchTime, 
      lastPosition, 
      isCompleted 
    } = body

    // 获取章节信息
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: { course: true }
    })

    if (!chapter) {
      return NextResponse.json(
        { error: '章节不存在' },
        { status: 404 }
      )
    }

    // 检查是否已报名
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: chapter.courseId
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: '请先报名该课程' },
        { status: 403 }
      )
    }

    // 更新或创建进度记录
    const progress = await prisma.progress.upsert({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: id
        }
      },
      update: {
        watchTime: watchTime || undefined,
        lastPosition: lastPosition || undefined,
        isCompleted: isCompleted || undefined,
        completedAt: isCompleted ? new Date() : undefined
      },
      create: {
        userId: session.user.id,
        chapterId: id,
        watchTime: watchTime || 0,
        lastPosition: lastPosition || 0,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : undefined
      }
    })

    // 如果标记为完成，检查是否需要更新课程进度
    if (isCompleted) {
      // 获取课程所有章节的进度
      const allProgress = await prisma.progress.findMany({
        where: {
          userId: session.user.id,
          chapter: {
            courseId: chapter.courseId
          }
        }
      })

      // 获取课程总章节数
      const totalChapters = await prisma.chapter.count({
        where: { courseId: chapter.courseId }
      })

      // 计算完成的章节数
      const completedChapters = allProgress.filter(p => p.isCompleted).length

      // 更新课程报名记录中的进度
      const progressPercentage = Math.round((completedChapters / totalChapters) * 100)
      
      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: chapter.courseId
          }
        },
        data: {
          progress: progressPercentage,
          completedAt: progressPercentage === 100 ? new Date() : null
        }
      })
    }

    return NextResponse.json({
      success: true,
      progress
    })

  } catch (error) {
    console.error('更新学习进度错误:', error)
    return NextResponse.json(
      { error: '更新学习进度失败' },
      { status: 500 }
    )
  }
}

// 获取单个章节的学习进度
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const progress = await prisma.progress.findUnique({
      where: {
        userId_chapterId: {
          userId: session.user.id,
          chapterId: id
        }
      }
    })

    return NextResponse.json({
      progress: progress || {
        isCompleted: false,
        watchTime: 0,
        lastPosition: 0
      }
    })

  } catch (error) {
    console.error('获取章节进度错误:', error)
    return NextResponse.json(
      { error: '获取章节进度失败' },
      { status: 500 }
    )
  }
}