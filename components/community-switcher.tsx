'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronDown, Plus, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

// 产品配置
const communities = [
  {
    id: 'ai-overseas',
    name: '海外AI产品',
    slug: 'ai',
    icon: '🤖',
    description: 'AI产品开发与变现',
    memberCount: 840,
  },
  {
    id: 'youtube-shorts',
    name: 'YouTube Shorts',
    slug: 'youtube',
    icon: '📹',
    description: '短视频创作与运营',
    memberCount: 0,
    comingSoon: true,
  },
  {
    id: 'bilibili',
    name: 'B站好物',
    slug: 'bilibili',
    icon: '🛍️',
    description: 'B站带货与推广',
    memberCount: 0,
    comingSoon: true,
  },
]

export function CommunitySwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  
  // 从URL中获取当前社区
  const currentCommunitySlug = pathname.split('/')[1] || 'ai'
  const currentCommunity = communities.find(c => c.slug === currentCommunitySlug) || communities[0]
  
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const handleCommunitySwitch = (community: typeof communities[0]) => {
    if (!community.comingSoon) {
      router.push(`/${community.slug}`)
      setOpen(false)
    }
  }
  
  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[260px] justify-between"
          aria-label="选择社区"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentCommunity.icon}</span>
            <span className="font-medium">{currentCommunity.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-[300px] p-0">
        {/* 搜索框 */}
        <div className="p-2 border-b">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-gray-100">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="搜索社区..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div>
        
        {/* 创建社区 */}
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
            disabled
          >
            <Plus className="h-4 w-4" />
            创建新社区
          </Button>
        </div>
        
        {/* 社区列表 */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          <p className="px-2 py-1.5 text-xs text-gray-500">我的社区</p>
          
          {filteredCommunities.map((community) => (
            <DropdownMenuItem
              key={community.id}
              className="p-2 cursor-pointer"
              onClick={() => handleCommunitySwitch(community)}
              disabled={community.comingSoon}
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{community.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{community.name}</span>
                    {community.comingSoon && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                        即将上线
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{community.description}</p>
                  {community.memberCount > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {community.memberCount} 位成员
                    </p>
                  )}
                </div>
                {currentCommunity.id === community.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}