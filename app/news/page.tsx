"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Clock, Eye, Heart, MessageCircle, Share2, TrendingUp, Calendar, User } from "lucide-react"

// 资讯分类
const categories = [
  { id: "all", label: "全部", color: "" },
  { id: "platform", label: "深海圈动态", color: "from-[#0891A1] to-[#17B8C4]" },
  { id: "industry", label: "行业动态", color: "from-[#6366F1] to-[#8B5CF6]" },
  { id: "tech", label: "技术前沿", color: "from-[#F59E0B] to-[#EF4444]" },
  { id: "case", label: "成功案例", color: "from-[#10B981] to-[#34D399]" }
]

// 模拟资讯数据
const mockNews = [
  {
    id: 1,
    title: "深海圈学员突破10000人！",
    description: "我们迎来了一个重要的里程碑——深海圈学员总数突破10000人！感谢每一位学员的信任与支持，让我们继续在AI学习的道路上携手前行。",
    category: "platform",
    coverText: "破万",
    author: {
      name: "刘小排",
      avatar: "/avatars/刘小排.jpg"
    },
    coverImage: "/news/milestone.jpg",
    readTime: 3,
    publishedAt: "11个月前",
    views: 5678,
    likes: 234,
    comments: 89,
    featured: true
  },
  {
    id: 2,
    title: "Kiro AI IDE引爆社区：新一代AI编程工具的崛起",
    description: "Kiro AI IDE凭借其革命性的AI辅助编程功能，在开发者社区引起巨大反响。这款工具如何改变我们的编程方式？",
    category: "industry",
    coverText: "AI IDE",
    author: {
      name: "张三",
      avatar: "/avatars/user2.jpg"
    },
    coverImage: "/news/kiro-ide.jpg",
    readTime: 5,
    publishedAt: "大约1年前",
    views: 3212,
    likes: 156,
    comments: 45,
    featured: true
  },
  {
    id: 3,
    title: "古法开发 vs Vibe Coding：AI编程模式的务实探讨",
    description: "当传统编程遇上AI辅助，我们该如何在效率与掌控之间找到平衡？深度解析两种编程模式的优劣与适用场景。",
    category: "tech",
    coverText: "编程\n模式",
    author: {
      name: "李四",
      avatar: "/avatars/user3.jpg"
    },
    coverImage: "/news/coding-style.jpg",
    readTime: 8,
    publishedAt: "大约1年前",
    views: 1569,
    likes: 98,
    comments: 67,
    featured: true
  },
  {
    id: 4,
    title: "GPT-4 Turbo发布：更强大、更便宜的AI模型",
    description: "OpenAI发布GPT-4 Turbo，不仅性能更强，价格还降低了3倍。了解这次更新将如何影响AI应用开发。",
    category: "industry",
    coverText: "GPT-4\nTurbo",
    author: {
      name: "王五",
      avatar: "/avatars/user4.jpg"
    },
    coverImage: "/news/gpt4-turbo.jpg",
    readTime: 4,
    publishedAt: "2天前",
    views: 8901,
    likes: 567,
    comments: 123
  },
  {
    id: 5,
    title: "从0到100万：深海圈学员的创业故事",
    description: "深海圈学员小陈通过AI工具开发，6个月内实现月收入破百万。他是如何做到的？有哪些经验可以分享？",
    category: "case",
    coverText: "创业\n故事",
    author: {
      name: "陈六",
      avatar: "/avatars/user5.jpg"
    },
    coverImage: "/news/success-story.jpg",
    readTime: 10,
    publishedAt: "1周前",
    views: 12450,
    likes: 891,
    comments: 234
  },
  {
    id: 6,
    title: "Claude 3.5 Sonnet：编程能力全面超越GPT-4",
    description: "Anthropic最新发布的Claude 3.5 Sonnet在编程任务上表现惊人，多项基准测试超越GPT-4。",
    category: "tech",
    coverText: "Claude\n3.5",
    author: {
      name: "赵七",
      avatar: "/avatars/user2.jpg"
    },
    coverImage: "/news/claude35.jpg",
    readTime: 6,
    publishedAt: "3天前",
    views: 6789,
    likes: 432,
    comments: 98
  }
]

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [news, setNews] = useState(mockNews)
  const [featuredIndex, setFeaturedIndex] = useState(0)

  // 自动轮播
  useEffect(() => {
    const featuredNews = mockNews.filter(item => item.featured)
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredNews.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredNews = selectedCategory === "all" 
    ? news 
    : news.filter(item => item.category === selectedCategory)

  const featuredNews = mockNews.filter(item => item.featured)
  const currentFeatured = featuredNews[featuredIndex]

  // 获取分类颜色
  const getCategoryGradient = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.color || "from-gray-400 to-gray-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#003B46] via-[#07575B] to-[#0891A1] text-white">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4">最新资讯</h1>
          <p className="text-xl opacity-90">
            获取AI行业最新动态，学习产品开发经验
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 热门推荐 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-orange-500" />
            热门推荐
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredNews.map((item, index) => (
              <article
                key={item.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* 图片区域 */}
                <div className="relative h-48 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(item.category)}`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/30 text-5xl font-bold text-center leading-tight">
                      {item.coverText || item.title.charAt(0)}
                    </div>
                  </div>
                  
                  {/* 分类标签 */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium bg-black/20 backdrop-blur-sm`}>
                      {categories.find(c => c.id === item.category)?.label}
                    </span>
                  </div>
                  
                  {/* 热门标记 */}
                  {index === 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
                        🔥 最热
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 内容区域 */}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-[#0891A1] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <img src={item.author.avatar} alt={item.author.name} className="w-5 h-5 rounded-full" />
                        <span>{item.author.name}</span>
                      </div>
                      <span>{item.publishedAt}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{item.likes}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 分类筛选 */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? category.id === "all"
                    ? "bg-gray-900 text-white"
                    : `bg-gradient-to-r ${category.color} text-white shadow-lg`
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* 资讯列表 */}
        <div className="grid gap-6">
          {filteredNews.map((item) => (
            <article
              key={item.id}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row">
                {/* 图片区域 */}
                <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryGradient(item.category)} opacity-80`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/20 text-6xl font-bold text-center leading-tight">
                      {item.coverText || item.title.charAt(0)}
                    </div>
                  </div>
                </div>
                
                {/* 内容区域 */}
                <div className="flex-1 p-6">
                  {/* 分类标签 */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium bg-gradient-to-r ${getCategoryGradient(item.category)}`}>
                      {categories.find(c => c.id === item.category)?.label}
                    </span>
                    <span className="text-xs text-gray-500">{item.publishedAt}</span>
                  </div>
                  
                  {/* 标题 */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0891A1] transition-colors">
                    {item.title}
                  </h3>
                  
                  {/* 描述 */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                  
                  {/* 底部信息 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* 作者信息 */}
                      <div className="flex items-center gap-2">
                        <img src={item.author.avatar} alt={item.author.name} className="w-8 h-8 rounded-full" />
                        <span className="text-sm font-medium text-gray-700">{item.author.name}</span>
                      </div>
                      
                      {/* 阅读时长 */}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{item.readTime}分钟</span>
                      </div>
                    </div>
                    
                    {/* 互动数据 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1 hover:text-[#0891A1] transition-colors">
                        <Eye className="w-4 h-4" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{item.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-[#0891A1] transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{item.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}