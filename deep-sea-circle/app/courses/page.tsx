"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Play, Clock, BookOpen, Users, TrendingUp, Rocket, Lock, ChevronRight, Sparkles, Zap, Brain } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  cover?: string
  category: string
  level: string
  price: number
  isPaid: boolean
  isPublished: boolean
  order: number
  createdAt: string
  updatedAt: string
  _count: {
    chapters: number
    enrollments: number
  }
  isEnrolled: boolean
}

// 分类映射
const categoryMap: Record<string, string> = {
  "START_HERE": "行业动态",
  "BASIC": "技术前沿", 
  "ADVANCED": "深度解析"
}

// 课程渐变背景配置
const courseGradients: Record<string, { gradient: string, tagColor: string }> = {
  'default': { 
    gradient: 'from-violet-600 via-purple-600 to-indigo-700', 
    tagColor: 'bg-purple-500'
  },
  'AI辅助': {
    gradient: 'from-purple-600 via-violet-600 to-purple-700',
    tagColor: 'bg-purple-500'
  },
  '编程模式': {
    gradient: 'from-orange-500 via-red-500 to-pink-600',
    tagColor: 'bg-orange-500'
  },
  'GPT': {
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    tagColor: 'bg-indigo-500'
  },
  '破万': {
    gradient: 'from-teal-600 via-cyan-600 to-blue-600',
    tagColor: 'bg-teal-500'
  },
  'NextJS': {
    gradient: 'from-gray-800 via-gray-900 to-black',
    tagColor: 'bg-gray-700'
  },
  '10分钟': {
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    tagColor: 'bg-emerald-500'
  },
  '海外': {
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    tagColor: 'bg-blue-500'
  }
}

// 获取课程的渐变配置
const getCourseGradient = (title: string) => {
  // 根据标题关键词匹配渐变
  for (const [keyword, config] of Object.entries(courseGradients)) {
    if (title.includes(keyword)) {
      return config
    }
  }
  return courseGradients.default
}

export default function CoursesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("all")

  // 获取课程列表
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("获取课程失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`)
  }

  // 统计数据
  const stats = {
    totalCourses: courses.length,
    completedCourses: courses.filter(c => c.isEnrolled).length,
    totalHours: 156
  }

  // 标签页数据
  const tabs = [
    { id: "all", name: "全部", filter: () => true },
    { id: "latest", name: "最新更新", filter: (course: Course) => {
      const isRecent = new Date(course.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      return isRecent
    }},
    { id: "dynamic", name: "行业动态", filter: (course: Course) => course.category === "START_HERE" },
    { id: "tech", name: "技术前沿", filter: (course: Course) => course.category === "BASIC" },
    { id: "deep", name: "深度解析", filter: (course: Course) => course.category === "ADVANCED" }
  ]

  // 根据选中的标签筛选课程
  const currentTab = tabs.find(tab => tab.id === selectedTab) || tabs[0]
  const filteredCourses = courses.filter(currentTab.filter)

  // 模拟课程数据补充
  const getCourseDisplayData = (course: Course) => {
    const mockData: Record<string, any> = {
      '深海圈学员突破10000人！': {
        author: '刘小排',
        views: 5678,
        likes: 234,
        duration: '11分前',
        isHot: true
      },
      'Kiro AI IDE引爆社区：新一代AI编程工具的崛起': {
        author: '张三',
        views: 3212,
        likes: 156,
        duration: '大约1年前',
        category: '行业动态'
      },
      '古法开发 vs Vibe Coding：AI编程模式的务实探讨': {
        author: '李四',
        views: 1569,
        likes: 98,
        duration: '大约1年前',
        category: '技术前沿'
      },
      'GPT-4 Turbo发布：更强大、更便宜的AI模型': {
        author: '王五',
        views: 8901,
        likes: 567,
        duration: '2天前',
        category: '行业动态'
      }
    }
    
    return mockData[course.title] || {
      author: '刘小排',
      views: Math.floor(Math.random() * 5000) + 1000,
      likes: Math.floor(Math.random() * 500) + 50,
      duration: '最近更新'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题和统计 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">学习中心</h1>
            <p className="text-gray-600 mb-6">系统化学习AI产品开发，解锁深海圈的全部潜能</p>
            
            {/* 统计信息 */}
            <div className="flex justify-center items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">在学 {stats.completedCourses} 门</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">已完成 12 门</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">累计学习 {stats.totalHours} 小时</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-8 py-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`
                  whitespace-nowrap pb-2 px-1 border-b-2 transition-all text-sm
                  ${selectedTab === tab.id 
                    ? 'text-purple-600 border-purple-600 font-medium' 
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 课程列表 */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="bg-white p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const categoryName = categoryMap[course.category] || course.category
              const displayData = getCourseDisplayData(course)
              const gradientConfig = getCourseGradient(course.title)
              
              return (
                <div
                  key={course.id}
                  onClick={() => handleCourseClick(course.id)}
                  className="rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group bg-white"
                >
                  {/* 课程封面 - 高级渐变背景 */}
                  <div className={`relative h-64 bg-gradient-to-br ${gradientConfig.gradient} p-8 flex flex-col justify-between`}>
                    {/* 顶部标签 */}
                    <div className="flex justify-between items-start">
                      <span className={`px-3 py-1 ${gradientConfig.tagColor} text-white text-xs font-medium rounded-full backdrop-blur-sm bg-opacity-80`}>
                        {categoryName}
                      </span>
                      {displayData.isHot && (
                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          最热
                        </span>
                      )}
                    </div>

                    {/* 中心标题 */}
                    <div className="flex-1 flex items-center justify-center px-4">
                      <h3 className="text-white text-2xl font-bold text-center leading-relaxed">
                        {course.title}
                      </h3>
                    </div>

                    {/* 装饰元素 */}
                    <div className="absolute top-4 right-4 text-white/10">
                      <Sparkles className="w-24 h-24" />
                    </div>
                    <div className="absolute bottom-4 left-4 text-white/10">
                      <Brain className="w-20 h-20" />
                    </div>

                    {/* 悬停遮罩 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/0 group-hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* 课程信息 */}
                  <div className="p-6">
                    {/* 描述 */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    {/* 作者和时间 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs font-medium">{displayData.author?.charAt(0)}</span>
                        </div>
                        <span>{displayData.author}</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {displayData.duration}
                      </span>
                    </div>
                    
                    {/* 统计信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {displayData.views?.toLocaleString() || '0'}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {displayData.likes || '0'}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {course._count.chapters || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 空状态 */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无课程</h3>
            <p className="text-gray-500">该分类下暂时没有课程</p>
          </div>
        )}
      </div>
    </div>
  )
}