import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET /api/articles/popular - 获取热门文章
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")
    const days = parseInt(searchParams.get("days") || "7") // 默认获取7天内的热门文章

    // 计算日期范围
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const articles = await prisma.article.findMany({
      where: {
        isPublished: true,
        publishedAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        title: true,
        summary: true,
        cover: true,
        category: true,
        author: true,
        viewCount: true,
        publishedAt: true,
      },
      orderBy: {
        viewCount: "desc",
      },
      take: limit,
    })

    return NextResponse.json({
      articles,
      total: articles.length,
    })
  } catch (error) {
    console.error("获取热门文章失败:", error)
    return NextResponse.json(
      { error: "获取热门文章失败" },
      { status: 500 }
    )
  }
}