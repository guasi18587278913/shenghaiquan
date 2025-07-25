"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Pin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { PostType } from "@prisma/client"
import { MarkdownViewer } from "@/components/markdown-viewer"
import { getUserByName } from "@/lib/sample-users"
import { PostDetailModal } from "@/components/post-detail-modal"
import { MemberInfoModal } from "@/components/member-info-modal"

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

interface PostCardProps {
  post: any
  onLikeUpdate?: (postId: string, liked: boolean, likeCount: number) => void
}

export function PostCard({ post, onLikeUpdate }: PostCardProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [liked, setLiked] = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0)
  const [liking, setLiking] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showMemberInfo, setShowMemberInfo] = useState(false)
  
  // 解析标签
  const tags = post.tags ? JSON.parse(post.tags) : []
  
  // 获取用户数据（演示用）
  const userData = post.user?.name ? getUserByName(post.user.name) : null

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!session) {
      router.push("/login")
      return
    }

    if (liking) return
    setLiking(true)

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikeCount(data.liked ? likeCount + 1 : likeCount - 1)
        onLikeUpdate?.(post.id, data.liked, data.liked ? likeCount + 1 : likeCount - 1)
      }
    } catch (error) {
      console.error("点赞失败:", error)
    } finally {
      setLiking(false)
    }
  }

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDetailModal(true)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const shareUrl = `${window.location.origin}/feed/${post.id}`
    const shareTitle = post.title || '深海圈动态'
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: post.content?.substring(0, 100) + '...',
          url: shareUrl
        })
      } catch (error) {
        console.log('分享取消或失败')
      }
    } else {
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('链接已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
      }
    }
  }

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setBookmarked(!bookmarked)
    // TODO: 实现收藏功能的 API 调用
  }

  return (
    <>
      <div className="bg-white transition-all duration-200 p-6 cursor-pointer hover:shadow-md hover:-translate-y-0.5 relative group"
           onClick={() => setShowDetailModal(true)}>
      <div className="flex gap-4">
        {/* 用户头像 */}
        <img 
          src={userData?.image || post.user?.image || "/default-avatar.svg"} 
          alt={post.user?.name || "用户"}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            setShowMemberInfo(true)
          }}
          onError={(e) => {
            e.currentTarget.src = '/default-avatar.svg'
          }}
        />
        
        <div className="flex-1 min-w-0">
          {/* 头部信息 */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="font-medium text-gray-900 hover:underline cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMemberInfo(true)
                }}
              >
                {post.user?.name || "匿名用户"}
              </span>
              {(userData?.verified || post.user?.verified) && (
                <span className="text-cyan-600">✓</span>
              )}
              <span className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
              {post.type !== "GENERAL" && (
                <span className="text-xs text-[var(--c-primary-600)] bg-[var(--c-primary-50)] px-2.5 py-1 rounded-full font-medium">
                  {postTypeIcons[post.type as PostType]} {postTypeLabels[post.type as PostType]}
                </span>
              )}
            </div>
            
            {/* 更多操作按钮 */}
            <button 
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                // TODO: 显示更多操作菜单
              }}
            >
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          
          {/* 内容 */}
          <div className="prose prose-sm max-w-none mb-3">
            <div className="text-gray-900 whitespace-pre-wrap break-words line-clamp-6">
              {post.content}
            </div>
          </div>
          
          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag: string, index: number) => (
                <span 
                  key={index} 
                  className="text-sm text-cyan-600 hover:text-cyan-700 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: 点击标签进行筛选
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* 交互按钮 */}
          <div className="flex items-center gap-1 -ml-2">
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                liked 
                  ? "text-red-500 bg-red-50 hover:bg-red-100" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              {likeCount > 0 && (
                <span className="text-sm font-medium">{likeCount}</span>
              )}
            </button>
            
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
              onClick={handleComment}
            >
              <MessageCircle className="w-4 h-4" />
              {post._count?.comments > 0 && (
                <span className="text-sm font-medium">{post._count.comments}</span>
              )}
            </button>
            
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <div className="flex-1" />
            
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                bookmarked 
                  ? "text-[var(--c-accent-500)] bg-[var(--c-accent-50)]" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              onClick={handleBookmark}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
      
      {/* 置顶标识 */}
      {post.isPinned && (
        <div className="absolute top-4 right-4 flex items-center gap-1 text-sm text-cyan-600">
          <Pin className="w-4 h-4" />
          <span>已置顶</span>
        </div>
      )}
    </div>
    
    {/* 帖子详情模态框 */}
    <PostDetailModal 
      post={post}
      isOpen={showDetailModal}
      onClose={() => setShowDetailModal(false)}
    />
    
    {/* 成员信息弹窗 */}
    <MemberInfoModal
      isOpen={showMemberInfo}
      onClose={() => setShowMemberInfo(false)}
      memberName={post.user?.name || "匿名用户"}
      memberData={{
        avatar: userData?.image || post.user?.image,
        verified: userData?.verified || post.user?.verified,
        role: post.user?.role || "AI开发者",
        location: "北京",
        joinDate: post.user?.createdAt ? formatDistanceToNow(new Date(post.user.createdAt), {
          addSuffix: false,
          locale: zhCN,
        }) + "前" : "2023年3月15日"
      }}
    />
    </>
  )
}