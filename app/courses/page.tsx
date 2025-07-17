"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { BookOpen, Clock, Users } from "lucide-react"
import { CourseCategory, CourseLevel } from "@prisma/client"

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

export default function CoursesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  // 获取课程列表
  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (levelFilter !== "all") params.append("level", levelFilter)

      const response = await fetch(`/api/courses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("获取课程失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [categoryFilter, levelFilter])

  // 报名课程
  const handleEnroll = async (courseId: string) => {
    if (!session) {
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      })

      if (response.ok) {
        // 更新本地状态
        setCourses(courses.map(course => 
          course.id === courseId 
            ? { ...course, isEnrolled: true, _count: { ...course._count, enrollments: course._count.enrollments + 1 } }
            : course
        ))
        alert("报名成功！")
      } else {
        const error = await response.json()
        alert(error.error || "报名失败")
      }
    } catch (error) {
      alert("报名失败，请稍后重试")
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">课程中心</h1>
        <p className="text-muted-foreground">
          系统化学习AI产品开发，从入门到精通
        </p>
      </div>

      {/* 筛选栏 */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">分类：</span>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-32"
          >
            <option value="all">全部分类</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">难度：</span>
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-32"
          >
            <option value="all">全部难度</option>
            {Object.entries(levelLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 课程列表 */}
      {loading ? (
        <div className="text-center py-8">加载中...</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          暂无课程
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                {course.cover && (
                  <div className="w-full h-48 bg-muted rounded-md mb-4" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">
                    {categoryLabels[course.category as CourseCategory]}
                  </Badge>
                  <Badge variant="outline">
                    {levelLabels[course.level as CourseLevel]}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {course._count.chapters} 章节
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course._count.enrollments} 人学习
                  </div>
                  {course.isPaid && (
                    <div className="flex items-center gap-1">
                      ¥{course.price}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {course.isEnrolled ? (
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    继续学习
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => handleEnroll(course.id)}
                  >
                    {course.isPaid ? `购买课程 ¥${course.price}` : "免费报名"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}