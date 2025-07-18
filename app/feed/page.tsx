"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { PostCard } from "@/components/post-card"
import { PostType } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hash, Type, FileText, Loader2 } from "lucide-react"
import { getUserByName } from "@/lib/sample-users"
import { samplePosts } from "@/lib/sample-posts"

const postTypeLabels: Record<PostType, string> = {
  ANNOUNCEMENT: "公告通知",
  PROJECT: "项目展示",
  TECH_DISCUSSION: "技术讨论",
  EXPERIENCE: "经验分享",
  HELP: "求助问答",
  ACTIVITY: "线下活动",
  GENERAL: "综合讨论",
}

export default function FeedPage() {
  const { data: session, status } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState<PostType>("GENERAL")
  const [filterType, setFilterType] = useState("all")
  const [tags, setTags] = useState("")
  const [editorMode, setEditorMode] = useState<"simple" | "markdown">("simple")
  const [error, setError] = useState<string | null>(null)
  const [showNewPostCount, setShowNewPostCount] = useState(false)
  const [newPostCount, setNewPostCount] = useState(0)

  // 获取动态列表
  const fetchPosts = async () => {
    setError(null)
    try {
      const response = await fetch(`/api/posts?type=${filterType}`)
      if (!response.ok) {
        if (response.status === 404) {
          // API 可能还不存在，使用示例数据
          const filteredPosts = filterType === "all" 
            ? samplePosts 
            : samplePosts.filter(post => post.type === filterType)
          setPosts(filteredPosts)
          setLoading(false)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      console.error("获取动态失败:", error)
      // 出错时使用示例数据
      const filteredPosts = filterType === "all" 
        ? samplePosts 
        : samplePosts.filter(post => post.type === filterType)
      setPosts(filteredPosts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [filterType])

  // 发布动态
  const handlePublish = async () => {
    if (status === "unauthenticated") {
      alert("请先登录")
      return
    }

    if (!content.trim()) {
      alert("内容不能为空")
      return
    }

    setPublishing(true)
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          type: postType,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        }),
      })

      if (response.ok) {
        const newPost = await response.json()
        setPosts([newPost, ...posts])
        setContent("")
        setPostType("GENERAL")
        setTags("")
      } else {
        const error = await response.json()
        alert(error.error || "发布失败")
      }
    } catch (error) {
      alert("发布失败，请稍后重试")
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafb] pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* 主内容区 */}
          <div className="lg:col-span-2">
        {/* 搜索框 */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索动态内容..."
              className="w-full px-4 py-3 pl-11 bg-white rounded-xl shadow-sm border border-gray-100 focus:border-[var(--c-primary-300)] focus:ring-1 focus:ring-[var(--c-primary-300)] transition-all"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* 顶部筛选栏 - 胶囊按钮组 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 bg-white rounded-full shadow-sm">
              <button 
                onClick={() => setFilterType("all")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  filterType === "all" 
                    ? "bg-[var(--c-primary-500)] text-white shadow-sm" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                全部动态
              </button>
              {Object.entries(postTypeLabels).slice(0, 4).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilterType(value)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    filterType === value 
                      ? "bg-[var(--c-primary-500)] text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="relative group">
                <button className="px-5 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-1">
                  更多
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden py-1">
                    {Object.entries(postTypeLabels).slice(4).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => setFilterType(value)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* 发布框 */}
        {status === "authenticated" && (
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="p-4 flex gap-3">
              <img 
                src={session?.user?.name === "刘小排" ? "/avatars/刘小排.jpg" : session?.user?.image || "/default-avatar.svg"} 
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.svg'
                }}
              />
              <div className="flex-1">
                <Textarea
                  placeholder="分享你的想法..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[80px] resize-none border-gray-200 focus:border-[var(--c-primary-500)] focus:ring-1 focus:ring-[var(--c-primary-500)] rounded-lg"
                  onFocus={(e) => e.target.style.minHeight = "120px"}
                  onBlur={(e) => !content && (e.target.style.minHeight = "80px")}
                />
                
                {/* 展开的工具栏 */}
                {content && (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-[var(--c-primary-600)] text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        <span>话题标签</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-600 hover:text-[var(--c-primary-600)] text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>提到用户</span>
                      </button>
                      <select
                        value={postType}
                        onChange={(e) => setPostType(e.target.value as PostType)}
                        className="text-sm text-gray-600 border-0 focus:ring-0"
                      >
                        {Object.entries(postTypeLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">
                        支持 Markdown 格式
                      </div>
                      <Button 
                        onClick={handlePublish} 
                        disabled={publishing || !content.trim()}
                        className="bg-[var(--c-primary-600)] hover:bg-[var(--c-primary-700)] text-white px-6"
                      >
                        {publishing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            发布中...
                          </>
                        ) : (
                          "发布"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 未登录提示 */}
        {status === "unauthenticated" && (
          <div className="bg-white rounded-xl shadow-sm mb-6 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <button
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-lg text-gray-500 text-left hover:bg-gray-100 transition-colors"
                  onClick={() => window.location.href = '/login'}
                >
                  登录后即可发布动态...
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新帖提示 */}
        {showNewPostCount && newPostCount > 0 && (
          <div className="mb-4">
            <button 
              onClick={() => {
                fetchPosts()
                setShowNewPostCount(false)
                setNewPostCount(0)
              }}
              className="w-full py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium"
            >
              加载 {newPostCount} 条新帖子
            </button>
          </div>
        )}

        {/* 动态列表 */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={fetchPosts} 
              variant="outline" 
              className="text-cyan-600 border-cyan-600 hover:bg-cyan-50"
            >
              重试
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-900 text-lg mb-2 font-medium">暂无动态</p>
            <p className="text-gray-500">快来发布第一条动态吧！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
          </div>
          
          {/* 右侧边栏 - 固定定位 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 社区简介 - 渐变背景卡片 */}
            <div className="relative overflow-hidden rounded-2xl">
              {/* 渐变背景 */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--c-primary-500)] to-[var(--c-primary-700)]" />
              
              {/* 装饰波浪 */}
              <div className="absolute bottom-0 left-0 right-0 h-20">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
                  <path 
                    d="M0,60 C200,20 400,80 600,60 C800,40 1000,70 1200,60 L1200,120 L0,120 Z" 
                    fill="rgba(255, 255, 255, 0.1)"
                  />
                </svg>
              </div>
              
              {/* 内容 */}
              <div className="relative p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                    🌊
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">深海圈社区</h3>
                    <p className="text-sm text-white/80">deepsea.ai</p>
                  </div>
                </div>
                <p className="text-white/90 text-sm mb-6 leading-relaxed">
                  专注于海外AI产品开发的学习社区，助你从想法到商业变现的全流程实践。
                </p>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">1.5k</div>
                    <div className="text-xs text-white/70">成员</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">89</div>
                    <div className="text-xs text-white/70">在线</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">12</div>
                    <div className="text-xs text-white/70">新增</div>
                  </div>
                </div>
                <button className="w-full py-3 bg-white text-[var(--c-primary-700)] rounded-xl font-medium hover:bg-white/90 transition-colors">
                  邀请朋友加入
                </button>
              </div>
            </div>
            
            {/* 排行榜 - 增强设计 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">本月英雄榜</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">30天</span>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "刘小排", points: 935, avatar: "/avatars/刘小排.jpg", rank: 1, trend: "up", change: 12 },
                    { name: "张三", points: 893, avatar: "/avatars/user2.jpg", rank: 2, trend: "down", change: 3 },
                    { name: "李四", points: 754, avatar: "/avatars/user3.jpg", rank: 3, trend: "up", change: 5 },
                  ].map((user) => (
                    <div 
                      key={user.rank} 
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-gray-50 ${
                        user.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
                      }`}
                    >
                      {/* 排名 */}
                      <div className="relative">
                        {user.rank === 1 ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            👑
                          </div>
                        ) : user.rank === 2 ? (
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                            {user.rank}
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-white font-bold">
                            {user.rank}
                          </div>
                        )}
                      </div>
                      
                      {/* 头像 */}
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.svg'
                        }}
                      />
                      
                      {/* 信息 */}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {user.trend === 'up' ? (
                            <span className="text-green-600 flex items-center">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                              </svg>
                              {user.change}
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                              </svg>
                              {user.change}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* 积分 */}
                      <div className="text-right">
                        <div className="text-lg font-bold text-[var(--c-primary-700)]">
                          {user.points}
                        </div>
                        <div className="text-xs text-gray-500">积分</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t">
                <a href="#" className="text-sm text-[var(--c-primary-600)] hover:text-[var(--c-primary-700)] font-medium flex items-center justify-center gap-1">
                  查看完整排行榜
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* 热门话题 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">热门话题</h3>
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { tag: "ChatGPT应用", hot: true },
                  { tag: "AI绘画", hot: true },
                  { tag: "产品变现", hot: false },
                  { tag: "独立开发", hot: false },
                  { tag: "API集成", hot: false },
                  { tag: "用户增长", hot: true },
                  { tag: "出海经验", hot: false },
                  { tag: "技术栈选择", hot: false },
                ].map((topic) => (
                  <a
                    key={topic.tag}
                    href="#"
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      topic.hot 
                        ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic.hot && <span className="mr-1">🔥</span>}
                    #{topic.tag}
                  </a>
                ))}
              </div>
            </div>
            
            {/* 快速链接 - 简化设计 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">快速入口</h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="/courses" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-[var(--c-primary-100)] text-[var(--c-primary-600)] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">开始学习</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">优惠折扣</span>
                </a>
                <a href="#" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">项目灵感</span>
                </a>
                <a href="/faq" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">帮助中心</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}