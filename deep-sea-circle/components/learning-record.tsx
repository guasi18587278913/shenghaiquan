'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  PlayCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface CourseProgress {
  course: {
    id: string
    title: string
    category: string
    level: string
    totalChapters: number
  }
  enrollment: {
    enrolledAt: string
    completedAt: string | null
    progress: number
  }
  completedChapters: number
  totalWatchTime: number
  lastStudyAt: string
}

export function LearningRecord() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<CourseProgress[]>([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    currentStreak: 0
  })

  useEffect(() => {
    fetchLearningData()
  }, [])

  const fetchLearningData = async () => {
    try {
      const response = await fetch('/api/user/learning')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses || [])
        setStats(data.stats || {
          totalCourses: 0,
          completedCourses: 0,
          totalHours: 0,
          currentStreak: 0
        })
      }
    } catch (error) {
      console.error('获取学习记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-500'
      case 'INTERMEDIATE':
        return 'bg-blue-500'
      case 'ADVANCED':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 学习统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">报名课程</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-2xl font-bold">{stats.completedCourses}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">学习时长</p>
                <p className="text-2xl font-bold">{stats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">连续天数</p>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 课程列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">我的课程</h3>
        
        {courses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">还没有报名任何课程</p>
              <Button onClick={() => router.push('/courses')}>
                浏览课程
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map((item) => (
              <Card key={item.course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{item.course.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{item.course.totalChapters} 章节</span>
                        <span>已学习 {formatDuration(item.totalWatchTime)}</span>
                        <span>
                          报名于 {format(new Date(item.enrollment.enrolledAt), 'yyyy年MM月dd日', { locale: zhCN })}
                        </span>
                      </div>
                    </div>
                    <Badge className={getLevelColor(item.course.level)}>
                      {item.course.level === 'BEGINNER' && '初级'}
                      {item.course.level === 'INTERMEDIATE' && '中级'}
                      {item.course.level === 'ADVANCED' && '高级'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>完成进度</span>
                      <span className="font-medium">
                        {item.completedChapters} / {item.course.totalChapters} 章节
                      </span>
                    </div>
                    <Progress value={item.enrollment.progress} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {item.enrollment.progress}% 已完成
                      </span>
                      {item.enrollment.completedAt ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          已完成
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/courses/${item.course.id}`)
                          }}
                        >
                          <PlayCircle className="w-4 h-4 mr-1" />
                          继续学习
                        </Button>
                      )}
                    </div>
                  </div>

                  {item.lastStudyAt && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        最近学习：{format(new Date(item.lastStudyAt), 'MM月dd日 HH:mm', { locale: zhCN })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}