'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Bell, 
  MessageCircle, 
  Heart, 
  UserPlus, 
  GraduationCap,
  Calendar,
  Megaphone,
  CheckCheck,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Notification {
  id: string
  type: string
  title: string
  content: string
  link?: string
  isRead: boolean
  createdAt: string
}

const notificationIcons: Record<string, any> = {
  SYSTEM: Megaphone,
  COMMENT: MessageCircle,
  LIKE: Heart,
  FOLLOW: UserPlus,
  COURSE: GraduationCap,
  EVENT: Calendar
}

const notificationColors: Record<string, string> = {
  SYSTEM: 'text-blue-500',
  COMMENT: 'text-green-500',
  LIKE: 'text-red-500',
  FOLLOW: 'text-purple-500',
  COURSE: 'text-orange-500',
  EVENT: 'text-indigo-500'
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [markingAllRead, setMarkingAllRead] = useState(false)

  // 获取通知列表
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('获取通知失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 标记单个通知为已读
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        )
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    setMarkingAllRead(true)
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        )
      }
    } catch (error) {
      console.error('标记全部已读失败:', error)
    } finally {
      setMarkingAllRead(false)
    }
  }

  // 处理通知点击
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    
    if (notification.link) {
      router.push(notification.link)
    }
  }

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    
    fetchNotifications()
  }, [session])

  if (!session) return null

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <CardTitle>通知中心</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive">{unreadCount} 条未读</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={markingAllRead}
              >
                {markingAllRead ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                全部标记为已读
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
              <TabsTrigger 
                value="all" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                全部
              </TabsTrigger>
              <TabsTrigger 
                value="unread"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                未读
              </TabsTrigger>
              <TabsTrigger 
                value="COMMENT"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                评论
              </TabsTrigger>
              <TabsTrigger 
                value="LIKE"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                点赞
              </TabsTrigger>
              <TabsTrigger 
                value="FOLLOW"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                关注
              </TabsTrigger>
              <TabsTrigger 
                value="COURSE"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                课程
              </TabsTrigger>
              <TabsTrigger 
                value="SYSTEM"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                系统
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[600px]">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">暂无通知</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || Bell
                    const iconColor = notificationColors[notification.type] || 'text-gray-500'
                    
                    return (
                      <button
                        key={notification.id}
                        className={`w-full p-4 hover:bg-muted/50 transition-colors text-left ${
                          !notification.isRead ? 'bg-muted/20' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 ${iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={`font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.content}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <Badge variant="default" className="shrink-0">
                                  新
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(notification.createdAt), 'MM月dd日 HH:mm', { locale: zhCN })}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}