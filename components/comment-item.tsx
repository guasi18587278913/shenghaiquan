"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Heart, MessageCircle } from "lucide-react"

interface CommentItemProps {
  comment: any
  postId: string
  onReplySuccess?: () => void
}

export function CommentItem({ comment, postId, onReplySuccess }: CommentItemProps) {
  const { data: session } = useSession()
  const [showReply, setShowReply] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [replying, setReplying] = useState(false)

  const handleReply = async () => {
    if (!session || !replyContent.trim()) return

    setReplying(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: replyContent,
          parentId: comment.id,
        }),
      })

      if (response.ok) {
        setReplyContent("")
        setShowReply(false)
        onReplySuccess?.()
      }
    } catch (error) {
      console.error("回复失败:", error)
    } finally {
      setReplying(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">
          {comment.user?.name?.[0] || "U"}
        </div>
        <div className="flex-1">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{comment.user?.name || "匿名用户"}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="flex gap-2 mt-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              <Heart className="w-3 h-3 mr-1" />
              {comment._count?.likes || 0}
            </Button>
            {session && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => setShowReply(!showReply)}
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                回复
              </Button>
            )}
          </div>
          
          {/* 回复框 */}
          {showReply && session && (
            <div className="mt-2 ml-8">
              <Textarea
                placeholder="写下你的回复..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm"
                  onClick={handleReply}
                  disabled={replying || !replyContent.trim()}
                >
                  {replying ? "发送中..." : "发送"}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowReply(false)}
                >
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 子评论 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-2 space-y-2">
              {comment.replies.map((reply: any) => (
                <div key={reply.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                    {reply.user?.name?.[0] || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted/30 rounded-lg p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-xs">{reply.user?.name || "匿名用户"}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.createdAt), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}