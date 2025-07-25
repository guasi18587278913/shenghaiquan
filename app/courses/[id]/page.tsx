"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, Clock, Lock, CheckCircle, PlayCircle, Timer, Calendar } from "lucide-react"
import { CourseCategory, CourseLevel, UnlockType } from "@prisma/client"

const categoryLabels: Record<CourseCategory, string> = {
  START_HERE: "入门指南",
  BASIC: "基础课程",
  ADVANCED: "进阶课程",
}

const levelLabels: Record<CourseLevel, string> = {
  BEGINNER: "初级",
  INTERMEDIATE: "中级",
  ADVANCED: "高级",
}

const unlockTypeLabels: Record<UnlockType, string> = {
  SEQUENTIAL: "顺序解锁",
  TIME_BASED: "定时解锁",
  TASK_BASED: "任务解锁",
  PAID: "付费解锁",
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const router = useRouter()
  const { id } = use(params)
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<any>(null)

  // 获取课程详情
  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      } else {
        router.push("/courses")
      }
    } catch (error) {
      console.error("获取课程详情失败:", error)
      router.push("/courses")
    } finally {
      setLoading(false)
    }
  }

  // 获取学习进度
  const fetchProgress = async () => {
    if (!session) return
    
    try {
      const response = await fetch(`/api/courses/${id}/progress`)
      if (response.ok) {
        const data = await response.json()
        setProgress(data)
      }
    } catch (error) {
      console.error("获取学习进度失败:", error)
    }
  }

  useEffect(() => {
    fetchCourse()
  }, [id])

  useEffect(() => {
    if (course?.isEnrolled && session) {
      fetchProgress()
    }
  }, [course?.isEnrolled, session])

  // 报名课程
  const handleEnroll = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/courses/${id}/enroll`, {
        method: "POST",
      })

      if (response.ok) {
        await fetchCourse() // 重新获取课程信息
        alert("报名成功！")
      } else {
        const error = await response.json()
        alert(error.error || "报名失败")
      }
    } catch (error) {
      alert("报名失败，请稍后重试")
    }
  }

  // 进入章节学习
  const handleStartChapter = (chapterId: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      alert("该章节尚未解锁")
      return
    }

    if (!course.isEnrolled) {
      alert("请先报名课程")
      return
    }

    router.push(`/courses/${id}/chapters/${chapterId}`)
  }

  // 获取下一个未完成的章节
  const getNextChapter = () => {
    if (!progress?.chapters) return null
    
    return progress.chapters.find((ch: any) => !ch.isCompleted && course.chapters.find((c: any) => c.id === ch.id)?.isUnlocked)
  }

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  if (loading || !course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 返回按钮 */}
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回课程列表
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：课程信息 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">
                  {categoryLabels[course.category as CourseCategory]}
                </Badge>
                <Badge variant="outline">
                  {levelLabels[course.level as CourseLevel]}
                </Badge>
                {course.isPaid && (
                  <Badge variant="default">
                    ¥{course.price}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {course.chapters.length} 章节
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(course.chapters.reduce((acc: number, ch: any) => acc + (ch.duration || 0), 0) / 60)} 分钟
                </div>
                <div>
                  {course._count.enrollments} 人已报名
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 章节列表 */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">课程章节</h2>
            <div className="space-y-3">
              {course.chapters.map((chapter: any) => (
                <Card 
                  key={chapter.id}
                  className={`cursor-pointer transition-all ${
                    chapter.isUnlocked 
                      ? "hover:shadow-md" 
                      : "opacity-60"
                  }`}
                  onClick={() => handleStartChapter(chapter.id, chapter.isUnlocked)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">
                            第 {chapter.order} 章
                          </span>
                          {progress?.chapters?.find((ch: any) => ch.id === chapter.id)?.isCompleted && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {!chapter.isUnlocked && (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <h3 className="font-medium">{chapter.title}</h3>
                        {chapter.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {chapter.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {chapter.duration && (
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(chapter.duration / 60)} 分钟
                          </span>
                        )}
                        {chapter.isUnlocked && (
                          <PlayCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：操作区域 */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>课程进度</CardTitle>
            </CardHeader>
            <CardContent>
              {course.isEnrolled ? (
                <div className="space-y-4">
                  {progress && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>完成进度</span>
                          <span className="font-medium">
                            {progress.progress.completedChapters} / {progress.progress.totalChapters}
                          </span>
                        </div>
                        <Progress value={progress.progress.percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          已完成 {progress.progress.percentage}%
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            学习时长
                          </span>
                          <span className="font-medium">
                            {formatDuration(progress.progress.totalWatchTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            报名时间
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(progress.enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => {
                      const nextChapter = getNextChapter()
                      if (nextChapter) {
                        router.push(`/courses/${id}/chapters/${nextChapter.id}`)
                      } else if (progress?.progress.percentage === 100) {
                        alert("恭喜！您已完成全部课程")
                      } else {
                        // 从第一章开始
                        const firstChapter = course.chapters.find((ch: any) => ch.isUnlocked)
                        if (firstChapter) {
                          router.push(`/courses/${id}/chapters/${firstChapter.id}`)
                        }
                      }
                    }}
                  >
                    {progress?.progress.percentage === 100 ? "复习课程" : "继续学习"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    报名后即可开始学习全部课程内容
                  </p>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleEnroll}
                  >
                    {course.isPaid ? `购买课程 ¥${course.price}` : "免费报名"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}