import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
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
            followers: true,
            following: true
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

    // 解析skills
    const profile = {
      ...user,
      skills: user.skills ? JSON.parse(user.skills) : []
    }

    return NextResponse.json(profile)

  } catch (error) {
    console.error('获取用户资料错误:', error)
    return NextResponse.json(
      { error: '获取用户资料失败' },
      { status: 500 }
    )
  }
}