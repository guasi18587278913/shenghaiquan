"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Share2, Hash, Bookmark } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { PostType } from "@prisma/client"
import { MarkdownViewer } from "@/components/markdown-viewer"

const postTypeLabels: Record<PostType, string> = {
  ANNOUNCEMENT: "公告通知",
  PROJECT: "项目展示",
  TECH_DISCUSSION: "技术讨论",
  EXPERIENCE: "经验分享",
  HELP: "求助问答",
  ACTIVITY: "线下活动",
  GENERAL: "综合讨论",
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
  
  // 解析标签
  const tags = post.tags ? JSON.parse(post.tags) : []

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
    router.push(`/feed/${post.id}`)
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

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/feed/${post.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {post.user?.name?.[0] || "U"}
            </div>
            <div>
              <div className="font-medium">
                {post.user?.name || "匿名用户"}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </div>
            </div>
          </div>
          <Badge variant="secondary">
            {postTypeLabels[post.type as PostType]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none line-clamp-6">
          <MarkdownViewer content={post.content} />
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((tag: string, index: number) => (
              <div key={index} className="flex items-center gap-1 text-sm text-muted-foreground">
                <Hash className="w-3 h-3" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLike}
          className={liked ? "text-red-500" : ""}
        >
          <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
          {likeCount}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleComment}>
          <MessageCircle className="w-4 h-4 mr-1" />
          {post._count?.comments || 0}
        </Button>
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}