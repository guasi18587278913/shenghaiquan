"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CommentItem } from "@/components/comment-item"
import { Heart, MessageCircle, Share2, ArrowLeft, Hash, Bookmark } from "lucide-react"
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

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = use(params)
  const [post, setPost] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState("")
  const [commenting, setCommenting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [bookmarked, setBookmarked] = useState(false)

  // 获取动态详情
  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
        setLiked(data.isLiked || false)
        setLikeCount(data._count?.likes || 0)
      }
    } catch (error) {
      console.error("获取动态详情失败:", error)
    }
  }

  // 获取评论列表
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${id}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      }
    } catch (error) {
      console.error("获取评论失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 检查收藏状态
  const checkBookmarkStatus = async () => {
    if (!session) return
    
    try {
      const response = await fetch(`/api/posts/${id}/bookmark`)
      if (response.ok) {
        const data = await response.json()
        setBookmarked(data.bookmarked)
      }
    } catch (error) {
      console.error("获取收藏状态失败:", error)
    }
  }

  useEffect(() => {
    fetchPost()
    fetchComments()
    checkBookmarkStatus()
  }, [id, session])

  // 点赞
  const handleLike = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikeCount(data.liked ? likeCount + 1 : likeCount - 1)
      }
    } catch (error) {
      console.error("点赞失败:", error)
    }
  }

  // 收藏/取消收藏
  const handleBookmark = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}/bookmark`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setBookmarked(data.bookmarked)
      }
    } catch (error) {
      console.error("收藏操作失败:", error)
    }
  }

  // 分享
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/feed/${id}`
    const shareTitle = post?.title || '深海圈动态'
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: post?.content?.substring(0, 100) + '...',
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

  // 发布评论
  const handleComment = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    if (!commentContent.trim()) return

    setCommenting(true)
    try {
      const response = await fetch(`/api/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: commentContent,
        }),
      })

      if (response.ok) {
        const newComment = await response.json()
        setComments([newComment, ...comments])
        setCommentContent("")
        if (post) {
          setPost({
            ...post,
            _count: {
              ...post._count,
              comments: (post._count?.comments || 0) + 1,
            },
          })
        }
      }
    } catch (error) {
      console.error("发布评论失败:", error)
    } finally {
      setCommenting(false)
    }
  }

  if (loading || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回
      </Button>

      {/* 动态详情 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                {post.user?.name?.[0] || "U"}
              </div>
              <div>
                <div className="font-medium text-lg">
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
          <div className="prose prose-lg max-w-none">
            <MarkdownViewer content={post.content} />
          </div>
          {post.tags && JSON.parse(post.tags).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
              {JSON.parse(post.tags).map((tag: string, index: number) => (
                <div key={index} className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Hash className="w-3 h-3" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-4 border-t pt-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleLike}
            className={liked ? "text-red-500" : ""}
          >
            <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="w-4 h-4 mr-1" />
            {post._count?.comments || 0}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBookmark}
            className={bookmarked ? "text-yellow-500" : ""}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* 评论输入框 */}
      {session && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {session.user.name?.[0] || "U"}
              </div>
              <div className="flex-1">
                <Textarea
                  placeholder="写下你的评论..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button 
                  className="mt-2"
                  onClick={handleComment}
                  disabled={commenting || !commentContent.trim()}
                >
                  {commenting ? "发布中..." : "发布评论"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 评论列表 */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">评论 ({comments.length})</h3>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无评论，来说点什么吧
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  postId={id}
                  onReplySuccess={fetchComments}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}