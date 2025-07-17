'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Search, Loader2, X } from 'lucide-react'
import { debounce } from 'lodash'

interface QuickResult {
  type: 'post' | 'user' | 'tag'
  id: string
  title: string
  subtitle?: string
}

interface SearchBoxProps {
  className?: string
  placeholder?: string
  compact?: boolean
}

export function SearchBox({ 
  className = '', 
  placeholder = '搜索...',
  compact = false 
}: SearchBoxProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quickResults, setQuickResults] = useState<QuickResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // 快速搜索
  const performQuickSearch = async (q: string) => {
    if (!q.trim()) {
      setQuickResults([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (response.ok) {
        const data = await response.json()
        const results: QuickResult[] = []
        
        // 添加前3个动态
        data.posts.slice(0, 3).forEach((post: any) => {
          results.push({
            type: 'post',
            id: post.id,
            title: post.content.substring(0, 50) + (post.content.length > 50 ? '...' : ''),
            subtitle: post.user?.name || '匿名用户'
          })
        })
        
        // 添加前2个用户
        data.users.slice(0, 2).forEach((user: any) => {
          results.push({
            type: 'user',
            id: user.id,
            title: user.name || '未设置昵称',
            subtitle: user.bio?.substring(0, 30) + (user.bio?.length > 30 ? '...' : '')
          })
        })
        
        // 添加前2个标签
        data.tags.slice(0, 2).forEach((tag: any) => {
          results.push({
            type: 'tag',
            id: tag.id,
            title: `#${tag.name}`,
            subtitle: `${tag.postCount} 篇动态`
          })
        })
        
        setQuickResults(results)
      }
    } catch (error) {
      console.error('快速搜索失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 防抖搜索
  const debouncedQuickSearch = debounce(performQuickSearch, 300)

  useEffect(() => {
    if (query) {
      debouncedQuickSearch(query)
    } else {
      setQuickResults([])
    }
  }, [query])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleResultClick = (result: QuickResult) => {
    setIsOpen(false)
    setQuery('')
    
    switch (result.type) {
      case 'post':
        router.push(`/feed/${result.id}`)
        break
      case 'user':
        router.push(`/profile/${result.id}`)
        break
      case 'tag':
        router.push(`/search?q=${encodeURIComponent(result.title.substring(1))}&tab=posts`)
        break
    }
  }

  const handleClear = () => {
    setQuery('')
    setQuickResults([])
    inputRef.current?.focus()
  }

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push('/search')}
        className={className}
      >
        <Search className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <form onSubmit={handleSearch} className={`relative ${className}`}>
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pr-20"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-10 top-0 h-full"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>
      </PopoverTrigger>
      
      {(quickResults.length > 0 || query) && (
        <PopoverContent className="w-full p-0" align="start">
          {quickResults.length > 0 ? (
            <div className="max-h-[400px] overflow-y-auto">
              {quickResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b last:border-0"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                      {result.type === 'post' && '动态'}
                      {result.type === 'user' && '用户'}
                      {result.type === 'tag' && '标签'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <button
                className="w-full px-4 py-3 text-center text-sm text-primary hover:bg-muted transition-colors"
                onClick={handleSearch}
              >
                查看全部搜索结果
              </button>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              输入关键词搜索动态、用户或标签
            </div>
          )}
        </PopoverContent>
      )}
    </Popover>
  )
}