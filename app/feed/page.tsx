"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { PostCard } from "@/components/post-card"
import { PostType } from "@prisma/client"
import { MarkdownEditor } from "@/components/markdown-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hash, Type, FileText } from "lucide-react"

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
  const { data: session } = useSession()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [content, setContent] = useState("")
  const [postType, setPostType] = useState<PostType>("GENERAL")
  const [filterType, setFilterType] = useState("all")
  const [tags, setTags] = useState("")
  const [editorMode, setEditorMode] = useState<"simple" | "markdown">("simple")

  // 获取动态列表
  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?type=${filterType}`)
      const data = await response.json()
      if (response.ok) {
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("获取动态失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [filterType])

  // 发布动态
  const handlePublish = async () => {
    if (!session) {
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 发布框 */}
      {session && (
        <Card className="mb-8">
          <CardHeader>
            <Tabs value={editorMode} onValueChange={(v) => setEditorMode(v as "simple" | "markdown")}>
              <TabsList className="mb-4">
                <TabsTrigger value="simple" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  简单模式
                </TabsTrigger>
                <TabsTrigger value="markdown" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Markdown
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="simple" className="mt-0">
                <Textarea
                  placeholder="分享你的想法..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[150px]"
                />
              </TabsContent>
              
              <TabsContent value="markdown" className="mt-0">
                <MarkdownEditor
                  value={content}
                  onChange={(value) => setContent(value || "")}
                  height={200}
                />
              </TabsContent>
            </Tabs>
            
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">话题标签</span>
              </div>
              <Textarea
                placeholder="添加标签，用逗号分隔，如：AI产品，创业，技术分享"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="min-h-[50px]"
              />
            </div>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <Select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="w-40"
            >
              {Object.entries(postTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? "发布中..." : "发布"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* 筛选栏 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={filterType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterType("all")}
        >
          全部
        </Button>
        {Object.entries(postTypeLabels).map(([value, label]) => (
          <Button
            key={value}
            variant={filterType === value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* 动态列表 */}
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无动态
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}