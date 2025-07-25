"use client"

import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SearchBox } from "@/components/search-box"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Bell, Menu, X, User, Settings, LogOut, HelpCircle } from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(3)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const isHomePage = pathname === "/"
  
  // 确保客户端渲染后才显示，避免hydration错误
  useEffect(() => {
    setMounted(true)
  }, [])

  // 模拟未读消息数据
  useEffect(() => {
    // 模拟数据，实际项目中从API获取
    setUnreadCount(2)
    setNotificationCount(3)
  }, [])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.notification-dropdown') && !target.closest('.message-dropdown') && !target.closest('.user-menu-dropdown')) {
        setShowNotifications(false)
        setShowMessages(false)
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 64)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 导航项配置 - 重新组织
  const navItems = [
    { 
      href: "/feed", 
      label: "社区",
      description: "动态交流"
    },
    { 
      href: "/courses", 
      label: "学习",
      description: "系统化课程"
    },
    { 
      href: "/resources", 
      label: "资源",
      description: "工具与资讯",
      children: [
        { href: "/news", label: "最新资讯" },
        { href: "/success-stories", label: "成功案例" },
        { href: "/faq", label: "常见问题" }
      ]
    },
    { 
      href: "/calendar", 
      label: "日历",
      description: "学习日历"
    },
    { 
      href: "/map", 
      label: "地图",
      description: "社区地图"
    },
    { 
      href: "/members", 
      label: "成员",
      description: "成员名录"
    },
    { 
      href: "/leaderboards", 
      label: "榜单",
      description: "积分排行"
    }
  ]

  // 避免服务端渲染不一致
  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 navbar-glass">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-[var(--c-primary-900)]">
              深海圈
            </Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isHomePage && !isScrolled
        ? 'navbar-transparent' 
        : 'navbar-glass'
    }`}>
      {/* 极光流动效果 */}
      <div className="navbar-aurora" />
      
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className={`text-2xl font-bold transition-colors ${
                isHomePage && !isScrolled ? 'text-white' : 'text-[var(--c-primary-900)]'
              }`}>
                深海圈
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.children && item.children.some(child => pathname === child.href))
                
                if (item.children) {
                  // 有子菜单的导航项
                  return (
                    <div key={item.href} className="relative group">
                      <button
                        className={`nav-item text-sm font-medium flex items-center gap-1 ${
                          isActive ? 'nav-item-active' : ''
                        } ${
                          isHomePage && !isScrolled 
                            ? 'text-white hover:text-white' 
                            : 'text-gray-700 hover:text-[var(--c-primary-600)]'
                        }`}
                      >
                        {item.label}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* 下拉菜单 */}
                      <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-[var(--c-primary-50)] hover:text-[var(--c-primary-700)] transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                
                // 普通导航项
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`nav-item text-sm font-medium ${
                      isActive ? 'nav-item-active' : ''
                    } ${
                      isHomePage && !isScrolled 
                        ? 'text-white hover:text-white' 
                        : 'text-gray-700 hover:text-[var(--c-primary-600)]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <div className="nav-bubbles">
                        <div className="nav-bubble" />
                        <div className="nav-bubble" />
                        <div className="nav-bubble" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className={`lg:hidden ${
                isHomePage && !isScrolled ? 'text-white' : 'text-gray-700'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {/* 消息按钮 */}
            <div className="relative message-dropdown">
              <button
                onClick={() => {
                  setShowMessages(!showMessages)
                  setShowNotifications(false)
                  setShowUserMenu(false)
                }}
                className={`relative p-2 rounded-lg transition-colors ${
                  isHomePage && !isScrolled ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="h-7 w-7" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* 消息下拉菜单 */}
              {showMessages && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">私信</h3>
                      <Link href="/messages" className="text-sm text-[#0891A1] hover:underline">
                        查看全部
                      </Link>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* 消息列表 */}
                    {[
                      { id: 1, user: '张三', message: '你好，能帮我看看这个代码吗？', time: '5分钟前', avatar: '张' },
                      { id: 2, user: '李四', message: '项目进展如何？', time: '1小时前', avatar: '李' },
                    ].map(msg => (
                      <div key={msg.id} className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#0891A1] to-[#00A8CC] rounded-full flex items-center justify-center text-white font-bold">
                            {msg.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{msg.user}</span>
                              <span className="text-xs text-gray-500">{msg.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 通知按钮 */}
            <div className="relative notification-dropdown">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowMessages(false)
                  setShowUserMenu(false)
                }}
                className={`relative p-2 rounded-lg transition-colors ${
                  isHomePage && !isScrolled ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="h-7 w-7" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              {/* 通知下拉菜单 */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">通知</h3>
                      <Link href="/notifications" className="text-sm text-[#0891A1] hover:underline">
                        查看全部
                      </Link>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* 通知列表 */}
                    {[
                      { id: 1, type: 'follow', user: '王五', action: '关注了你', time: '刚刚' },
                      { id: 2, type: 'like', user: '赵六', action: '点赞了你的帖子', time: '10分钟前' },
                      { id: 3, type: 'comment', user: '周七', action: '评论了你的项目', time: '1小时前' },
                    ].map(notif => (
                      <div key={notif.id} className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {notif.type === 'follow' && <User className="w-5 h-5 text-gray-600" />}
                            {notif.type === 'like' && <span className="text-red-500">❤️</span>}
                            {notif.type === 'comment' && <MessageCircle className="w-5 h-5 text-gray-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium text-gray-900">{notif.user}</span>
                              <span className="text-gray-600"> {notif.action}</span>
                            </p>
                            <span className="text-xs text-gray-500">{notif.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 用户头像和下拉菜单 */}
            <div className="relative user-menu-dropdown">
              <button 
                onClick={() => {
                  setShowUserMenu(!showUserMenu)
                  setShowMessages(false)
                  setShowNotifications(false)
                }}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                  isHomePage && !isScrolled ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
              >
                <img 
                  src="/avatars/刘小排.jpg" 
                  alt="用户头像" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.svg'
                  }}
                />
              </button>
              
              {/* 用户菜单下拉 */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-medium text-gray-900">刘小排</p>
                    <p className="text-sm text-gray-500">liuxiaopai@example.com</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <User className="w-4 h-4" />
                      个人资料
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <Settings className="w-4 h-4" />
                      设置
                    </Link>
                    <Link href="/help" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <HelpCircle className="w-4 h-4" />
                      帮助中心
                    </Link>
                    <hr className="my-1" />
                    <button 
                      onClick={() => signOut()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden border-t ${
            isHomePage && !isScrolled 
              ? 'border-white/20 bg-[var(--c-primary-900)]/95 backdrop-blur-md' 
              : 'border-gray-200 bg-white'
          }`}>
            <div className="py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className={`block px-4 py-2 text-base font-medium transition-colors ${
                      isActive 
                        ? isHomePage && !isScrolled 
                          ? 'bg-white/10 text-[var(--c-primary-300)]' 
                          : 'bg-[var(--c-primary-100)] text-[var(--c-primary-700)]'
                        : isHomePage && !isScrolled 
                          ? 'text-white hover:bg-white/10' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}