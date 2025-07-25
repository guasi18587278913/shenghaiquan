'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  UserPlus,
  CheckCircle,
  Briefcase,
  Code,
  Heart,
  Eye,
  Send
} from 'lucide-react'
import { getUserByName } from '@/lib/sample-users'

interface MemberInfoModalProps {
  isOpen: boolean
  onClose: () => void
  memberName: string
  memberData?: {
    avatar?: string
    role?: string
    title?: string
    location?: string
    joinDate?: string
    bio?: string
    skills?: string[]
    followers?: number
    following?: number
    projects?: number
    verified?: boolean
    status?: 'online' | 'busy' | 'offline'
  }
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  size?: 'small' | 'medium' | 'large'
}

export function MemberInfoModal({ 
  isOpen, 
  onClose, 
  memberName,
  memberData,
  position = 'center',
  size = 'medium'
}: MemberInfoModalProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (memberName && isOpen) {
      fetchUserData()
    }
  }, [memberName, isOpen])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/by-name?name=${encodeURIComponent(memberName)}`)
      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getModalSize = () => {
    switch (size) {
      case 'small':
        return 'max-w-sm'
      case 'large':
        return 'max-w-2xl'
      default:
        return 'max-w-md'
    }
  }

  const getModalPosition = () => {
    switch (position) {
      case 'top':
        return 'items-start pt-20'
      case 'bottom':
        return 'items-end pb-20'
      case 'left':
        return 'items-center justify-start pl-20'
      case 'right':
        return 'items-center justify-end pr-20'
      default:
        return 'items-center justify-center'
    }
  }

  // 优先使用从API获取的 userData，memberData作为备选
  const avatar = userData?.avatar || memberData?.avatar || null
  const role = userData?.position || memberData?.role || '深海圈成员'
  const title = userData?.company || memberData?.title || '深海圈'
  const location = userData?.location || memberData?.location || '中国'
  const joinDate = userData?.joinDate || memberData?.joinDate || '2023年'
  const bio = userData?.bio || memberData?.bio || '这位同学还没有填写个人简介'
  const skills = userData?.skills || memberData?.skills || ['深海圈成员']
  const followers = userData?.followers ?? memberData?.followers ?? 0
  const following = userData?.following ?? memberData?.following ?? 0
  const projects = userData?.projects ?? memberData?.projects ?? 0
  const verified = userData?.verified ?? memberData?.verified ?? false
  const status = userData?.status || memberData?.status || 'offline'

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'busy':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed inset-0 z-50 flex ${getModalPosition()} p-4 pointer-events-none`}
          >
            <div className={`bg-white rounded-xl shadow-2xl ${getModalSize()} w-full pointer-events-auto`}>
              {loading ? (
                // 加载状态
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0891A1] mx-auto mb-4"></div>
                    <p className="text-gray-500">加载用户信息...</p>
                  </div>
                </div>
              ) : (
                <>
              {/* 头部 */}
              <div className="relative p-6 pb-0">
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* 用户信息 */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={memberName}
                        className="w-20 h-20 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`w-20 h-20 bg-gradient-to-br from-[#0891A1] to-[#00A8CC] rounded-full flex items-center justify-center text-white text-2xl font-bold ${avatar ? 'hidden' : ''}`}>
                      {memberName[0]}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-white`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-900">{memberName}</h2>
                      {verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-600">{role} · {title}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        加入于 {joinDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 个人简介 */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">个人简介</h3>
                  <p className="text-sm text-gray-600">{bio}</p>
                </div>

                {/* 技能标签 */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">技能专长</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 成就徽章 */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">成就徽章</h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-[#0891A1]/10 text-[#0891A1] rounded-full text-sm font-medium">
                      技术达人
                    </span>
                    <span className="px-3 py-1 bg-[#0891A1]/10 text-[#0891A1] rounded-full text-sm font-medium">
                      活跃贡献者
                    </span>
                  </div>
                </div>
              </div>

              {/* 统计数据 */}
              <div className="grid grid-cols-3 gap-4 p-6 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{followers}</p>
                  <p className="text-sm text-gray-600">关注者</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{following}</p>
                  <p className="text-sm text-gray-600">关注中</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{projects}</p>
                  <p className="text-sm text-gray-600">项目</p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-[#0891A1] text-white hover:bg-[#07788A]'
                  }`}
                >
                  {isFollowing ? '已关注' : '关注'}
                </button>
                <button className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  发送消息
                </button>
              </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}