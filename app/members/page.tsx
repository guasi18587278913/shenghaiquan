'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MemberInfoModal } from '@/components/member-info-modal'
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  Star, 
  Mail, 
  MessageCircle,
  Calendar,
  TrendingUp,
  Award,
  Users,
  Eye,
  UserPlus,
  ChevronDown,
  X,
  Sparkles,
  Zap,
  Heart,
  Share2,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Clock,
  BarChart3,
  Target,
  Rocket,
  Code,
  Palette,
  Megaphone,
  Cpu,
  Shield,
  Waves,
  Map,
  MessageSquare,
  Send,
  GraduationCap,
  CheckCircle
} from 'lucide-react'

// 技能图标映射
const skillIcons: { [key: string]: any } = {
  'AI开发': Cpu,
  '产品设计': Palette,
  '全栈开发': Code,
  '市场营销': Megaphone,
  '数据分析': BarChart3,
  '安全专家': Shield,
  'UI/UX': Target,
  '项目管理': Briefcase
}

// 模拟成员数据
const mockMembers = [
  {
    id: 1,
    name: '刘小排',
    avatar: '/avatars/刘小排.jpg',
    role: '深海圈创始人',
    title: 'AI产品专家',
    location: '上海',
    joinTime: '2023-01',
    joinDate: '2023年1月6日',
    level: 'expert',
    verified: true,
    isCoach: true,
    skills: ['AI开发', '产品设计', '全栈开发'],
    projects: 12,
    followers: 3456,
    following: 234,
    bio: '专注于AI产品开发和出海业务，帮助开发者实现技术变现。深海圈创始人，多年海外产品经验。',
    achievements: ['金牌导师', '千粉达人', '优质创作者'],
    recentActivity: '刚刚发布了新的AI产品开发教程',
    matchScore: 95,
    status: 'online',
    lastSeen: '现在在线',
    socialLinks: {
      github: 'liuxiaopai',
      twitter: 'liuxiaopai',
      linkedin: 'liuxiaopai'
    }
  },
  {
    id: 2,
    name: '张三',
    avatar: '/avatars/user2.jpg',
    role: 'AI工程师',
    title: '深度学习专家',
    location: '北京',
    joinTime: '2023-03',
    joinDate: '2023年3月15日',
    level: 'senior',
    verified: true,
    isCoach: false,
    skills: ['AI开发', '数据分析', 'Python'],
    projects: 8,
    followers: 1234,
    following: 156,
    bio: '专注于深度学习和计算机视觉，在AI领域有5年以上经验。',
    achievements: ['技术达人', '活跃贡献者'],
    recentActivity: '完成了图像识别项目',
    matchScore: 88,
    status: 'online',
    lastSeen: '现在在线'
  },
  {
    id: 3,
    name: 'Emily Chen',
    avatar: '/avatars/user3.jpg',
    role: '产品经理',
    title: '海外产品专家',
    location: '旧金山',
    joinTime: '2023-02',
    joinDate: '2023年2月8日',
    level: 'expert',
    verified: true,
    isCoach: true,
    skills: ['产品设计', '市场营销', '数据分析'],
    projects: 10,
    followers: 4567,
    following: 345,
    bio: '硅谷产品经理，专注于AI SaaS产品的全球化战略。',
    achievements: ['金牌导师', '海外专家', '千粉达人'],
    recentActivity: '分享了出海产品方法论',
    matchScore: 96,
    status: 'busy',
    lastSeen: '5分钟前'
  },
  {
    id: 4,
    name: '李四',
    avatar: '/avatars/user4.jpg',
    role: '全栈开发',
    title: 'React专家',
    location: '深圳',
    joinTime: '2023-05',
    joinDate: '2023年5月20日',
    level: 'intermediate',
    verified: false,
    isCoach: false,
    skills: ['全栈开发', 'React', 'Node.js'],
    projects: 6,
    followers: 876,
    following: 234,
    bio: '热爱开源，专注于React生态系统和现代前端开发。',
    achievements: ['开源贡献者'],
    recentActivity: '参与了开源项目',
    matchScore: 76,
    status: 'offline',
    lastSeen: '2小时前'
  },
  {
    id: 5,
    name: '王五',
    avatar: '/avatars/user5.jpg',
    role: 'UI/UX设计师',
    title: '交互设计专家',
    location: '杭州',
    joinTime: '2023-06',
    joinDate: '2023年6月10日',
    level: 'senior',
    verified: true,
    isCoach: true,
    skills: ['UI/UX', '产品设计', 'Figma'],
    projects: 15,
    followers: 2341,
    following: 432,
    bio: '10年设计经验，专注于AI产品的用户体验设计。',
    achievements: ['设计大师', '优质创作者'],
    recentActivity: '发布了新的设计系统',
    matchScore: 92,
    status: 'online',
    lastSeen: '现在在线'
  },
  {
    id: 6,
    name: '赵六',
    avatar: '/avatars/user6.jpg',
    role: '数据科学家',
    title: 'ML工程师',
    location: '成都',
    joinTime: '2023-07',
    joinDate: '2023年7月1日',
    level: 'intermediate',
    verified: false,
    isCoach: false,
    skills: ['数据分析', 'AI开发', 'Python'],
    projects: 5,
    followers: 567,
    following: 123,
    bio: '专注于机器学习和数据挖掘，有丰富的算法实战经验。',
    achievements: ['数据达人'],
    recentActivity: '完成了推荐系统优化',
    matchScore: 72,
    status: 'offline',
    lastSeen: '昨天'
  }
]

