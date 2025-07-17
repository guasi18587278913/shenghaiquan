import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { ArticleCategory } from "@prisma/client"

// GET /api/articles/[id] - 获取单篇文章详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.article.findUnique({
      where: { 
        id: params.id,
        isPublished: true,
      },
    })

    if (!article) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      )
    }

    // 增加浏览次数
    await prisma.article.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    // 返回文章内容，包括增加后的浏览次数
    return NextResponse.json({
      ...article,
      viewCount: article.viewCount + 1,
    })
  } catch (error) {
    console.error("获取文章详情失败:", error)
    return NextResponse.json(
      { error: "获取文章详情失败" },
      { status: 500 }
    )
  }
}

// PUT /api/articles/[id] - 更新文章（需要管理员权限）
const updateArticleSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  summary: z.string().optional().nullable(),
  content: z.string().min(1).optional(),
  cover: z.string().optional().nullable(),
  category: z.nativeEnum(ArticleCategory).optional(),
  tags: z.array(z.string()).optional().nullable(),
  author: z.string().optional(),
  isPublished: z.boolean().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "没有权限更新文章" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateArticleSchema.parse(body)

    // 检查文章是否存在
    const existingArticle = await prisma.article.findUnique({
      where: { id: params.id },
    })

    if (!existingArticle) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      )
    }

    // 处理标签
    const tags = validatedData.tags !== undefined
      ? validatedData.tags ? JSON.stringify(validatedData.tags) : null
      : undefined

    // 处理发布时间
    let publishedAt = existingArticle.publishedAt
    if (validatedData.isPublished !== undefined) {
      if (validatedData.isPublished && !existingArticle.isPublished) {
        publishedAt = new Date()
      } else if (!validatedData.isPublished) {
        publishedAt = null
      }
    }

    const updatedArticle = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        tags,
        publishedAt,
      },
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.errors },
        { status: 400 }
      )
    }
    
    console.error("更新文章失败:", error)
    return NextResponse.json(
      { error: "更新文章失败" },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/[id] - 删除文章（需要管理员权限）
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "没有权限删除文章" },
        { status: 403 }
      )
    }

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { id: params.id },
    })

    if (!article) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      )
    }

    // 删除文章
    await prisma.article.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "文章已删除" })
  } catch (error) {
    console.error("删除文章失败:", error)
    return NextResponse.json(
      { error: "删除文章失败" },
      { status: 500 }
    )
  }
}