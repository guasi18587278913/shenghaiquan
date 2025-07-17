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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        phone: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        company: true,
        position: true,
        skills: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            enrollments: true,
            likes: true,
            comments: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const profile = {
      ...user,
      stats: {
        posts: user._count.posts,
        courses: user._count.enrollments,
        likes: user._count.likes,
        comments: user._count.comments
      },
      _count: undefined
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: '获取个人资料失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, avatar, bio, location, company, position, skills } = body

    // 更新用户资料
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        avatar,
        bio,
        location,
        company,
        position,
        skills
      },
      select: {
        id: true,
        phone: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        company: true,
        position: true,
        skills: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            enrollments: true,
            likes: true,
            comments: true
          }
        }
      }
    })

    const profile = {
      ...updatedUser,
      stats: {
        posts: updatedUser._count.posts,
        courses: updatedUser._count.enrollments,
        likes: updatedUser._count.likes,
        comments: updatedUser._count.comments
      },
      _count: undefined
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: '更新个人资料失败' },
      { status: 500 }
    )
  }
}