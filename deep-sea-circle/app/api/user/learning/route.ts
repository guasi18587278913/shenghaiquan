import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    // 获取用户的所有课程报名记录
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            chapters: true,
            _count: {
              select: { chapters: true }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    })

    // 获取所有相关的学习进度
    const courseIds = enrollments.map(e => e.courseId)
    const allProgress = await prisma.progress.findMany({
      where: {
        userId: session.user.id,
        chapter: {
          courseId: { in: courseIds }
        }
      },
      include: {
        chapter: {
          select: {
            id: true,
            courseId: true
          }
        }
      }
    })

    // 整理每个课程的学习数据
    const courses = enrollments.map(enrollment => {
      // 获取该课程的所有进度记录
      const courseProgress = allProgress.filter(
        p => p.chapter.courseId === enrollment.courseId
      )
      
      // 计算完成的章节数
      const completedChapters = courseProgress.filter(p => p.isCompleted).length
      
      // 计算总学习时长
      const totalWatchTime = courseProgress.reduce(
        (sum, p) => sum + p.watchTime, 
        0
      )
      
      // 获取最近学习时间
      const lastStudyAt = courseProgress.length > 0
        ? courseProgress.sort((a, b) => 
            b.updatedAt.getTime() - a.updatedAt.getTime()
          )[0].updatedAt
        : null

      return {
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          category: enrollment.course.category,
          level: enrollment.course.level,
          totalChapters: enrollment.course._count.chapters
        },
        enrollment: {
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          progress: enrollment.progress
        },
        completedChapters,
        totalWatchTime,
        lastStudyAt
      }
    })

    // 计算总体统计
    const stats = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.completedAt).length,
      totalHours: Math.round(
        allProgress.reduce((sum, p) => sum + p.watchTime, 0) / 3600
      ),
      currentStreak: 0 // TODO: 实现连续学习天数计算
    }

    return NextResponse.json({
      courses,
      stats
    })

  } catch (error) {
    console.error('获取学习记录错误:', error)
    return NextResponse.json(
      { error: '获取学习记录失败' },
      { status: 500 }
    )
  }
}