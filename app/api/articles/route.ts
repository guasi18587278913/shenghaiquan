import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { ArticleCategory } from "@prisma/client"

// GET /api/articles - 获取文章列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category") as ArticleCategory | null
    const search = searchParams.get("search")
    const tag = searchParams.get("tag")
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {
      isPublished: true,
    }

    // 分类筛选
    if (category && Object.values(ArticleCategory).includes(category)) {
      where.category = category
    }

    // 搜索
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    // 标签筛选
    if (tag) {
      where.tags = {
        contains: tag,
      }
    }

    // 获取总数
    const total = await prisma.article.count({ where })

    // 获取文章列表
    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        summary: true,
        cover: true,
        category: true,
        tags: true,
        author: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: limit,
      skip: offset,
    })

    return NextResponse.json({
      articles,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("获取文章列表失败:", error)
    return NextResponse.json(
      { error: "获取文章列表失败" },
      { status: 500 }
    )
  }
}

// POST /api/articles - 创建文章（需要管理员权限）
const createArticleSchema = z.object({
  title: z.string().min(1).max(100),
  summary: z.string().optional(),
  content: z.string().min(1),
  cover: z.string().optional(),
  category: z.nativeEnum(ArticleCategory),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
  isPublished: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "请先登录" },
        { status: 401 }
      )
    }

    // 检查是否是管理员
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "没有权限创建文章" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createArticleSchema.parse(body)

    // 处理标签
    const tags = validatedData.tags ? JSON.stringify(validatedData.tags) : null

    const article = await prisma.article.create({
      data: {
        title: validatedData.title,
        summary: validatedData.summary,
        content: validatedData.content,
        cover: validatedData.cover,
        category: validatedData.category,
        tags,
        author: validatedData.author || user.name || "深海圈编辑部",
        isPublished: validatedData.isPublished || false,
        publishedAt: validatedData.isPublished ? new Date() : null,
      },
    })

    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.issues },
        { status: 400 }
      )
    }
    
    console.error("创建文章失败:", error)
    return NextResponse.json(
      { error: "创建文章失败" },
      { status: 500 }
    )
  }
}