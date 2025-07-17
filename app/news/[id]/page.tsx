"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Clock, Calendar, ArrowLeft, User } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ArticleCategory } from "@prisma/client"
import ReactMarkdown from "react-markdown"

const categoryConfig: Record<ArticleCategory, { label: string; color: string }> = {
  INDUSTRY_NEWS: { label: "行业动态", color: "bg-blue-500" },
  PRODUCT_CASE: { label: "产品案例", color: "bg-green-500" },
  TECH_FRONTIER: { label: "技术前沿", color: "bg-purple-500" },
  COMMUNITY_NEWS: { label: "深海圈动态", color: "bg-orange-500" },
  OVERSEAS_EXP: { label: "出海经验", color: "bg-pink-500" },
}

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])

  // 获取文章详情
  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${params.id}`)
      
      if (!response.ok) {
        throw new Error("获取文章失败")
      }
      
      const data = await response.json()
      
      // 处理标签数据
      const articleWithParsedTags = {
        ...data,
        tags: data.tags ? JSON.parse(data.tags) : [],
      }
      
      setArticle(articleWithParsedTags)
      
      // 获取相关文章
      fetchRelatedArticles(data.category)
    } catch (error) {
      console.error("获取文章失败:", error)
      router.push("/news")
    } finally {
      setLoading(false)
    }
  }

  // 获取相关文章
  const fetchRelatedArticles = async (category: string) => {
    try {
      const response = await fetch(`/api/articles?category=${category}&limit=5`)
      
      if (response.ok) {
        const data = await response.json()
        // 过滤掉当前文章
        const filtered = data.articles.filter((a: any) => a.id !== params.id)
        setRelatedArticles(filtered.slice(0, 4))
      }
    } catch (error) {
      console.error("获取相关文章失败:", error)
    }
  }

  useEffect(() => {
    fetchArticle()
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  if (!article) {
    return null
  }

  const categoryInfo = categoryConfig[article.category as ArticleCategory]

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主内容区 */}
        <div className="lg:col-span-2">
          <article>
            {/* 文章头部 */}
            <header className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Badge className={categoryInfo.color}>
                  {categoryInfo.label}
                </Badge>
                {article.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {article.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.publishedAt || article.createdAt), "yyyy年M月d日", { locale: zhCN })}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.viewCount} 阅读
                </div>
              </div>
            </header>

            {/* 封面图 */}
            {article.cover && (
              <div className="mb-8">
                <img
                  src={article.cover}
                  alt={article.title}
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* 摘要 */}
            {article.summary && (
              <div className="mb-8 p-4 bg-secondary/50 rounded-lg">
                <p className="text-lg leading-relaxed">{article.summary}</p>
              </div>
            )}

            {/* 正文内容 */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </article>
        </div>

        {/* 侧边栏 */}
        <div className="lg:col-span-1">
          {/* 相关文章 */}
          {relatedArticles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">相关文章</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {relatedArticles.map((related) => (
                    <div
                      key={related.id}
                      className="cursor-pointer hover:text-primary transition-colors"
                      onClick={() => router.push(`/news/${related.id}`)}
                    >
                      <h4 className="font-medium line-clamp-2">{related.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {related.viewCount} 阅读
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}