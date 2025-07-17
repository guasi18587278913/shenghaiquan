"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBox } from "@/components/search-box"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Bell } from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)

  // 获取未读消息数
  useEffect(() => {
    if (session) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch('/api/messages/unread-count')
          if (response.ok) {
            const data = await response.json()
            setUnreadCount(data.count)
          }
        } catch (error) {
          console.error('获取未读消息数失败:', error)
        }
      }

      const fetchNotificationCount = async () => {
        try {
          const response = await fetch('/api/notifications/unread-count')
          if (response.ok) {
            const data = await response.json()
            setNotificationCount(data.count)
          }
        } catch (error) {
          console.error('获取未读通知数失败:', error)
        }
      }

      fetchUnreadCount()
      fetchNotificationCount()
      // 每30秒更新一次
      const interval = setInterval(() => {
        fetchUnreadCount()
        fetchNotificationCount()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-8">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xl md:text-2xl font-bold text-primary">深海圈</span>
              <span className="hidden sm:block text-sm text-muted-foreground">海外AI产品</span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/feed" className="text-sm hover:text-primary transition-colors">
                动态
              </Link>
              <Link href="/courses" className="text-sm hover:text-primary transition-colors">
                课程
              </Link>
              <Link href="/calendar" className="text-sm hover:text-primary transition-colors">
                日历
              </Link>
              <Link href="/news" className="text-sm hover:text-primary transition-colors">
                资讯
              </Link>
              <Link href="/members" className="text-sm hover:text-primary transition-colors">
                通讯录
              </Link>
              <Link href="/map" className="text-sm hover:text-primary transition-colors">
                地图
              </Link>
              <Link href="/success-stories" className="text-sm hover:text-primary transition-colors">
                成功案例
              </Link>
              <Link href="/faq" className="text-sm hover:text-primary transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <SearchBox 
              className="hidden md:block w-48 lg:w-64"
              placeholder="搜索动态、用户、标签..."
            />
            <SearchBox 
              className="md:hidden"
              compact
            />
            
            {status === "loading" ? (
              <div>加载中...</div>
            ) : session ? (
              <>
              <Link href="/notifications" className="relative">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/messages" className="relative">
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/profile" className="text-sm hover:text-primary">
                {session.user.name || session.user.phone}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
              >
                退出
              </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    注册
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}