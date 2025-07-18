"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Award, Users, Calendar, ChevronRight, Filter, Sparkles, DollarSign, Clock, Rocket, Target, Star } from "lucide-react"

// 成功案例分类
const filters = [
  { id: "all", label: "全部案例", icon: Sparkles },
  { id: "high-income", label: "月入10万+", icon: TrendingUp },
  { id: "funding", label: "获得融资", icon: Award },
  { id: "career", label: "职业转型", icon: Users },
  { id: "side-project", label: "副业成功", icon: Calendar }
]

// 模拟成功案例数据
const successStories = [
  {
    id: 1,
    name: "陈晓明",
    avatar: "/avatars/user2.jpg",
    previousJob: "传统电商运营",
    currentRole: "AI产品创始人",
    company: "智流科技",
    achievement: "月收入125万",
    growth: "+2400%",
    timeToSuccess: "6个月",
    story: "从月入5万的电商运营，到创立AI电商工具公司，6个月实现月流水125万。深海圈不仅教会了我AI技术，更重要的是产品思维和商业模式。",
    tags: ["AI工具", "电商", "创业成功"],
    category: "high-income",
    gradient: "from-purple-600 to-pink-600",
    featured: true,
    metrics: {
      users: "5000+",
      revenue: "125万/月",
      team: "12人"
    }
  },
  {
    id: 2,
    name: "李雨桐",
    avatar: "/avatars/user3.jpg",
    previousJob: "产品经理",
    currentRole: "AI课程创作者",
    company: "独立创业",
    achievement: "获500万天使轮",
    growth: "∞",
    timeToSuccess: "8个月",
    story: "作为前大厂产品经理，我在深海圈学习后，开发了一套AI辅助学习系统，8个月内获得500万天使投资，现在团队已经扩展到20人。",
    tags: ["教育科技", "融资", "产品转型"],
    category: "funding",
    gradient: "from-blue-600 to-cyan-600",
    featured: true,
    metrics: {
      funding: "500万",
      courses: "12门",
      students: "8000+"
    }
  },
  {
    id: 3,
    name: "王建国",
    avatar: "/avatars/user4.jpg",
    previousJob: "银行职员",
    currentRole: "AI咨询顾问",
    company: "深智咨询",
    achievement: "年薪翻3倍",
    growth: "+300%",
    timeToSuccess: "4个月",
    story: "从传统银行业转型AI咨询领域，4个月内实现年薪从30万到90万的跨越。深海圈的系统化课程让我快速掌握了AI应用能力。",
    tags: ["职业转型", "咨询", "金融科技"],
    category: "career",
    gradient: "from-emerald-600 to-teal-600",
    featured: true,
    metrics: {
      salary: "90万/年",
      clients: "20+",
      projects: "50+"
    }
  },
  {
    id: 4,
    name: "张小芳",
    avatar: "/avatars/user5.jpg",
    previousJob: "自由设计师",
    currentRole: "AI设计工作室",
    company: "芳华设计",
    achievement: "月入35万",
    growth: "+700%",
    timeToSuccess: "5个月",
    story: "利用AI工具革新设计流程，从月入5万的自由设计师，到拥有10人团队的工作室，月收入突破35万。",
    tags: ["设计", "AI工具", "团队扩张"],
    category: "high-income",
    gradient: "from-orange-600 to-red-600"
  },
  {
    id: 5,
    name: "赵云飞",
    avatar: "/avatars/user2.jpg",
    previousJob: "程序员",
    currentRole: "技术博主",
    company: "独立创作",
    achievement: "副业月入8万",
    growth: "+1600%",
    timeToSuccess: "3个月",
    story: "保持本职工作的同时，通过分享AI开发经验，3个月内副业收入达到8万/月，实现了财务自由的第一步。",
    tags: ["副业", "内容创作", "技术分享"],
    category: "side-project",
    gradient: "from-indigo-600 to-purple-600"
  }
]

