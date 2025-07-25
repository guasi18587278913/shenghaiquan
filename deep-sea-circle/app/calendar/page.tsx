"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users, Video, Milestone, Filter, TrendingUp, BookOpen, Coffee, Grid3X3, List, CalendarDays, Plus, X, Check, Eye } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO, isSameMonth as isSameMonthCheck } from "date-fns"
import { zhCN } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"
import { CreateMeetupModal } from "@/components/create-meetup-modal"
import { MemberInfoModal } from "@/components/member-info-modal"

// 活动类型配置
const eventTypeConfig = {
  OFFICIAL_LIVE: { 
    label: "官方直播", 
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: Video 
  },
  MEETUP: { 
    label: "线下聚会", 
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: Users 
  },
  WORKSHOP: { 
    label: "实战工作坊", 
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    icon: BookOpen 
  },
  AMA: { 
    label: "AMA问答", 
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Coffee 
  },
  MILESTONE: { 
    label: "里程碑", 
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: Milestone 
  }
}

// 模拟活动数据
const mockEvents = [
  // 7月活动
  {
    id: "1",
    title: "Next.js 14 深度解析",
    type: "OFFICIAL_LIVE",
    date: "2025-07-20",
    startTime: "20:00",
    endTime: "22:00",
    speaker: "刘小排",
    description: "深入探讨Next.js 14的新特性，包括App Router、Server Actions等",
    participants: 234,
    maxParticipants: 500,
    tags: ["技术分享", "前端开发"]
  },
  {
    id: "2",
    title: "深圳线下技术交流会",
    type: "MEETUP",
    date: "2025-07-25",
    startTime: "14:00",
    endTime: "18:00",
    location: "深圳市南山区科技园",
    description: "面对面交流，分享独立开发经验",
    participants: 45,
    maxParticipants: 50,
    status: "almost-full",
    tags: ["线下活动", "深圳"]
  },
  {
    id: "3",
    title: "AI产品从0到1实战营",
    type: "WORKSHOP",
    date: "2025-07-15",
    startTime: "19:00",
    endTime: "21:00",
    description: "手把手教你打造AI产品，从idea到上线全流程",
    participants: 89,
    enrolled: true,
    tags: ["AI", "产品开发"]
  },
  {
    id: "4",
    title: "深海圈1周年庆典",
    type: "MILESTONE",
    date: "2025-07-18",
    startTime: "全天",
    description: "深海圈成立一周年，感谢10000+学员的支持！",
    special: true,
    tags: ["特别活动"]
  },
  {
    id: "5",
    title: "Cursor AI高效编程",
    type: "AMA",
    date: "2025-07-22",
    startTime: "21:00",
    endTime: "22:00",
    speaker: "张三",
    description: "分享Cursor AI的使用技巧，提升10倍编程效率",
    tags: ["AI工具", "效率提升"]
  },
  {
    id: "8",
    title: "Vue 3.5 新特性解读",
    type: "OFFICIAL_LIVE",
    date: "2025-07-18",
    startTime: "19:00",
    endTime: "20:30",
    speaker: "王五",
    description: "深入解析Vue 3.5的新功能和性能优化",
    tags: ["前端", "Vue"]
  },
  // 补充更多活动让日历更充实
  {
    id: "31",
    title: "GitHub Copilot实战",
    type: "WORKSHOP",
    date: "2025-07-01",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "AI编程专家",
    description: "掌握GitHub Copilot，提升编码效率",
    participants: 145,
    tags: ["AI编程", "工具"]
  },
  {
    id: "32",
    title: "产品定价策略",
    type: "AMA",
    date: "2025-07-03",
    startTime: "21:00",
    endTime: "22:00",
    speaker: "商业专家",
    description: "SaaS产品如何定价，心理学与策略",
    participants: 278,
    tags: ["商业", "定价"]
  },
  {
    id: "33",
    title: "前端性能监控",
    type: "OFFICIAL_LIVE",
    date: "2025-07-04",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "监控专家",
    description: "Sentry、LogRocket等工具实战",
    participants: 167,
    enrolled: true,
    tags: ["监控", "性能"]
  },
  {
    id: "34",
    title: "深圳技术沙龙",
    type: "MEETUP",
    date: "2025-07-05",
    startTime: "14:00",
    endTime: "17:00",
    location: "深圳市福田区",
    description: "周末技术交流",
    participants: 23,
    maxParticipants: 30,
    tags: ["线下", "深圳"]
  },
  {
    id: "35",
    title: "微前端架构实战",
    type: "WORKSHOP",
    date: "2025-07-07",
    startTime: "20:00",
    endTime: "22:00",
    speaker: "架构师",
    description: "qiankun、Module Federation实战",
    participants: 198,
    tags: ["架构", "微前端"]
  },
  {
    id: "36",
    title: "独立开发者法律指南",
    type: "AMA",
    date: "2025-07-09",
    startTime: "20:30",
    endTime: "21:30",
    speaker: "法律顾问",
    description: "合同、版权、隐私政策必知",
    participants: 342,
    tags: ["法律", "合规"]
  },
  {
    id: "37",
    title: "Flutter跨平台开发",
    type: "OFFICIAL_LIVE",
    date: "2025-07-11",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "移动专家",
    description: "一套代码，多端运行",
    participants: 234,
    tags: ["Flutter", "移动"]
  },
  {
    id: "38",
    title: "西安开发者聚会",
    type: "MEETUP",
    date: "2025-07-13",
    startTime: "14:00",
    endTime: "17:00",
    location: "西安市高新区",
    description: "古城开发者交流",
    participants: 19,
    maxParticipants: 25,
    tags: ["线下", "西安"]
  },
  {
    id: "39",
    title: "Rust入门到实战",
    type: "WORKSHOP",
    date: "2025-07-17",
    startTime: "20:00",
    endTime: "22:00",
    speaker: "Rust专家",
    description: "系统级编程语言入门",
    participants: 156,
    tags: ["Rust", "系统编程"]
  },
  // 新增7月活动
  {
    id: "9",
    title: "React性能优化实战",
    type: "WORKSHOP",
    date: "2025-07-02",
    startTime: "20:00",
    endTime: "22:00",
    speaker: "陈七",
    description: "深入React性能优化，包括memo、useMemo、useCallback等最佳实践",
    participants: 156,
    maxParticipants: 300,
    tags: ["React", "性能优化"]
  },
  {
    id: "10",
    title: "北京创业者聚会",
    type: "MEETUP",
    date: "2025-07-06",
    startTime: "14:00",
    endTime: "17:00",
    location: "北京市海淀区中关村",
    description: "独立开发者和创业者的线下交流",
    participants: 32,
    maxParticipants: 40,
    tags: ["线下活动", "北京"]
  },
  {
    id: "11",
    title: "TypeScript高级特性",
    type: "OFFICIAL_LIVE",
    date: "2025-07-08",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "周八",
    description: "TypeScript泛型、装饰器、高级类型等深度讲解",
    participants: 189,
    enrolled: true,
    tags: ["TypeScript", "进阶"]
  },
  {
    id: "12",
    title: "独立开发者税务指南",
    type: "AMA",
    date: "2025-07-10",
    startTime: "19:30",
    endTime: "20:30",
    speaker: "财务专家",
    description: "海外收入如何合规纳税，个人开发者必知",
    participants: 421,
    tags: ["税务", "合规"]
  },
  {
    id: "13",
    title: "Supabase实战教程",
    type: "WORKSHOP",
    date: "2025-07-12",
    startTime: "20:00",
    endTime: "22:00",
    speaker: "吴九",
    description: "使用Supabase快速搭建后端服务",
    participants: 67,
    maxParticipants: 200,
    tags: ["后端", "Supabase"]
  },
  {
    id: "14",
    title: "产品增长黑客技巧",
    type: "OFFICIAL_LIVE",
    date: "2025-07-14",
    startTime: "20:00",
    endTime: "21:00",
    speaker: "郑十",
    description: "0成本获客，产品冷启动策略分享",
    participants: 312,
    tags: ["增长", "营销"]
  },
  {
    id: "15",
    title: "上海开发者聚会",
    type: "MEETUP",
    date: "2025-07-16",
    startTime: "13:30",
    endTime: "17:30",
    location: "上海市浦东新区张江",
    description: "魔都开发者线下交流活动",
    participants: 28,
    maxParticipants: 35,
    status: "almost-full",
    tags: ["线下活动", "上海"]
  },
  {
    id: "16",
    title: "Claude API最佳实践",
    type: "AMA",
    date: "2025-07-19",
    startTime: "21:00",
    endTime: "22:00",
    speaker: "AI专家",
    description: "如何高效使用Claude API，成本优化技巧",
    participants: 178,
    tags: ["AI", "API"]
  },
  {
    id: "17",
    title: "TailwindCSS进阶技巧",
    type: "WORKSHOP",
    date: "2025-07-21",
    startTime: "19:30",
    endTime: "21:00",
    speaker: "前端专家",
    description: "自定义主题、组件库开发、性能优化",
    participants: 94,
    enrolled: true,
    tags: ["CSS", "Tailwind"]
  },
  {
    id: "18",
    title: "独立开发者健康指南",
    type: "AMA",
    date: "2025-07-23",
    startTime: "20:30",
    endTime: "21:30",
    speaker: "健康顾问",
    description: "长期编程如何保护颈椎、腰椎和视力",
    participants: 256,
    tags: ["健康", "生活"]
  },
  {
    id: "19",
    title: "Vercel部署优化",
    type: "OFFICIAL_LIVE",
    date: "2025-07-24",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "部署专家",
    description: "Vercel高级配置，CDN优化，成本控制",
    participants: 143,
    tags: ["部署", "Vercel"]
  },
  {
    id: "20",
    title: "广州技术沙龙",
    type: "MEETUP",
    date: "2025-07-26",
    startTime: "14:00",
    endTime: "17:00",
    location: "广州市天河区珠江新城",
    description: "华南开发者聚会",
    participants: 22,
    maxParticipants: 30,
    tags: ["线下活动", "广州"]
  },
  {
    id: "21",
    title: "Prisma ORM深度解析",
    type: "WORKSHOP",
    date: "2025-07-27",
    startTime: "20:00",
    endTime: "22:00",
    speaker: "数据库专家",
    description: "Prisma schema设计、迁移、性能优化",
    participants: 78,
    tags: ["数据库", "Prisma"]
  },
  {
    id: "22",
    title: "GPT提示词工程",
    type: "AMA",
    date: "2025-07-28",
    startTime: "21:00",
    endTime: "22:00",
    speaker: "提示词专家",
    description: "如何写出高质量的提示词，让AI更懂你",
    participants: 367,
    tags: ["AI", "提示词"]
  },
  {
    id: "23",
    title: "Docker容器化部署",
    type: "OFFICIAL_LIVE",
    date: "2025-07-29",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "运维专家",
    description: "前端项目容器化，CI/CD流程搭建",
    participants: 124,
    tags: ["Docker", "部署"]
  },
  {
    id: "24",
    title: "成都开发者聚会",
    type: "MEETUP",
    date: "2025-07-30",
    startTime: "14:30",
    endTime: "17:30",
    location: "成都市高新区软件园",
    description: "西南地区开发者交流",
    participants: 18,
    maxParticipants: 25,
    tags: ["线下活动", "成都"]
  },
  {
    id: "25",
    title: "Redis缓存策略",
    type: "WORKSHOP",
    date: "2025-07-31",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "缓存专家",
    description: "Redis在Next.js项目中的最佳实践",
    participants: 92,
    tags: ["Redis", "缓存"]
  },
  // 补充6月底的活动（会显示在日历上）
  {
    id: "40",
    title: "月度总结分享会",
    type: "OFFICIAL_LIVE",
    date: "2025-06-29",
    startTime: "20:00",
    endTime: "21:00",
    speaker: "刘小排",
    description: "6月精彩回顾，7月活动预告",
    participants: 456,
    tags: ["总结", "分享"]
  },
  {
    id: "41",
    title: "周末编程马拉松",
    type: "WORKSHOP",
    date: "2025-06-30",
    startTime: "09:00",
    endTime: "18:00",
    speaker: "社区组织",
    description: "48小时开发挑战赛",
    participants: 89,
    maxParticipants: 100,
    tags: ["竞赛", "挑战"]
  },
  // 8月活动
  {
    id: "26",
    title: "Stripe支付集成实战",
    type: "WORKSHOP",
    date: "2025-08-05",
    startTime: "20:00",
    endTime: "22:00",
    description: "详解Stripe支付集成，避坑指南",
    participants: 156,
    tags: ["支付", "技术实战"]
  },
  {
    id: "27",
    title: "月收入10万+分享",
    type: "OFFICIAL_LIVE",
    date: "2025-08-10",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "李四",
    description: "从0到月入10万的真实经历分享",
    participants: 892,
    tags: ["创业", "经验分享"]
  },
  {
    id: "28",
    title: "SEO优化实战",
    type: "WORKSHOP",
    date: "2025-08-01",
    startTime: "20:00",
    endTime: "22:00",
    speaker: "SEO专家",
    description: "独立站SEO优化，提升谷歌排名",
    participants: 234,
    tags: ["SEO", "营销"]
  },
  {
    id: "29",
    title: "WebSocket实时通信",
    type: "OFFICIAL_LIVE",
    date: "2025-08-03",
    startTime: "20:00",
    endTime: "21:30",
    speaker: "实时专家",
    description: "Socket.io在Next.js中的应用",
    participants: 167,
    enrolled: true,
    tags: ["WebSocket", "实时"]
  },
  {
    id: "30",
    title: "杭州开发者聚会",
    type: "MEETUP",
    date: "2025-08-08",
    startTime: "14:00",
    endTime: "17:00",
    location: "杭州市西湖区文三路",
    description: "杭州地区开发者交流",
    participants: 26,
    maxParticipants: 30,
    tags: ["线下活动", "杭州"]
  }
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 6, 1)) // 2025年7月
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [events] = useState(mockEvents)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(Object.keys(eventTypeConfig))
  const [showFilters, setShowFilters] = useState(false)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [popupRef, setPopupRef] = useState<HTMLElement | null>(null)
  const [showCreateMeetup, setShowCreateMeetup] = useState(false)
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null)

  // 获取日历显示的日期范围
  const calendarDates = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const startWeek = startOfWeek(start)
    const endWeek = endOfWeek(end)
    return eachDayOfInterval({ start: startWeek, end: endWeek })
  }, [currentDate])

  // 根据筛选条件过滤活动
  const filteredEvents = useMemo(() => {
    return events.filter(event => selectedTypes.includes(event.type))
  }, [events, selectedTypes])

  // 获取某一天的活动
  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return filteredEvents.filter(event => event.date === dateStr)
  }

  // 判断事件是否已过期
  const isEventPast = (eventDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const eventDateObj = new Date(eventDate)
    eventDateObj.setHours(0, 0, 0, 0)
    return eventDateObj < today
  }

  // 导航函数
  const navigateMonth = (direction: number) => {
    setCurrentDate(direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1))
  }

  // 切换活动类型筛选
  const toggleEventType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // 处理点击事件，记录点击元素的位置
  const handleEventClick = (e: React.MouseEvent<HTMLDivElement>, eventId: string) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft
    
    setPopupPosition({
      x: rect.left + scrollLeft + rect.width / 2,
      y: rect.bottom + scrollTop
    })
    setSelectedEvent(eventId)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-6">
        {/* 紧凑的页面头部 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* 标题和月份导航 */}
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#0891A1]" />
                深海活动日历
              </h1>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="上个月"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-medium text-gray-700 min-w-[120px] text-center">
                  {format(currentDate, "yyyy年 M月", { locale: zhCN })}
                </h2>

                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                  title="下个月"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setCurrentDate(new Date(2025, 6, 1))}
                  className="ml-2 px-3 py-1.5 text-sm rounded bg-[#0891A1] text-white hover:bg-[#07575B] transition-colors"
                >
                  今天
                </button>
              </div>
            </div>

            {/* 视图切换和筛选 */}
            <div className="flex items-center gap-3">
              {/* 视图切换 - 类似截图的样式 */}
              <div className="flex items-center border border-gray-200 rounded-md">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" 
                      ? "bg-gray-100 text-gray-900" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                  title="列表视图"
                >
                  <List className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-gray-200" />
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`p-2 transition-colors ${
                    viewMode === "calendar" 
                      ? "bg-gray-100 text-gray-900" 
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                  title="日历视图"
                >
                  <CalendarDays className="w-5 h-5" />
                </button>
              </div>

              {/* 筛选按钮 */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  showFilters 
                    ? "bg-gray-900 text-white" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                筛选
                {selectedTypes.length < Object.keys(eventTypeConfig).length && (
                  <span className="bg-white text-gray-900 px-1.5 py-0.5 rounded text-xs">
                    {selectedTypes.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* 侧边栏筛选器 */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-64 flex-shrink-0"
              >
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">活动类型</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(eventTypeConfig).map(([type, config]) => {
                      const Icon = config.icon
                      const totalCount = events.filter(e => e.type === type).length
                      const upcomingCount = events.filter(e => e.type === type && !isEventPast(e.date)).length
                      const isSelected = selectedTypes.includes(type)
                      
                      return (
                        <label
                          key={type}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                            isSelected 
                              ? `${config.bgColor} ${config.borderColor} border` 
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleEventType(type)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? `${config.color} border-current` 
                              : "border-gray-300"
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                          <span className="flex-1 text-sm font-medium">{config.label}</span>
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-gray-900">{upcomingCount}</span>
                            {upcomingCount < totalCount && (
                              <span className="text-gray-400">/{totalCount}</span>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>

                  {/* 快捷操作 */}
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => setSelectedTypes(Object.keys(eventTypeConfig))}
                      className="w-full text-sm text-gray-600 hover:text-gray-900"
                    >
                      全选
                    </button>
                    <button
                      onClick={() => setSelectedTypes([])}
                      className="w-full text-sm text-gray-600 hover:text-gray-900"
                    >
                      清除
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 主内容区域 */}
          <div className="flex-1">
            {viewMode === "calendar" ? (
              // 日历视图
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* 星期标题 */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                  {["日", "一", "二", "三", "四", "五", "六"].map(day => (
                    <div key={day} className="py-3 text-center text-sm font-medium text-gray-700">
                      {day}
                    </div>
                  ))}
                </div>

                {/* 日期格子 */}
                <div className="grid grid-cols-7">
                {calendarDates.map((date, index) => {
                  const dayEvents = getEventsForDay(date)
                  const isCurrentMonth = isSameMonth(date, currentDate)
                  const isSelectedDate = selectedDate && isSameDay(date, selectedDate)
                  const isTodayDate = format(date, "yyyy-MM-dd") === "2025-07-18"
                  
                  return (
                    <div
                      key={index}
                      className={`
                        relative min-h-[110px] p-2 border-r border-b border-gray-200 
                        cursor-pointer transition-colors
                        ${!isCurrentMonth ? "bg-gray-50" : "bg-white"}
                        ${isSelectedDate ? "ring-2 ring-inset ring-[#0891A1]" : "hover:bg-gray-50"}
                        ${isTodayDate ? "bg-[#0891A1]/5" : ""}
                      `}
                      onClick={() => setSelectedDate(date)}
                    >
                      {/* 日期数字 */}
                      <div className={`
                        text-sm font-medium mb-1 
                        ${!isCurrentMonth ? "text-gray-400" : "text-gray-700"}
                        ${isTodayDate ? "text-[#0891A1]" : ""}
                      `}>
                        <span className={`
                          inline-flex items-center justify-center w-7 h-7 rounded-full
                          ${isTodayDate ? "bg-[#0891A1] text-white" : ""}
                        `}>
                          {format(date, "d")}
                        </span>
                      </div>

                      {/* 活动列表 */}
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => {
                          const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
                          const Icon = config.icon
                          const isPast = isEventPast(event.date)
                          
                          return (
                            <div
                              key={event.id}
                              className={`
                                relative px-1.5 py-0.5 rounded text-xs cursor-pointer
                                ${config.bgColor} ${config.borderColor} ${config.color}
                                border hover:shadow-sm transition-all
                                ${event.enrolled ? "font-medium" : ""}
                                ${isPast ? "opacity-60" : ""}
                              `}
                              onClick={(e) => handleEventClick(e, event.id)}
                            >
                              <div className="flex items-center gap-1">
                                <Icon className="w-3 h-3 flex-shrink-0" />
                                <span className="font-medium truncate">{event.title}</span>
                              </div>
                              <div className="text-[10px] opacity-75">
                                {event.startTime} {event.endTime && `- ${event.endTime}`}
                              </div>
                              
                            </div>
                          )
                        })}
                        
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{dayEvents.length - 3} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                </div>
              </div>
            ) : (
              // 列表视图
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="space-y-4">
                  {/* 按日期分组显示活动 */}
                  {(() => {
                    // 获取当月所有活动并按日期分组
                    const currentMonthEvents = filteredEvents.filter(event => {
                      const eventDate = parseISO(event.date)
                      return isSameMonthCheck(eventDate, currentDate)
                    }).sort((a, b) => a.date.localeCompare(b.date))

                    // 按日期分组
                    const groupedEvents = currentMonthEvents.reduce((groups, event) => {
                      const date = event.date
                      if (!groups[date]) {
                        groups[date] = []
                      }
                      groups[date].push(event)
                      return groups
                    }, {} as Record<string, typeof events>)

                    return Object.entries(groupedEvents).map(([date, dayEvents]) => {
                      const dateObj = parseISO(date)
                      const isPastDate = isEventPast(date)
                      
                      return (
                        <div key={date} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                          {/* 日期标题 */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 uppercase">
                                {format(dateObj, "EEE", { locale: zhCN })}
                              </div>
                              <div className="text-2xl font-bold text-gray-900">
                                {format(dateObj, "d")}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-600">
                                {format(dateObj, "M月d日 EEEE", { locale: zhCN })}
                              </div>
                              {isPastDate && (
                                <div className="text-xs text-gray-400">已过期</div>
                              )}
                            </div>
                          </div>

                          {/* 当天活动列表 */}
                          <div className="ml-12 space-y-3">
                            {dayEvents.map((event) => {
                              const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
                              const Icon = config.icon

                              return (
                                <div
                                  key={event.id}
                                  className={`
                                    p-4 rounded-lg border cursor-pointer transition-all
                                    ${config.bgColor} ${config.borderColor}
                                    ${isPastDate ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-0.5'}
                                  `}
                                  onClick={(e) => handleEventClick(e, event.id)}
                                >
                                  <div className="flex items-start gap-3">
                                    {/* 活动图标 */}
                                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                      <Icon className={`w-5 h-5 ${config.color}`} />
                                    </div>

                                    {/* 活动信息 */}
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <h3 className="font-medium text-gray-900 mb-1">
                                            {event.title}
                                          </h3>
                                          <p className="text-sm text-gray-600 mb-2">
                                            {event.description}
                                          </p>
                                          <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                              <Clock className="w-4 h-4" />
                                              {event.startTime}
                                              {event.endTime && ` - ${event.endTime}`}
                                            </span>
                                            {event.speaker && (
                                              <span 
                                                className="flex items-center gap-1 cursor-pointer hover:text-[#0891A1] transition-colors"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  setSelectedSpeaker(event.speaker!)
                                                }}
                                              >
                                                <Users className="w-4 h-4" />
                                                {event.speaker}
                                              </span>
                                            )}
                                            {event.location && (
                                              <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {event.location}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* 状态和操作 */}
                                        <div className="text-right">
                                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${config.color} font-medium`}>
                                            {config.label}
                                          </div>
                                          {event.enrolled && (
                                            <div className="mt-2 text-sm text-emerald-600 flex items-center gap-1 justify-end">
                                              <Check className="w-4 h-4" />
                                              已报名
                                            </div>
                                          )}
                                          {event.status === "almost-full" && (
                                            <div className="mt-2 text-sm text-orange-600">
                                              即将满员
                                            </div>
                                          )}
                                          {event.participants !== undefined && (
                                            <div className="mt-2 text-xs text-gray-500">
                                              {event.participants}人参与
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* 标签 */}
                                      {event.tags && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                          {event.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  })()}
                  
                  {/* 如果没有活动 */}
                  {filteredEvents.filter(event => {
                    const eventDate = parseISO(event.date)
                    return isSameMonthCheck(eventDate, currentDate)
                  }).length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">本月暂无活动</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 悬浮操作按钮 - 创建组局 */}
        <button
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#0891A1] text-white rounded-full shadow-lg hover:bg-[#07575B] hover:shadow-xl transition-all flex items-center justify-center group"
          title="创建组局"
          onClick={() => setShowCreateMeetup(true)}
        >
          <Plus className="w-6 h-6" />
          <span className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            创建组局
          </span>
        </button>

        {/* 事件详情弹窗 - Portal渲染，智能定位 */}
        {selectedEvent && (() => {
          const event = events.find(e => e.id === selectedEvent)
          if (!event) return null

          const config = eventTypeConfig[event.type as keyof typeof eventTypeConfig]
          const Icon = config.icon
          const isPast = isEventPast(event.date)
          
          // 计算弹窗位置 - 使用绝对定位而非固定定位
          const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
          const scrollY = typeof window !== 'undefined' ? window.scrollY : 0
          const popupWidth = 320
          const popupMaxHeight = 400
          
          let left = popupPosition.x - popupWidth / 2
          let top = popupPosition.y + 8
          
          // 边界检测和调整
          if (left < 10) left = 10
          if (left + popupWidth > viewportWidth - 10) left = viewportWidth - popupWidth - 10
          
          // 如果下方空间不足，显示在上方
          const bottomSpace = viewportHeight + scrollY - top
          if (bottomSpace < popupMaxHeight + 20) {
            // 尝试显示在上方
            const topSpace = popupPosition.y - scrollY - 8
            if (topSpace > popupMaxHeight) {
              top = popupPosition.y - popupMaxHeight - 8
            } else {
              // 如果上下都不够，选择空间较大的一侧
              if (topSpace > bottomSpace) {
                top = popupPosition.y - Math.min(topSpace - 20, popupMaxHeight) - 8
              } else {
                // 保持在下方，但限制高度
                top = popupPosition.y + 8
              }
            }
          }

          return (
            <>
              {/* 背景遮罩 */}
              <div 
                className="fixed inset-0 bg-black/30 z-[99]"
                onClick={() => setSelectedEvent(null)}
              />
              
              {/* 详情弹窗 - 使用固定定位但考虑滚动 */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="fixed w-80 p-4 bg-gray-900 text-white rounded-lg shadow-2xl z-[100]"
                style={{
                  left: `${Math.max(10, Math.min(left, viewportWidth - 330))}px`,
                  top: `${top - scrollY}px`,
                  maxHeight: `${Math.min(popupMaxHeight, viewportHeight - (top - scrollY) - 20)}px`,
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* 标题栏和关闭按钮 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className={`text-xs px-2 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                      {isPast && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                          已结束
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-base">{event.title}</div>
                    <div className="text-sm opacity-90 mt-1">{event.description}</div>
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 hover:bg-white/10 rounded transition-colors ml-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* 状态标签 */}
                {event.status === "almost-full" && (
                  <div className="mb-3">
                    <span className="px-3 py-1 bg-orange-500 text-white text-xs rounded-full">
                      即将满员
                    </span>
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <span>{event.startTime} - {event.endTime || "待定"}</span>
                  </div>
                  {event.speaker && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-300" />
                      <span>
                        讲师：
                        <span 
                          className="cursor-pointer hover:text-[#0891A1] transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedSpeaker(event.speaker!)
                          }}
                        >
                          {event.speaker}
                        </span>
                      </span>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-300" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.participants !== undefined && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-300" />
                      <span>
                        {event.participants}人已报名
                        {event.maxParticipants && ` / ${event.maxParticipants}人`}
                      </span>
                    </div>
                  )}
                </div>

                {event.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {event.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-white/20 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  {isPast ? (
                    <div className="text-center text-sm text-gray-400">
                      活动已结束
                    </div>
                  ) : event.enrolled ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-400 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        已报名
                      </span>
                      <button className="text-sm text-gray-400 hover:text-white transition-colors">
                        取消报名
                      </button>
                    </div>
                  ) : event.special ? (
                    <div className="text-center text-sm text-gray-400">
                      特别活动
                    </div>
                  ) : (
                    <button 
                      className="w-full py-2 bg-gradient-to-r from-[#0891A1] to-[#00A8CC] text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all"
                      onClick={() => {
                        // TODO: 实现报名逻辑
                        alert(`报名活动: ${event.title}`)
                      }}
                    >
                      立即报名
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )
        })()}
        
        {/* 创建组局弹窗 */}
        <CreateMeetupModal
          isOpen={showCreateMeetup}
          onClose={() => setShowCreateMeetup(false)}
          defaultDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
        />
        
        {/* 成员信息弹窗 */}
        {selectedSpeaker && (
          <MemberInfoModal
            isOpen={!!selectedSpeaker}
            onClose={() => setSelectedSpeaker(null)}
            memberName={selectedSpeaker}
            position="center"
            size="medium"
          />
        )}
      </div>
    </div>
  )
}