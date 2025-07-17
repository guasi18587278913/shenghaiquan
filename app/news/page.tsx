"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Eye, Clock, Calendar, Search, TrendingUp, Globe, Code, Briefcase, Rocket } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { ArticleCategory } from "@prisma/client"

const categoryConfig: Record<ArticleCategory, { label: string; icon: any; color: string }> = {
  INDUSTRY_NEWS: { label: "行业动态", icon: TrendingUp, color: "bg-blue-500" },
  PRODUCT_CASE: { label: "产品案例", icon: Briefcase, color: "bg-green-500" },
  TECH_FRONTIER: { label: "技术前沿", icon: Code, color: "bg-purple-500" },
  COMMUNITY_NEWS: { label: "深海圈动态", icon: Globe, color: "bg-orange-500" },
  OVERSEAS_EXP: { label: "出海经验", icon: Rocket, color: "bg-pink-500" },
}

export default function NewsPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  // 获取文章数据
  const fetchArticles = async () => {
    try {
      const params = new URLSearchParams()
      
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }
      
      if (searchTerm) {
        params.append("search", searchTerm)
      }
      
      params.append("limit", "50")
      
      const response = await fetch(`/api/articles?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error("获取文章失败")
      }
      
      const data = await response.json()
      
      // 处理标签数据
      const articlesWithParsedTags = data.articles.map((article: any) => ({
        ...article,
        tags: article.tags ? JSON.parse(article.tags) : [],
        publishedAt: new Date(article.publishedAt),
      }))
      
      setArticles(articlesWithParsedTags)
    } catch (error) {
      console.error("获取文章失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory, searchTerm])

  // 过滤文章
  const filteredArticles = articles.filter(article => {
    const matchCategory = selectedCategory === "all" || article.category === selectedCategory
    const matchSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  // 计算阅读时间（假设每200字1分钟）
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.length
    const minutes = Math.ceil(wordCount / wordsPerMinute)
    return `${minutes} 分钟阅读`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">资讯中心</h1>
        <p className="text-muted-foreground">
          获取AI行业最新动态，学习产品开发经验
        </p>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索文章..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            全部
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 热门文章推荐 */}
      {selectedCategory === "all" && searchTerm === "" && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">热门推荐</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.slice(0, 3).map(article => {
              const config = categoryConfig[article.category as ArticleCategory]
              const Icon = config.icon
              
              return (
                <Card 
                  key={article.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/news/${article.id}`)}
                >
                  <div className="aspect-video bg-muted rounded-t-lg" />
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded ${config.color}`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {config.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-base line-clamp-2">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.viewCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(article.publishedAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* 文章列表 */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无相关文章
          </div>
        ) : (
          filteredArticles.map(article => {
            const config = categoryConfig[article.category as ArticleCategory]
            const Icon = config.icon
            const tags = article.tags || []
            
            return (
              <Card 
                key={article.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/news/${article.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* 封面图 */}
                    <div className="hidden md:block w-48 h-32 bg-muted rounded-lg flex-shrink-0" />
                    
                    {/* 内容 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded ${config.color}`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <Badge variant="secondary">
                          {config.label}
                        </Badge>
                        {tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{article.author}</span>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.viewCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getReadingTime(article.summary)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDistanceToNow(new Date(article.publishedAt), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}