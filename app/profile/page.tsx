'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUpload } from '@/components/image-upload'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { LearningRecord } from '@/components/learning-record'
import { Loader2, User, Lock, Award, BookOpen, MessageSquare, Heart, Bookmark } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface UserProfile {
  id: string
  phone: string
  name: string | null
  avatar: string | null
  bio: string | null
  location: string | null
  company: string | null
  position: string | null
  skills: string[]
  createdAt: string
  stats: {
    posts: number
    courses: number
    likes: number
    comments: number
  }
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    bio: '',
    location: '',
    company: '',
    position: '',
    skills: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      
      const data = await response.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        avatar: data.avatar || '',
        bio: data.bio || '',
        location: data.location || '',
        company: data.company || '',
        position: data.position || '',
        skills: data.skills?.join(', ') || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    setLoadingBookmarks(true)
    try {
      const response = await fetch('/api/users/bookmarks')
      if (response.ok) {
        const data = await response.json()
        setBookmarks(data)
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error)
    } finally {
      setLoadingBookmarks(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        })
      })

      if (!response.ok) throw new Error('Failed to update profile')
      
      const updated = await response.json()
      setProfile(updated)
      alert('个人资料更新成功！')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('更新失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('两次输入的密码不一致')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to change password')
      }
      
      alert('密码修改成功！')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error changing password:', error)
      alert(error instanceof Error ? error.message : '修改失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-6">
        <p>无法加载个人资料</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">个人中心</h1>
        <p className="text-muted-foreground">管理您的个人信息和账户设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧个人信息卡片 */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile.avatar || ''} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{profile.name || '未设置昵称'}</h3>
                <p className="text-sm text-muted-foreground mt-1">{profile.phone}</p>
                {profile.position && profile.company && (
                  <p className="text-sm mt-2">{profile.position} @ {profile.company}</p>
                )}
                {profile.location && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.location}</p>
                )}
                <p className="text-sm text-muted-foreground mt-3">
                  加入于 {format(new Date(profile.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">发布动态</span>
                  <span className="font-medium">{profile.stats.posts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">学习课程</span>
                  <span className="font-medium">{profile.stats.courses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">获得点赞</span>
                  <span className="font-medium">{profile.stats.likes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">发表评论</span>
                  <span className="font-medium">{profile.stats.comments}</span>
                </div>
              </div>

              {profile.skills && profile.skills.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-2">技能标签</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧设置区域 */}
        <div className="lg:col-span-2">
          <Tabs 
            defaultValue="profile" 
            className="w-full"
            onValueChange={(value) => {
              if (value === 'bookmarks' && bookmarks.length === 0 && !loadingBookmarks) {
                fetchBookmarks()
              }
            }}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">个人资料</TabsTrigger>
              <TabsTrigger value="learning">学习记录</TabsTrigger>
              <TabsTrigger value="bookmarks">我的收藏</TabsTrigger>
              <TabsTrigger value="security">账户安全</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                  <CardDescription>更新您的个人资料信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label>头像</Label>
                      <ImageUpload
                        value={formData.avatar}
                        onChange={(url) => setFormData({ ...formData, avatar: url })}
                        type="avatar"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">昵称</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="请输入昵称"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">个人简介</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="介绍一下自己..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company">公司</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="所在公司"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="position">职位</Label>
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                          placeholder="职位名称"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">所在地</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="城市或地区"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="skills">技能标签</Label>
                      <Input
                        id="skills"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        placeholder="技能标签，用逗号分隔"
                      />
                      <p className="text-xs text-muted-foreground">例如：React, Node.js, AI产品设计</p>
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        '保存修改'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning">
              <Card>
                <CardHeader>
                  <CardTitle>学习记录</CardTitle>
                  <CardDescription>查看您的课程学习进度和成就</CardDescription>
                </CardHeader>
                <CardContent>
                  <LearningRecord />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookmarks">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5" />
                    我的收藏
                  </CardTitle>
                  <CardDescription>
                    您收藏的帖子和内容
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingBookmarks ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : bookmarks.length === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">还没有收藏任何内容</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => router.push('/feed')}
                      >
                        去动态页面看看
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookmarks.map((post) => (
                        <div
                          key={post.id}
                          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/feed/${post.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.user.avatar || ''} />
                                <AvatarFallback>{post.user.name?.[0] || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{post.user.name || '未设置昵称'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(post.createdAt), 'MM月dd日', { locale: zhCN })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <h3 className="font-medium mb-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {post._count.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post._count.likes}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>修改密码</CardTitle>
                  <CardDescription>定期更新密码以保护账户安全</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">当前密码</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="请输入当前密码"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新密码</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="请输入新密码"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">确认新密码</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="请再次输入新密码"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          修改中...
                        </>
                      ) : (
                        '修改密码'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}