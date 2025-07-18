'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  BookOpen,
  Heart,
  MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface UserProfile {
  id: string
  name: string | null
  avatar: string | null
  bio: string | null
  location: string | null
  company: string | null
  position: string | null
  skills: string[]
  createdAt: string
  _count: {
    posts: number
    followers: number
    following: number
  }
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [id])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/users/${id}`)
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        router.push('/404')
      }
    } catch (error) {
      console.error('获取用户资料失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 用户信息卡片 */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback className="text-2xl">
                  {user.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{user.name || '未设置昵称'}</h2>
              {user.position && user.company && (
                <p className="text-sm text-muted-foreground mt-1">
                  {user.position} @ {user.company}
                </p>
              )}
            </div>

            {user.bio && (
              <p className="text-sm mt-4 text-center">{user.bio}</p>
            )}

            <div className="space-y-2 mt-6">
              {user.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.company && !user.position && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{user.company}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(new Date(user.createdAt), 'yyyy年MM月dd日', { locale: zhCN })} 加入
                </span>
              </div>
            </div>

            {user.skills && user.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">技能标签</h3>
                <div className="flex flex-wrap gap-1">
                  {user.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-semibold">{user._count.posts}</div>
                <div className="text-xs text-muted-foreground">动态</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{user._count.followers}</div>
                <div className="text-xs text-muted-foreground">粉丝</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">{user._count.following}</div>
                <div className="text-xs text-muted-foreground">关注</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 内容区域 */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">最近动态</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                暂无动态
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">学习记录</h3>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                暂无学习记录
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}