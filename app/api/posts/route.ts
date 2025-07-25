import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// 获取动态列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") || "all"
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {}
    if (type !== "all" && type !== "ALL") {
      where.type = type
    }

    // 获取动态列表
    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    })

    // 获取总数
    const total = await prisma.post.count({ where })

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("获取动态列表错误:", error)
    return NextResponse.json(
      { error: "获取动态失败" },
      { status: 500 }
    )
  }
}

// 发布新动态
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const { content, type = "GENERAL", tags = [], images = [] } = data

    // 验证内容
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "内容不能为空" },
        { status: 400 }
      )
    }

    // 创建动态
    const post = await prisma.post.create({
      data: {
        userId: session.user.id,
        content: content.trim(),
        type,
        tags: JSON.stringify(tags), // SQLite不支持数组，用JSON存储
        images: JSON.stringify(images),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    })

    // 处理标签（为后续功能预留）
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-')
        await prisma.tag.upsert({
          where: { slug },
          update: { 
            postCount: { increment: 1 } 
          },
          create: {
            name: tagName,
            slug,
            postCount: 1
          }
        }).catch(err => {
          console.error('Error creating tag:', err)
        })
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("发布动态错误:", error)
    return NextResponse.json(
      { error: "发布失败，请稍后重试" },
      { status: 500 }
    )
  }
}