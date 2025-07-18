"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Play, Clock, BarChart3, Lock, CheckCircle2, PlayCircle, Star, TrendingUp, Code2, Palette, DollarSign, Brain, Briefcase, Sparkles, BookOpen, Lightbulb, Dumbbell, Rocket } from "lucide-react"

// 模拟课程数据
const mockCourses = [
  {
    id: "1",
    title: "10分钟搞定产品雏形",
    description: "用AI工具快速实现你的第一个MVP，零基础也能上手",
    instructor: "刘小排",
    rating: 4.9,
    students: 1234,
    duration: "2小时",
    chapters: 8,
    difficulty: "beginner",
    category: "基础篇",
    progress: 68,
    thumbnail: "/course-thumbnails/ai-product.jpg",
    videoPreview: "/course-previews/ai-product.mp4",
    requiredTier: "monthly",
    tags: ["MVP开发", "快速上手", "AI工具"],
    lastAccessed: "2天前",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    updateInfo: "新增案例：AI答案之书",
    isNew: false,
    isHot: true
  },
  {
    id: "2", 
    title: "海外软件生意认知体系",
    description: "建立正确的产品思维，理解Micro SaaS商业模式",
    instructor: "刘小排",
    rating: 4.8,
    students: 892,
    duration: "3小时",
    chapters: 6,
    difficulty: "intermediate",
    category: "认知篇",
    progress: 45,
    thumbnail: "/course-thumbnails/prompt.jpg",
    videoPreview: "/course-previews/prompt.mp4",
    requiredTier: "monthly",
    tags: ["产品思维", "商业模式", "认知框架"],
    lastAccessed: "1周前",
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
    updateInfo: "更新：2025年AI产品趋势",
    isNew: false,
    isHot: false
  },
  {
    id: "3",
    title: "NextJS与数据库深度实战",
    description: "补齐技术内功，深入理解AI生成代码的原理",
    instructor: "刘小排",
    rating: 4.7,
    students: 2156,
    duration: "60小时",
    chapters: 20,
    difficulty: "intermediate",
    category: "内功篇",
    progress: 0,
    thumbnail: "/course-thumbnails/monetize.jpg",
    videoPreview: "/course-previews/monetize.mp4",
    requiredTier: "annual",
    tags: ["NextJS", "数据库", "技术原理"],
    lastAccessed: null,
    updatedAt: new Date(), // 刚刚更新
    updateInfo: "全新上线！深入剖析技术原理",
    isNew: true,
    isHot: true
  },
  {
    id: "4",
    title: "从MVP到商业闭环",
    description: "接入支付、用户系统，打造完整的SaaS产品",
    instructor: "刘小排",
    rating: 4.9,
    students: 567,
    duration: "40小时",
    chapters: 15,
    difficulty: "advanced",
    category: "进阶篇",
    progress: 23,
    thumbnail: "/course-thumbnails/chatgpt-api.jpg",
    videoPreview: "/course-previews/chatgpt-api.mp4",
    requiredTier: "annual",
    tags: ["支付系统", "用户登录", "商业化"],
    lastAccessed: "5天前",
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
    updateInfo: "新增Stripe支付集成教程",
    isNew: false,
    isHot: true
  },
  {
    id: "5",
    title: "Cursor与AI编程实战",
    description: "掌握Cursor的高级用法，让AI成为你的编程助手",
    instructor: "刘小排",
    rating: 4.6,
    students: 3421,
    duration: "8小时",
    chapters: 6,
    difficulty: "beginner",
    category: "基础篇",
    progress: 100,
    thumbnail: "/course-thumbnails/ai-art.jpg",
    videoPreview: "/course-previews/ai-art.mp4",
    requiredTier: "monthly",
    tags: ["Cursor", "AI编程", "效率工具"],
    lastAccessed: "已完成",
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14天前
    updateInfo: null,
    isNew: false,
    isHot: false
  },
  {
    id: "6",
    title: "寻找你的利基市场",
    description: "如何发现独特的用户需求，找到属于你的蓝海",
    instructor: "刘小排",
    rating: 5.0,
    students: 889,
    duration: "4小时",
    chapters: 5,
    difficulty: "intermediate",
    category: "认知篇",
    progress: 0,
    thumbnail: "/course-thumbnails/career.jpg",
    videoPreview: "/course-previews/career.mp4",
    requiredTier: "annual",
    tags: ["市场调研", "用户需求", "产品定位"],
    lastAccessed: null,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
    updateInfo: "新增：AI产品的差异化策略",
    isNew: false,
    isHot: false
  }
]

const categoryFilters = ["全部", "最新更新", "基础篇", "认知篇", "内功篇", "进阶篇"]
const difficultyLabels = {
  beginner: { label: "初级" },
  intermediate: { label: "中级" },
  advanced: { label: "高级" }
}

