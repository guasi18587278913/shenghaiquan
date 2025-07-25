import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    
    if (!query.trim()) {
      return NextResponse.json({
        posts: [],
        users: [],
        tags: [],
        total: { posts: 0, users: 0, tags: 0 }
      })
    }

    // 搜索词处理
    const searchTerm = query.trim().toLowerCase()
    
    // 并行执行搜索
    const [posts, users, tags] = await Promise.all([
      // 搜索动态
      prisma.post.findMany({
        where: {
          OR: [
            { content: { contains: searchTerm } },
            { tags: { contains: searchTerm } }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      
      // 搜索用户
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { bio: { contains: searchTerm } },
            { skills: { contains: searchTerm } },
            { company: { contains: searchTerm } },
            { position: { contains: searchTerm } }
          ]
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          bio: true,
          location: true,
          company: true,
          position: true,
          skills: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true
            }
          }
        },
        take: 20
      }),
      
      // 搜索标签
      prisma.tag.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { slug: { contains: searchTerm } }
          ]
        },
        orderBy: { postCount: 'desc' },
        take: 20
      })
    ])

    // 获取总数
    const [totalPosts, totalUsers, totalTags] = await Promise.all([
      prisma.post.count({
        where: {
          OR: [
            { content: { contains: searchTerm } },
            { tags: { contains: searchTerm } }
          ]
        }
      }),
      prisma.user.count({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { bio: { contains: searchTerm } },
            { skills: { contains: searchTerm } },
            { company: { contains: searchTerm } },
            { position: { contains: searchTerm } }
          ]
        }
      }),
      prisma.tag.count({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { slug: { contains: searchTerm } }
          ]
        }
      })
    ])

    return NextResponse.json({
      posts,
      users,
      tags,
      total: {
        posts: totalPosts,
        users: totalUsers,
        tags: totalTags
      }
    })

  } catch (error) {
    console.error('搜索错误:', error)
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    )
  }
}