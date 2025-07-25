'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MemberInfoModal } from '@/components/member-info-modal'
import { useSearchParams } from 'next/navigation'
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Star, 
  MessageSquare,
  Clock,
  Users,
  GraduationCap,
  CheckCircle,
  X,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react'

// Tab类型
type TabType = 'members' | 'coaches' | 'online'

// 用户类型
interface User {
  id: number
  name: string
  avatar: string | null
  location: string
  company: string
  position: string
  bio: string | null
  skills: string[]
  online: boolean
  level: number
  points: number
  role: string
  createdAt: string
}

export default function MembersPage() {
  const searchParams = useSearchParams()
  const cityFromUrl = searchParams.get('city')
  
  const [activeTab, setActiveTab] = useState<TabType>('members')
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState(cityFromUrl || '')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<User | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [chatTarget, setChatTarget] = useState<User | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // 获取用户数据
  useEffect(() => {
    fetchUsers()
  }, [page, searchQuery, activeTab, cityFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        search: searchQuery
      })

      if (activeTab === 'online') {
        params.append('online', 'true')
      }
      
      if (cityFilter) {
        params.append('city', cityFilter)
      }

      const response = await fetch(`/api/users?${params}`)
      if (!response.ok) {
        throw new Error('获取用户列表失败')
      }

      const data = await response.json()
      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 根据Tab过滤用户
  const filteredUsers = useMemo(() => {
    let filtered = users

    // Tab过滤
    if (activeTab === 'coaches') {
      filtered = filtered.filter(user => 
        user.role === 'ADMIN' || user.role === 'ASSISTANT'
      )
    }

    return filtered
  }, [users, activeTab])

  // 获取Tab统计
  const tabStats = useMemo(() => {
    const onlineCount = users.filter(u => u.online).length
    const coachCount = users.filter(u => 
      u.role === 'ADMIN' || u.role === 'ASSISTANT'
    ).length

    return {
      members: total,
      coaches: activeTab === 'coaches' ? coachCount : users.filter(u => 
        u.role === 'ADMIN' || u.role === 'ASSISTANT'
      ).length,
      online: activeTab === 'online' ? onlineCount : users.filter(u => u.online).length
    }
  }, [users, total, activeTab])

  // 获取状态指示器
  const getStatusIndicator = (online: boolean) => {
    return online 
      ? { color: 'bg-green-500', text: '在线' }
      : { color: 'bg-gray-400', text: '离线' }
  }

  // 开始聊天
  const startChat = (member: User) => {
    setChatTarget(member)
    setShowChat(true)
  }

  // 格式化加入时间
  const formatJoinDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 格式化最后在线时间
  const formatLastSeen = (online: boolean) => {
    return online ? '现在在线' : '离线'
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">社区成员</h1>
          <p className="text-gray-600">连接全球优秀的AI产品开发者</p>
        </div>

        {/* Tab切换 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('members')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'members'
                    ? 'text-[#0891A1] border-[#0891A1]'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>会员</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tabStats.members}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('coaches')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'coaches'
                    ? 'text-[#0891A1] border-[#0891A1]'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>教练</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tabStats.coaches}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('online')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'online'
                    ? 'text-[#0891A1] border-[#0891A1]'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="absolute w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <span className="ml-3">在线</span>
                  <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                    {tabStats.online}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索成员..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
              />
            </div>
            
            {/* 城市筛选标签 */}
            {cityFilter && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">筛选城市:</span>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0891A1]/10 text-[#0891A1] rounded-full">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">{cityFilter}</span>
                  <button
                    onClick={() => {
                      setCityFilter('')
                      window.history.pushState({}, '', '/members')
                    }}
                    className="hover:bg-[#0891A1]/20 rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#0891A1] animate-spin" />
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* 成员列表 */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredUsers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* 头像 */}
                  <div className="relative">
                    <img
                      src={member.avatar || '/default-avatar.svg'}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedMember(member)}
                      onError={(e) => {
                        e.currentTarget.src = '/default-avatar.svg'
                      }}
                    />
                    {/* 状态指示器 */}
                    <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusIndicator(member.online).color} rounded-full border-2 border-white`} />
                  </div>

                  {/* 用户信息 */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            className="text-lg font-semibold text-gray-900 cursor-pointer hover:underline"
                            onClick={() => setSelectedMember(member)}
                          >
                            {member.name}
                          </h3>
                          {member.level >= 5 && (
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                          {(member.role === 'ADMIN' || member.role === 'ASSISTANT') && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              {member.role === 'ADMIN' ? '管理员' : '助教'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {member.position || member.role} {member.company && `@ ${member.company}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          加入于 {formatJoinDate(member.createdAt)} · {formatLastSeen(member.online)}
                        </p>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2">
                        {activeTab === 'online' && member.online && (
                          <button
                            onClick={() => startChat(member)}
                            className="px-4 py-2 bg-[#0891A1] text-white rounded-lg hover:bg-[#07788A] transition-colors flex items-center gap-2"
                          >
                            <MessageSquare className="w-4 h-4" />
                            聊天
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>

                    {/* 简介 */}
                    {member.bio && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{member.bio}</p>
                    )}

                    {/* 技能标签 */}
                    {member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {member.skills.slice(0, 3).map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="px-2 py-1 text-gray-400 text-xs">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 统计信息 */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {member.location || '未知位置'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {member.points} 积分
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        Lv.{member.level}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无符合条件的成员</p>
          </div>
        )}

        {/* 分页 */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <span className="px-4 py-2 text-gray-600">
              第 {page} / {totalPages} 页
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* 成员详情模态框 */}
      {selectedMember && (
        <MemberInfoModal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          memberName={selectedMember.name}
          memberData={{
            avatar: selectedMember.avatar || '/default-avatar.svg',
            role: selectedMember.position || selectedMember.role,
            title: selectedMember.company || '深海圈成员',
            location: selectedMember.location || '未知位置',
            joinDate: formatJoinDate(selectedMember.createdAt),
            bio: selectedMember.bio || '这个人很神秘，什么都没有留下。',
            skills: selectedMember.skills,
            followers: 0,
            following: 0,
            projects: 0,
            verified: selectedMember.level >= 5,
            status: selectedMember.online ? 'online' : 'offline'
          }}
          size="large"
        />
      )}

      {/* 聊天窗口 */}
      <AnimatePresence>
        {showChat && chatTarget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl z-50"
          >
            {/* 聊天头部 */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <img
                  src={chatTarget.avatar || '/default-avatar.svg'}
                  alt={chatTarget.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.svg'
                  }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{chatTarget.name}</h3>
                  <p className="text-xs text-gray-500">{getStatusIndicator(chatTarget.online).text}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* 聊天内容区 */}
            <div className="h-96 p-4 overflow-y-auto bg-gray-50">
              <div className="text-center text-sm text-gray-500 mb-4">
                与 {chatTarget.name} 开始对话
              </div>
              {/* 这里可以添加聊天消息 */}
            </div>

            {/* 输入区域 */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入消息..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0891A1] focus:border-transparent"
                />
                <button className="p-2 bg-[#0891A1] text-white rounded-lg hover:bg-[#07788A] transition-colors">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}