export default function CoursesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState(mockCourses)
  const [selectedCategory, setSelectedCategory] = useState("全部")
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [playingPreview, setPlayingPreview] = useState<string | null>(null)

  // 模拟用户会员等级
  const userTier: "monthly" | "annual" = "monthly" // 可以是 "monthly" 或 "annual"

  // 根据更新时间排序
  const sortedCourses = [...courses].sort((a, b) => {
    const timeA = a.updatedAt?.getTime() || 0
    const timeB = b.updatedAt?.getTime() || 0
    return timeB - timeA // 最新的在前
  })

  const filteredCourses = selectedCategory === "全部" 
    ? sortedCourses 
    : selectedCategory === "最新更新"
    ? sortedCourses.filter(course => {
        const daysSinceUpdate = (Date.now() - (course.updatedAt?.getTime() || 0)) / (1000 * 60 * 60 * 24)
        return daysSinceUpdate <= 7 // 7天内更新的
      })
    : sortedCourses.filter(course => course.category === selectedCategory)

  const canAccessCourse = (requiredTier: string) => {
    if (requiredTier === "monthly") return true
    if (requiredTier === "annual" && (userTier as string) === "annual") return true
    return false
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-16">
      {/* Hero Section - Elegant Minimal Design */}
      <div className="relative bg-gradient-to-b from-white to-[#F0FDFA] border-b border-gray-100">
        {/* 微妙的光效 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0891A1]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#17B8C4]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 py-12 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              学习中心
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              系统化学习AI产品开发，解锁深海圈的全部潜能
            </p>
            
            {/* 简洁的统计信息 */}
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#0891A1] rounded-full"></div>
                <span className="text-gray-600">在学 6 门</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600">已完成 12 门</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="text-gray-600">累计学习 156 小时</div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {categoryFilters.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-[#0891A1] text-white"
                  : "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const canAccess = canAccessCourse(course.requiredTier)
            const isHovered = hoveredCourse === course.id
            
            return (
              <div
                key={course.id}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => {
                  setHoveredCourse(null)
                  setPlayingPreview(null)
                }}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
                onClick={() => canAccess && router.push(`/courses/${course.id}`)}
              >
                {/* Course Cover - Enhanced Design */}
                <div className="relative h-40">
                  {/* Gradient Background based on category */}
                  <div className={`absolute inset-0 rounded-t-xl bg-gradient-to-br ${
                    course.category === "基础篇" ? "from-[#0891A1] to-[#17B8C4]" :
                    course.category === "认知篇" ? "from-[#006B7D] to-[#0891A1]" :
                    course.category === "内功篇" ? "from-[#003D4D] to-[#006B7D]" :
                    course.category === "进阶篇" ? "from-[#0891A1] to-[#5FDCE6]" :
                    "from-[#0891A1] to-[#17B8C4]"
                  }`} />
                  
                  
                  {/* Wave Bottom Decoration */}
                  <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ height: '25%' }}>
                    <path d="M0,80 C200,60 400,100 600,80 C800,60 1000,100 1200,80 L1200,120 L0,120 Z" 
                      fill="rgba(255,255,255,0.1)"
                    />
                  </svg>
                  
                  {/* Center Content - Course Title */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 drop-shadow-lg">
                      {course.title}
                    </h3>
                    <div className="w-12 h-0.5 bg-white/40 mb-2" />
                    <p className="text-white/80 text-sm">
                      {course.instructor}
                    </p>
                  </div>
                  
                  {/* Category Label - Top Left */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      <span className="text-xs font-medium text-white">{course.category}</span>
                    </div>
                  </div>
                  
                  {/* Hover Play Button */}
                  {isHovered && (
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
                      <div className="bg-white rounded-full p-4 shadow-2xl">
                        <Play className="w-6 h-6 text-[#0891A1]" />
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {course.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div 
                        className="h-full bg-white/80 transition-all duration-700"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Status Labels - Top Right Corner */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {course.isNew && (
                      <div className="bg-[#FF6B6B] px-3 py-1 rounded-full shadow-lg">
                        <span className="text-xs font-bold text-white">新课</span>
                      </div>
                    )}
                    {course.requiredTier === "annual" && (
                      <div className="bg-amber-500 px-3 py-1 rounded-full">
                        <span className="text-xs font-bold text-white">年度</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Content - Compact */}
                <div className="p-4 flex-1 flex flex-col">
                  {/* Description Only - Title already in cover */}
                  <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
                    {course.description}
                  </p>

                  {/* Combined Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{course.category}</span>
                    <span className="text-gray-300">•</span>
                    <span>{course.students} 人</span>
                    <span className="text-gray-300">•</span>
                    <span>{course.duration}</span>
                    {course.requiredTier === "annual" && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-amber-600">年度</span>
                      </>
                    )}
                  </div>

                  {/* Progress - Inline if exists */}
                  {course.progress > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
                        <div 
                          className="h-full bg-[#0891A1] rounded-full transition-all duration-700"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[#0891A1]">{course.progress}%</span>
                    </div>
                  )}

                  {/* Spacer */}
                  <div className="flex-1"></div>
                  
                  {/* Action Button - Compact */}
                  {canAccess ? (
                    <button 
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all mt-auto ${
                        course.progress === 0 
                          ? "bg-[#0891A1] text-white hover:bg-[#07788A]" 
                          : course.progress === 100 
                          ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          : "bg-[#0891A1]/10 text-[#0891A1] hover:bg-[#0891A1]/20"
                      }`}
                    >
                      {course.progress === 0 ? "开始学习" : course.progress === 100 ? "回顾课程" : "继续学习"}
                    </button>
                  ) : (
                    <button 
                      className="w-full py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed mt-auto"
                      disabled
                    >
                      升级解锁
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>

        {/* Learning Stats - Minimal Design */}
        <div className="mt-16 border-t border-gray-100 pt-8">
          <div className="flex items-center justify-center gap-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">156</span>
              <span>学习小时</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">12</span>
              <span>已完成</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-semibold text-gray-700">4.8</span>
              <span>评分</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}