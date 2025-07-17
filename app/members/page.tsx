"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Clock, Star, Users, Circle, Code, Palette, Database, Globe } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

const skillIcons: Record<string, any> = {
  "Next.js": Code,
  "AI编程": Star,
  "产品设计": Palette,
  "Python": Code,
  "机器学习": Database,
  "前端开发": Globe,
  "UI设计": Palette,
  "全栈开发": Code,
}

interface Member {
  id: string
  name: string
  bio: string
  location?: string
  skills: string[]
  level: number
  points: number
  isOnline: boolean
  createdAt: Date
  role: string
  _count: {
    posts: number
    followers: number
    following: number
  }
}

export default function MembersPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  // 模拟获取成员数据
  const fetchMembers = async () => {
    try {
      const mockMembers: Member[] = [
        {
          id: "1",
          name: "刘小排",
          bio: "深海圈创始人，专注AI产品开发教育",
          location: "北京",
          skills: ["AI编程", "产品设计", "商业化"],
          level: 10,
          points: 9999,
          isOnline: true,
          createdAt: new Date("2024-01-01"),
          role: "ADMIN",
          _count: { posts: 156, followers: 1234, following: 89 },
        },
        {
          id: "2",
          name: "王老师",
          bio: "资深AI开发者，10年互联网经验",
          location: "上海",
          skills: ["Python", "机器学习", "全栈开发"],
          level: 8,
          points: 5678,
          isOnline: true,
          createdAt: new Date("2024-01-15"),
          role: "TEACHER",
          _count: { posts: 89, followers: 567, following: 123 },
        },
        {
          id: "3",
          name: "张三",
          bio: "AI编程爱好者，正在学习中",
          location: "深圳",
          skills: ["前端开发", "UI设计"],
          level: 3,
          points: 234,
          isOnline: false,
          createdAt: new Date("2024-11-01"),
          role: "USER",
          _count: { posts: 12, followers: 45, following: 78 },
        },
        {
          id: "4",
          name: "李四",
          bio: "产品经理转型AI开发",
          location: "杭州",
          skills: ["产品设计", "AI编程"],
          level: 5,
          points: 890,
          isOnline: true,
          createdAt: new Date("2024-10-15"),
          role: "USER",
          _count: { posts: 34, followers: 123, following: 56 },
        },
        {
          id: "5",
          name: "王五",
          bio: "全栈工程师，喜欢探索新技术",
          location: "成都",
          skills: ["Next.js", "Python", "全栈开发"],
          level: 6,
          points: 1234,
          isOnline: false,
          createdAt: new Date("2024-09-01"),
          role: "USER",
          _count: { posts: 56, followers: 234, following: 89 },
        },
      ]
      setMembers(mockMembers)
    } catch (error) {
      console.error("获取成员失败:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  // 获取所有技能标签
  const allSkills = Array.from(
    new Set(members.flatMap(member => member.skills))
  )

  // 过滤成员
  const filteredMembers = members.filter(member => {
    const matchSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       member.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (member.location?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    
    const matchFilter = filterType === "all" ||
                       (filterType === "online" && member.isOnline) ||
                       (filterType === "new" && new Date().getTime() - member.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000) ||
                       (filterType === "teacher" && ["ADMIN", "TEACHER"].includes(member.role))
    
    const matchSkills = selectedSkills.length === 0 ||
                       selectedSkills.some(skill => member.skills.includes(skill))
    
    return matchSearch && matchFilter && matchSkills
  })

  // 获取等级标签
  const getLevelBadge = (level: number) => {
    if (level >= 9) return { label: "大师", color: "bg-purple-500" }
    if (level >= 7) return { label: "专家", color: "bg-blue-500" }
    if (level >= 5) return { label: "进阶", color: "bg-green-500" }
    if (level >= 3) return { label: "入门", color: "bg-yellow-500" }
    return { label: "新手", color: "bg-gray-500" }
  }

  // 获取角色标签
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">创始人</Badge>
      case "TEACHER":
        return <Badge variant="default">导师</Badge>
      case "ASSISTANT":
        return <Badge variant="secondary">助教</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">加载中...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">通讯录</h1>
        <p className="text-muted-foreground">
          连接深海圈的每一位成员，找到志同道合的伙伴
        </p>
      </div>

      {/* 搜索和筛选栏 */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索成员姓名、简介或地区..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            全部成员
          </Button>
          <Button
            variant={filterType === "online" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("online")}
          >
            <Circle className="w-3 h-3 mr-1 fill-green-500 text-green-500" />
            在线成员
          </Button>
          <Button
            variant={filterType === "new" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("new")}
          >
            新成员
          </Button>
          <Button
            variant={filterType === "teacher" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType("teacher")}
          >
            导师/助教
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">技能筛选：</span>
          {allSkills.map(skill => (
            <Badge
              key={skill}
              variant={selectedSkills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                if (selectedSkills.includes(skill)) {
                  setSelectedSkills(selectedSkills.filter(s => s !== skill))
                } else {
                  setSelectedSkills([...selectedSkills, skill])
                }
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* 成员统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{members.length}</div>
            <div className="text-sm text-muted-foreground">总成员数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {members.filter(m => m.isOnline).length}
            </div>
            <div className="text-sm text-muted-foreground">在线成员</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {members.filter(m => new Date().getTime() - m.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000).length}
            </div>
            <div className="text-sm text-muted-foreground">本周新增</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {members.filter(m => ["ADMIN", "TEACHER"].includes(m.role)).length}
            </div>
            <div className="text-sm text-muted-foreground">导师团队</div>
          </CardContent>
        </Card>
      </div>

      {/* 成员列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            没有找到符合条件的成员
          </div>
        ) : (
          filteredMembers.map(member => {
            const levelInfo = getLevelBadge(member.level)
            
            return (
              <Card 
                key={member.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/members/${member.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold">
                          {member.name[0]}
                        </div>
                        {member.isOnline && (
                          <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{member.name}</h3>
                          {getRoleBadge(member.role)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {member.location && (
                            <>
                              <MapPin className="w-3 h-3" />
                              {member.location}
                            </>
                          )}
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(member.createdAt, {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </div>
                      </div>
                    </div>
                    <Badge className={`${levelInfo.color} text-white`}>
                      Lv.{member.level} {levelInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {member.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {member.skills.map(skill => {
                      const Icon = skillIcons[skill] || Code
                      return (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          <Icon className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      )
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex gap-3">
                      <span>{member._count.posts} 动态</span>
                      <span>{member._count.followers} 粉丝</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {member.points}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}