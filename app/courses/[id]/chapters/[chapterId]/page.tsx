"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ContentProtection } from "@/components/content-protection"
import { Watermark } from "@/components/watermark"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, Clock, Timer, PlayCircle } from "lucide-react"
import { MarkdownViewer } from "@/components/markdown-viewer"

export default function ChapterPage({ 
  params 
}: { 
  params: { id: string; chapterId: string } 
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [chapter, setChapter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<any>(null)
  const [course, setCourse] = useState<any>(null)
  const [watchTime, setWatchTime] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)

  // 获取章节数据
  const fetchChapter = async () => {
    try {
      // 获取课程信息
      const courseResponse = await fetch(`/api/courses/${params.id}`)
      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        setCourse(courseData)
        
        // 查找当前章节
        const currentChapter = courseData.chapters.find((ch: any) => ch.id === params.chapterId)
        if (currentChapter) {
          setChapter(currentChapter)
        } else {
          router.push(`/courses/${params.id}`)
        }
      }

      // 获取章节进度
      const progressResponse = await fetch(`/api/chapters/${params.chapterId}/progress`)
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        setProgress(progressData.progress)
        setWatchTime(progressData.progress.watchTime || 0)
      }
    } catch (error) {
      console.error("获取章节数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  // 更新学习进度
  const updateProgress = async (data: any) => {
    try {
      await fetch(`/api/chapters/${params.chapterId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("更新进度失败:", error)
    }
  }

  // 标记完成
  const handleComplete = async () => {
    await updateProgress({
      isCompleted: true,
      watchTime: watchTime + (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0)
    })
    
    alert("恭喜完成本章学习！")
    
    // 跳转到下一章或返回课程页
    const currentIndex = course.chapters.findIndex((ch: any) => ch.id === params.chapterId)
    if (currentIndex < course.chapters.length - 1) {
      const nextChapter = course.chapters[currentIndex + 1]
      router.push(`/courses/${params.id}/chapters/${nextChapter.id}`)
    } else {
      router.push(`/courses/${params.id}`)
    }
  }

  useEffect(() => {
    if (session) {
      fetchChapter()
    }
  }, [params.chapterId, session])

  // 记录学习时长
  useEffect(() => {
    setStartTime(Date.now())
    
    const interval = setInterval(() => {
      if (startTime) {
        const currentWatchTime = watchTime + Math.floor((Date.now() - startTime) / 1000)
        // 每30秒更新一次进度
        if (currentWatchTime % 30 === 0) {
          updateProgress({ watchTime: currentWatchTime })
        }
      }
    }, 1000)

    // 页面卸载时保存进度
    return () => {
      clearInterval(interval)
      if (startTime) {
        const finalWatchTime = watchTime + Math.floor((Date.now() - startTime) / 1000)
        updateProgress({ watchTime: finalWatchTime })
      }
    }
  }, [startTime])

  if (!session) {
    router.push("/login")
    return null
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <>
      {/* 水印层 */}
      <Watermark />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 返回按钮 */}
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => router.push(`/courses/${params.id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回课程
        </Button>

        {/* 章节内容 */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    第 {chapter.order} 章
                  </p>
                  <CardTitle className="text-2xl">{chapter.title}</CardTitle>
                </div>
                {progress?.isCompleted && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    已完成
                  </Badge>
                )}
              </div>
              
              {/* 学习统计 */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  预计时长：{Math.floor((chapter.duration || 600) / 60)} 分钟
                </div>
                <div className="flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  已学习：{Math.floor((watchTime + (startTime ? (Date.now() - startTime) / 1000 : 0)) / 60)} 分钟
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 内容保护容器 */}
            <ContentProtection
              disableSelect={true}
              disableCopy={true}
              disableRightClick={true}
              disablePrint={true}
            >
              <div className="prose prose-lg max-w-none">
                {chapter.content ? (
                  <MarkdownViewer content={chapter.content} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>章节内容正在准备中...</p>
                  </div>
                )}
              </div>
            </ContentProtection>

            {/* 章节导航 */}
            <div className="mt-8 flex justify-between items-center">
              {course && (
                <>
                  {(() => {
                    const currentIndex = course.chapters.findIndex((ch: any) => ch.id === params.chapterId)
                    const prevChapter = currentIndex > 0 ? course.chapters[currentIndex - 1] : null
                    const nextChapter = currentIndex < course.chapters.length - 1 ? course.chapters[currentIndex + 1] : null
                    
                    return (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => prevChapter && router.push(`/courses/${params.id}/chapters/${prevChapter.id}`)}
                          disabled={!prevChapter}
                        >
                          上一章
                        </Button>
                        
                        <Button
                          onClick={handleComplete}
                          disabled={progress?.isCompleted}
                        >
                          {progress?.isCompleted ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              已完成学习
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              标记为已完成
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          variant="outline"
                          onClick={() => nextChapter && router.push(`/courses/${params.id}/chapters/${nextChapter.id}`)}
                          disabled={!nextChapter}
                        >
                          下一章
                        </Button>
                      </>
                    )
                  })()}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 版权提示 */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>本内容受版权保护，仅供个人学习使用</p>
          <p>禁止复制、截图或以任何形式传播</p>
        </div>
      </div>
    </>
  )
}