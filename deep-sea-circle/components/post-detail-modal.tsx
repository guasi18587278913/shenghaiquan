"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { PostType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getUserByName } from "@/lib/sample-users"

const postTypeLabels: Record<PostType, string> = {
  ANNOUNCEMENT: "公告通知",
  PROJECT: "项目展示", 
  TECH_DISCUSSION: "技术讨论",
  EXPERIENCE: "经验分享",
  HELP: "求助问答",
  ACTIVITY: "线下活动",
  GENERAL: "综合讨论",
}

const postTypeIcons: Record<PostType, string> = {
  ANNOUNCEMENT: "📢",
  PROJECT: "🚀",
  TECH_DISCUSSION: "💻",
  EXPERIENCE: "💡",
  HELP: "❓",
  ACTIVITY: "🎉",
  GENERAL: "💬",
}

interface PostDetailModalProps {
  post: any
  isOpen: boolean
  onClose: () => void
}

export function PostDetailModal({ post, isOpen, onClose }: PostDetailModalProps) {
  const { data: session } = useSession()
  const [liked, setLiked] = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0)
  const [bookmarked, setBookmarked] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  
  // 获取用户数据
  const userData = post.user?.name ? getUserByName(post.user.name) : null
  const tags = post.tags ? JSON.parse(post.tags) : []

  // 阻止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // 加载评论
  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, post.id])

  const loadComments = async () => {
    setLoadingComments(true)
    try {
      // 模拟加载评论
      setComments([
        {
          id: 1,
          content: "这个分享太棒了！学到了很多。",
          user: { name: "张三", image: "/avatars/user2.jpg" },
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          likes: 5
        },
        {
          id: 2,
          content: "请问有相关的代码仓库吗？想深入学习一下。",
          user: { name: "李四", image: "/avatars/user3.jpg" },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          likes: 2
        }
      ])
    } catch (error) {
      console.error("加载评论失败:", error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleLike = async () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    
    // 模拟发送评论
    const newComment = {
      id: Date.now(),
      content: commentText,
      user: { 
        name: session?.user?.name || "匿名用户", 
        image: session?.user?.image || "/default-avatar.svg" 
      },
      createdAt: new Date(),
      likes: 0
    }
    
    setComments([newComment, ...comments])
    setCommentText("")
  }

  if (!isOpen) return null

  return (
    <>
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={userData?.image || post.user?.image || "/default-avatar.svg"} 
                    alt={post.user?.name || "用户"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{post.user?.name || "匿名用户"}</span>
                      {(userData?.verified || post.user?.verified) && (
                        <span className="text-[var(--c-primary-600)]">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(post.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </span>
                      {post.type !== "GENERAL" && (
                        <span className="text-xs text-[var(--c-primary-600)] bg-[var(--c-primary-50)] px-2 py-0.5 rounded-full">
                          {postTypeIcons[post.type as PostType]} {postTypeLabels[post.type as PostType]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            {/* 内容区 */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {/* 帖子内容 */}
              <div className="prose prose-sm max-w-none mb-4">
                <div className="text-gray-900 whitespace-pre-wrap break-words">
                  {post.content}
                </div>
              </div>
              
              {/* 标签 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag: string, index: number) => (
                    <span 
                      key={index} 
                      className="text-sm text-[var(--c-primary-600)] hover:text-[var(--c-primary-700)] cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 统计数据 */}
              {post.stats && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                  {Object.entries(post.stats).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{key}</span>
                      <span className="font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 交互按钮 */}
              <div className="flex items-center gap-2 py-3 border-y">
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    liked 
                      ? "text-red-500 bg-red-50 hover:bg-red-100" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={handleLike}
                >
                  <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                  <span className="font-medium">{likeCount}</span>
                </button>
                
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{comments.length}</span>
                </button>
                
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  <span>分享</span>
                </button>
                
                <div className="flex-1" />
                
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    bookmarked 
                      ? "text-[var(--c-accent-500)] bg-[var(--c-accent-50)]" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setBookmarked(!bookmarked)}
                >
                  <Bookmark className={`w-5 h-5 ${bookmarked ? "fill-current" : ""}`} />
                </button>
              </div>
              
              {/* 评论区 */}
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-4">评论 ({comments.length})</h3>
                
                {/* 发表评论 */}
                {session && (
                  <div className="flex gap-3 mb-6">
                    <img 
                      src={session.user?.image || "/default-avatar.svg"} 
                      alt="我的头像"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <Textarea
                        placeholder="写下你的评论..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          onClick={handleComment}
                          disabled={!commentText.trim()}
                          className="bg-[var(--c-primary-600)] hover:bg-[var(--c-primary-700)]"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          发送
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 评论列表 */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img 
                        src={comment.user.image || "/default-avatar.svg"} 
                        alt={comment.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{comment.user.name}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <button className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {comment.likes > 0 && <span>{comment.likes}</span>}
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            回复
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 底部跳转按钮 */}
            <div className="sticky bottom-0 bg-white rounded-b-2xl border-t px-6 py-3">
              <button className="w-full text-center text-sm text-[var(--c-primary-600)] hover:text-[var(--c-primary-700)] font-medium">
                ↓ 跳转到最新评论
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}