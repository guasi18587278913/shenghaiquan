'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { PostCard } from '@/components/post-card'
import { 
  Search, 
  Loader2, 
  FileText, 
  Users, 
  Hash,
  Calendar,
  MapPin,
  Briefcase
} from 'lucide-react'
import { debounce } from 'lodash'

interface SearchResults {
  posts: any[]
  users: any[]
  tags: any[]
  total: {
    posts: number
    users: number
    tags: number
  }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''
  const initialTab = searchParams.get('tab') || 'all'
  
  const [query, setQuery] = useState(initialQuery)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults>({
    posts: [],
    users: [],
    tags: [],
    total: { posts: 0, users: 0, tags: 0 }
  })

  // 执行搜索
  const performSearch = async (q: string) => {
    if (!q.trim()) {
      setResults({
        posts: [],
        users: [],
        tags: [],
        total: { posts: 0, users: 0, tags: 0 }
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      }
    } catch (error) {
      console.error('搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((q: string) => {
      setSearchQuery(q)
      router.push(`/search?q=${encodeURIComponent(q)}&tab=${activeTab}`)
    }, 500),
    [activeTab]
  )

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery)
    }
  }, [searchQuery])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${tab}`)
  }

  const handleTagClick = (tag: string) => {
    setQuery(tag)
    setSearchQuery(tag)
    router.push(`/search?q=${encodeURIComponent(tag)}&tab=posts`)
  }

  const totalResults = results.total.posts + results.total.users + results.total.tags

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        {/* 搜索框 */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={handleInputChange}
              placeholder="搜索动态、用户、标签..."
              className="pl-10 pr-4 h-12 text-lg"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin" />
            )}
          </div>
          {searchQuery && !loading && (
            <p className="mt-2 text-sm text-muted-foreground">
              找到 {totalResults} 个关于 &ldquo;{searchQuery}&rdquo; 的结果
            </p>
          )}
        </div>

        {/* 搜索结果 */}
        {searchQuery && (
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                全部 {totalResults > 0 && `(${totalResults})`}
              </TabsTrigger>
              <TabsTrigger value="posts">
                动态 {results.total.posts > 0 && `(${results.total.posts})`}
              </TabsTrigger>
              <TabsTrigger value="users">
                用户 {results.total.users > 0 && `(${results.total.users})`}
              </TabsTrigger>
              <TabsTrigger value="tags">
                标签 {results.total.tags > 0 && `(${results.total.tags})`}
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* 全部结果 */}
              <TabsContent value="all" className="space-y-6">
                {/* 动态 */}
                {results.posts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      动态
                    </h3>
                    <div className="space-y-4">
                      {results.posts.slice(0, 3).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                    {results.posts.length > 3 && (
                      <Button
                        variant="link"
                        className="mt-4"
                        onClick={() => handleTabChange('posts')}
                      >
                        查看全部 {results.total.posts} 条动态
                      </Button>
                    )}
                  </div>
                )}

                {/* 用户 */}
                {results.users.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      用户
                    </h3>
                    <div className="grid gap-4">
                      {results.users.slice(0, 3).map((user) => (
                        <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="flex items-center gap-4 p-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium">{user.name || '未设置昵称'}</h4>
                              {user.bio && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {user.bio}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                {user.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {user.location}
                                  </span>
                                )}
                                {user.company && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {user.company}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    {results.users.length > 3 && (
                      <Button
                        variant="link"
                        className="mt-4"
                        onClick={() => handleTabChange('users')}
                      >
                        查看全部 {results.total.users} 位用户
                      </Button>
                    )}
                  </div>
                )}

                {/* 标签 */}
                {results.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Hash className="h-5 w-5" />
                      标签
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {results.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleTagClick(tag.name)}
                        >
                          <Hash className="h-3 w-3 mr-1" />
                          {tag.name}
                          <span className="ml-2 text-xs opacity-60">
                            {tag.postCount}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {totalResults === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    没有找到相关内容
                  </div>
                )}
              </TabsContent>

              {/* 动态标签页 */}
              <TabsContent value="posts">
                {results.posts.length > 0 ? (
                  <div className="space-y-4">
                    {results.posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    没有找到相关动态
                  </div>
                )}
              </TabsContent>

              {/* 用户标签页 */}
              <TabsContent value="users">
                {results.users.length > 0 ? (
                  <div className="grid gap-4">
                    {results.users.map((user) => (
                      <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 p-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{user.name || '未设置昵称'}</h4>
                            {user.bio && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {user.bio}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {user.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {user.location}
                                </span>
                              )}
                              {user.company && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {user.company}
                                </span>
                              )}
                            </div>
                            {user.skills && JSON.parse(user.skills).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {JSON.parse(user.skills).slice(0, 5).map((skill: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    没有找到相关用户
                  </div>
                )}
              </TabsContent>

              {/* 标签标签页 */}
              <TabsContent value="tags">
                {results.tags.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.tags.map((tag) => (
                      <Card
                        key={tag.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleTagClick(tag.name)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Hash className="h-5 w-5 text-muted-foreground" />
                              <h4 className="font-medium">{tag.name}</h4>
                            </div>
                            <Badge variant="secondary">
                              {tag.postCount} 篇动态
                            </Badge>
                          </div>
                          {tag.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {tag.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    没有找到相关标签
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}

        {/* 热门搜索 */}
        {!searchQuery && (
          <div>
            <h3 className="text-lg font-semibold mb-4">热门搜索</h3>
            <div className="flex flex-wrap gap-2">
              {['AI产品', 'Next.js', '创业', '技术分享', 'React', '产品设计'].map((term) => (
                <Badge
                  key={term}
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => {
                    setQuery(term)
                    setSearchQuery(term)
                  }}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0891A1]" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}