export default function SuccessStoriesPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgIncome: 0,
    successRate: 0,
    avgTime: 0
  })

  // 动态数字效果
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalStudents: Math.min(prev.totalStudents + 50, 10000),
        avgIncome: Math.min(prev.avgIncome + 5000, 250000),
        successRate: Math.min(prev.successRate + 1, 87),
        avgTime: Math.min(prev.avgTime + 1, 180)
      }))
    }, 20)

    return () => clearInterval(interval)
  }, [])

  const filteredStories = selectedFilter === "all" 
    ? successStories 
    : successStories.filter(story => story.category === selectedFilter)

  const featuredStories = successStories.filter(story => story.featured)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      {/* Hero Section - 沉浸式开场 */}
      <section className="relative min-h-[70vh] overflow-hidden">
        {/* 渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#003B46] via-[#07575B] to-[#FFD700]/20">
          {/* 粒子动效背景 */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/10 animate-float"
                style={{
                  width: Math.random() * 6 + 2 + "px",
                  height: Math.random() * 6 + 2 + "px",
                  left: Math.random() * 100 + "%",
                  top: Math.random() * 100 + "%",
                  animationDelay: Math.random() * 5 + "s",
                  animationDuration: Math.random() * 10 + 10 + "s"
                }}
              />
            ))}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="relative container mx-auto px-4 py-20 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeInUp">
            他们在深海圈
            <span className="block text-[#FFD700] mt-2">找到了方向</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto animate-fadeInUp animation-delay-200">
            从0到1，看深海圈学员如何在AI时代实现蜕变
          </p>

          {/* 关键数据展示 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fadeInUp animation-delay-400">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-2">
                {stats.totalStudents.toLocaleString()}+
              </div>
              <div className="text-sm opacity-80">成功学员</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-2">
                ¥{stats.avgIncome.toLocaleString()}
              </div>
              <div className="text-sm opacity-80">平均月收入</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-2">
                {stats.successRate}%
              </div>
              <div className="text-sm opacity-80">转型成功率</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-[#FFD700] mb-2">
                {stats.avgTime}天
              </div>
              <div className="text-sm opacity-80">平均突破时间</div>
            </div>
          </div>
        </div>

        {/* 底部波浪 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" className="w-full h-24">
            <path
              d="M0,50 C360,100 720,0 1440,50 L1440,100 L0,100 Z"
              fill="rgb(249 250 251)"
            />
          </svg>
        </div>
      </section>

      {/* 特色案例展示 - 杂志级排版 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">精选成功故事</h2>
        
        {featuredStories.map((story, index) => (
          <div
            key={story.id}
            className={`mb-20 ${index % 2 === 0 ? "" : "lg:flex-row-reverse"} lg:flex items-center gap-12`}
          >
            {/* 内容区域 */}
            <div className="flex-1 space-y-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium bg-gradient-to-r ${story.gradient}`}>
                <Award className="w-4 h-4" />
                {story.achievement}
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-2">{story.name}</h3>
                <p className="text-gray-600">
                  {story.previousJob} → {story.currentRole}
                </p>
              </div>

              <blockquote className="relative">
                <span className="absolute -top-4 -left-2 text-6xl text-gray-200">&ldquo;</span>
                <p className="text-lg text-gray-700 leading-relaxed pl-8">
                  {story.story}
                </p>
              </blockquote>

              {/* 成就指标 */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-200">
                {story.metrics && Object.entries(story.metrics).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">{key}</div>
                  </div>
                ))}
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {story.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 图片/可视化区域 */}
            <div className="flex-1 relative">
              <div className={`relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br ${story.gradient} p-8`}>
                {/* 头像 */}
                <div className="absolute top-8 right-8 w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm p-1">
                  <img src={story.avatar} alt={story.name} className="w-full h-full rounded-full object-cover" />
                </div>

                {/* 增长曲线可视化 */}
                <div className="h-full flex items-end justify-center">
                  <div className="w-full max-w-sm">
                    <svg viewBox="0 0 300 200" className="w-full h-full">
                      <path
                        d="M 0 180 Q 100 150 150 100 T 300 20"
                        stroke="white"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="500"
                        strokeDashoffset="500"
                        className="animate-draw"
                      />
                      <text x="250" y="40" fill="white" className="text-2xl font-bold">
                        {story.growth}
                      </text>
                    </svg>
                  </div>
                </div>

                {/* 时间标记 */}
                <div className="absolute bottom-8 left-8 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white">
                  <Clock className="w-4 h-4 inline mr-2" />
                  {story.timeToSuccess}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 筛选器 */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {filters.map((filter) => {
            const Icon = filter.icon
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                  selectedFilter === filter.id
                    ? "bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* 案例网格 */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              onMouseEnter={() => setHoveredCard(story.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
              style={{
                transform: hoveredCard === story.id ? "rotateY(-5deg) rotateX(5deg)" : "rotateY(0deg) rotateX(0deg)",
                transformStyle: "preserve-3d"
              }}
            >
              {/* 渐变背景 */}
              <div className={`absolute inset-0 bg-gradient-to-br ${story.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              {/* 内容 */}
              <div className="relative p-6">
                {/* 头部信息 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img src={story.avatar} alt={story.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{story.name}</h4>
                      <p className="text-sm text-gray-600">{story.previousJob}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* 核心成就 */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {story.achievement}
                  </div>
                  <div className="text-sm text-gray-600">
                    现任 {story.currentRole}
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1">
                  {story.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Hover时显示的详情预览 */}
                <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white transform transition-transform duration-300 ${
                  hoveredCard === story.id ? "translate-y-0" : "translate-y-full"
                }`}>
                  <p className="text-sm line-clamp-3">{story.story}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA区域 */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-[#003B46] to-[#0891A1] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">下一个成功故事，就是你</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            无论你是设计师、产品经理、程序员，还是完全的新手，
            深海圈都能帮你实现从想法到产品的跨越
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-[#0891A1] px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105">
              开始学习
            </button>
            <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#0891A1] transition-all">
              加入社区
            </button>
          </div>
        </div>
      </section>

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-10px) translateX(5px);
          }
          66% {
            transform: translateY(5px) translateX(-5px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animate-draw {
          animation: draw 2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}