// Tab类型
type TabType = 'members' | 'coaches' | 'online'

export default function MembersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('members')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<typeof mockMembers[0] | null>(null)
  const [showChat, setShowChat] = useState(false)
  const [chatTarget, setChatTarget] = useState<typeof mockMembers[0] | null>(null)

  // 根据Tab过滤成员
  const filteredMembers = useMemo(() => {
    let filtered = mockMembers

    // Tab过滤
    if (activeTab === 'coaches') {
      filtered = filtered.filter(member => member.isCoach)
    } else if (activeTab === 'online') {
      filtered = filtered.filter(member => member.status === 'online')
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(member => 
        member.name.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.title.toLowerCase().includes(query) ||
        member.bio.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [activeTab, searchQuery])

  // 获取Tab统计
  const tabStats = useMemo(() => ({
    members: mockMembers.length,
    coaches: mockMembers.filter(m => m.isCoach).length,
    online: mockMembers.filter(m => m.status === 'online').length
  }), [])

  // 获取状态指示器
  const getStatusIndicator = (status: string) => {
    const indicators = {
      online: { color: 'bg-green-500', text: '在线' },
      busy: { color: 'bg-yellow-500', text: '忙碌' },
      offline: { color: 'bg-gray-400', text: '离线' }
    }
    return indicators[status as keyof typeof indicators] || indicators.offline
  }

  // 开始聊天
  const startChat = (member: typeof mockMembers[0]) => {
    setChatTarget(member)
    setShowChat(true)
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
          </div>
        </div>

        {/* 成员列表 */}
        <div className="space-y-4">
          {filteredMembers.map((member, index) => (
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
                    src={member.avatar}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedMember(member)}
                    onError={(e) => {
                      e.currentTarget.src = '/default-avatar.svg'
                    }}
                  />
                  {/* 状态指示器 */}
                  <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusIndicator(member.status).color} rounded-full border-2 border-white`} />
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
                        {member.verified && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                        {member.isCoach && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            教练
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        加入于 {member.joinDate} · {member.lastSeen}
                      </p>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                      {activeTab === 'online' && (
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
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{member.bio}</p>

                  {/* 技能标签 */}
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

                  {/* 统计信息 */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {member.followers} 关注者
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {member.projects} 项目
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {member.recentActivity}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 空状态 */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">暂无符合条件的成员</p>
          </div>
        )}
      </div>

      {/* 成员详情模态框 - 使用通用组件 */}
      {selectedMember && (
        <MemberInfoModal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          memberName={selectedMember.name}
          memberData={{
            avatar: selectedMember.avatar,
            role: selectedMember.role,
            title: selectedMember.title,
            location: selectedMember.location,
            joinDate: selectedMember.joinDate,
            bio: selectedMember.bio,
            skills: selectedMember.skills,
            followers: selectedMember.followers,
            following: selectedMember.following,
            projects: selectedMember.projects,
            verified: selectedMember.verified,
            status: selectedMember.status
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
                  src={chatTarget.avatar}
                  alt={chatTarget.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.svg'
                  }}
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{chatTarget.name}</h3>
                  <p className="text-xs text-gray-500">{getStatusIndicator(chatTarget.status).text}</p>
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