"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users, Video, Milestone, Loader2 } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns"
import { zhCN } from "date-fns/locale"
import { EventType } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const eventTypeConfig: Record<EventType, { label: string; color: string; icon: any }> = {
  OFFICIAL_LIVE: { label: "官方直播", color: "bg-blue-500", icon: Video },
  OFFLINE_MEETUP: { label: "线下聚会", color: "bg-green-500", icon: Users },
  TRAINING_CAMP: { label: "实战营", color: "bg-purple-500", icon: Calendar },
  MILESTONE: { label: "里程碑", color: "bg-yellow-500", icon: Milestone },
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"month" | "list">("month")
  const [participatingId, setParticipatingId] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()

  // 获取活动数据
  const fetchEvents = async () => {
    try {
      // 获取当前月份的开始和结束日期
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      
      const response = await fetch(
        `/api/events?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}&limit=100`
      )
      
      if (!response.ok) {
        throw new Error("获取活动失败")
      }
      
      const data = await response.json()
      // 转换日期字符串为Date对象
      const eventsWithDates = data.events.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: event.endTime ? new Date(event.endTime) : null,
      }))
      
      setEvents(eventsWithDates)
    } catch (error) {
      console.error("获取活动失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentDate]) // 当月份改变时重新获取数据

  // 获取当月的所有日期
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // 补充前后的日期以填满日历格子
  const startDay = monthStart.getDay()
  const prevMonthDays = Array.from({ length: startDay }, (_, i) => 
    new Date(monthStart.getTime() - (startDay - i) * 24 * 60 * 60 * 1000)
  )
  const endDay = monthEnd.getDay()
  const nextMonthDays = Array.from({ length: 6 - endDay }, (_, i) =>
    new Date(monthEnd.getTime() + (i + 1) * 24 * 60 * 60 * 1000)
  )
  
  const calendarDays = [...prevMonthDays, ...monthDays, ...nextMonthDays]

  // 获取某一天的活动
  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startTime), date)
    )
  }
  
  // 处理参与/取消参与活动
  const handleParticipation = async (eventId: string, isParticipant: boolean) => {
    if (!session) {
      toast.error("请先登录")
      router.push("/login")
      return
    }
    
    setParticipatingId(eventId)
    
    try {
      const response = await fetch(`/api/events/${eventId}/participate`, {
        method: isParticipant ? "DELETE" : "POST",
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "操作失败")
      }
      
      // 更新本地状态
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.id === eventId) {
            return {
              ...event,
              isParticipant: !isParticipant,
              _count: {
                ...event._count,
                participants: isParticipant 
                  ? event._count.participants - 1 
                  : event._count.participants + 1
              }
            }
          }
          return event
        })
      )
      
      toast.success(isParticipant ? "已取消报名" : "报名成功")
    } catch (error: any) {
      toast.error(error.message || "操作失败")
    } finally {
      setParticipatingId(null)
    }
  }

  // 渲染日历视图
  const renderCalendarView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* 星期标题 */}
      {["日", "一", "二", "三", "四", "五", "六"].map(day => (
        <div key={day} className="text-center font-medium py-2 text-sm">
          {day}
        </div>
      ))}
      
      {/* 日期格子 */}
      {calendarDays.map((date, index) => {
        const dayEvents = getEventsForDay(date)
        const isCurrentMonth = isSameMonth(date, currentDate)
        const isToday = isSameDay(date, new Date())
        
        return (
          <div
            key={index}
            className={`min-h-[100px] border rounded-lg p-2 cursor-pointer transition-all ${
              isCurrentMonth ? "bg-background" : "bg-muted/30"
            } ${isToday ? "ring-2 ring-primary" : ""} hover:shadow-md`}
            onClick={() => setSelectedDate(date)}
          >
            <div className={`text-sm font-medium mb-1 ${
              isToday ? "text-primary" : isCurrentMonth ? "" : "text-muted-foreground"
            }`}>
              {format(date, "d")}
            </div>
            
            {/* 活动列表 */}
            <div className="space-y-1">
              {dayEvents.slice(0, 2).map(event => {
                const config = eventTypeConfig[event.type as EventType]
                return (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded ${config.color} text-white truncate`}
                  >
                    {event.title}
                  </div>
                )
              })}
              {dayEvents.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{dayEvents.length - 2} 更多
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )

  // 渲染列表视图
  const renderListView = () => (
    <div className="space-y-4">
      {events.map(event => {
        const config = eventTypeConfig[event.type as EventType]
        const Icon = config.icon
        
        return (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(event.startTime), "yyyy年M月d日 HH:mm", { locale: zhCN })}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge>{config.label}</Badge>
                  {event.type !== "MILESTONE" && new Date(event.startTime) > new Date() && (
                    <Button
                      size="sm"
                      variant={event.isParticipant ? "outline" : "default"}
                      disabled={participatingId === event.id}
                      onClick={() => handleParticipation(event.id, event.isParticipant)}
                    >
                      {participatingId === event.id && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {event.isParticipant ? "取消报名" : "立即报名"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            {event.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                {event._count?.participants !== undefined && (
                  <div className="mt-2 text-sm">
                    <Users className="w-4 h-4 inline mr-1" />
                    {event._count.participants} 人已报名
                    {event.maxParticipants && ` / ${event.maxParticipants} 人`}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )

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
        <h1 className="text-3xl font-bold mb-4">活动日历</h1>
        <p className="text-muted-foreground">
          记录深海圈的发展历程，查看即将举行的活动
        </p>
      </div>

      {/* 视图切换和月份导航 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentDate, "yyyy年M月", { locale: zhCN })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            今天
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={view === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("month")}
          >
            月视图
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            列表视图
          </Button>
        </div>
      </div>

      {/* 活动统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(eventTypeConfig).map(([type, config]) => {
          const count = events.filter(e => e.type === type).length
          const Icon = config.icon
          return (
            <Card key={type}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 主内容区 */}
      {view === "month" ? renderCalendarView() : renderListView()}
    </div>
  )
}