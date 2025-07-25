'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  Users, 
  Star,
  Flame,
  Zap,
  Crown,
  Target,
  ChevronRight,
  Clock,
  Calendar,
  Infinity,
  Lock,
  Unlock,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  BookOpen,
  Code,
  Rocket
} from 'lucide-react'

// 等级系统配置
const levelSystem = [
  { level: 1, name: 'Bit', minPoints: 0, icon: '🌱', description: '新手课程 66% 完成', color: 'from-gray-400 to-gray-600' },
  { level: 2, name: 'Byte', minPoints: 100, icon: '🌿', description: 'AI 工具与折扣 · Lv2 付费机会、免费会员赠送', color: 'from-green-400 to-green-600' },
  { level: 3, name: 'Kilobyte', minPoints: 500, icon: '🌳', description: 'Lv3 付费机会', color: 'from-blue-400 to-blue-600' },
  { level: 4, name: 'Megabyte', minPoints: 1000, icon: '💎', description: 'Lv4 付费机会', color: 'from-purple-400 to-purple-600' },
  { level: 5, name: 'Gigabyte', minPoints: 2000, icon: '🔥', description: 'Lv5 付费机会', color: 'from-orange-400 to-orange-600' },
  { level: 6, name: 'Terabyte', minPoints: 5000, icon: '⚡', description: '青铜徽章（2个月免费会员资格）', color: 'from-yellow-400 to-yellow-600' },
  { level: 7, name: 'Petabyte', minPoints: 10000, icon: '🥈', description: '银徽章', color: 'from-gray-300 to-gray-500' },
  { level: 8, name: 'Exabyte', minPoints: 20000, icon: '🥇', description: '金徽章', color: 'from-yellow-300 to-yellow-500' },
  { level: 9, name: 'Zettabyte', minPoints: 50000, icon: '👑', description: '机器人金徽章', color: 'from-yellow-400 to-orange-500' }
]

// 模拟用户数据
const mockUsers = [
  { id: 1, name: '刘小排', avatar: '/avatars/刘小排.jpg', points: 3732, level: 8, rank: 1, weeklyPoints: 523, monthlyPoints: 1892, badges: ['🔥', '💎', '🏆'] },
  { id: 2, name: '张三', avatar: '/avatars/user2.jpg', points: 3377, level: 7, rank: 2, weeklyPoints: 213, monthlyPoints: 1013, badges: ['⚡', '🌟'] },
  { id: 3, name: 'Emily Chen', avatar: '/avatars/user3.jpg', points: 3100, level: 7, rank: 3, weeklyPoints: 152, monthlyPoints: 952, badges: ['💎', '🎯'] },
  { id: 4, name: '李四', avatar: '/avatars/user4.jpg', points: 2456, level: 6, rank: 4, weeklyPoints: 189, monthlyPoints: 678, badges: ['🌟'] },
  { id: 5, name: '王五', avatar: '/avatars/user5.jpg', points: 1890, level: 5, rank: 5, weeklyPoints: 267, monthlyPoints: 890, badges: ['🔥'] },
  { id: 6, name: '赵六', avatar: '/avatars/user6.jpg', points: 1234, level: 4, rank: 6, weeklyPoints: 98, monthlyPoints: 456, badges: [] },
  { id: 7, name: '孙七', avatar: '/avatars/user7.jpg', points: 987, level: 3, rank: 7, weeklyPoints: 76, monthlyPoints: 234, badges: [] },
  { id: 8, name: '周八', avatar: '/avatars/user8.jpg', points: 678, level: 3, rank: 8, weeklyPoints: 45, monthlyPoints: 178, badges: [] },
  { id: 9, name: '吴九', avatar: '/avatars/user9.jpg', points: 456, level: 2, rank: 9, weeklyPoints: 34, monthlyPoints: 123, badges: [] },
  { id: 10, name: '郑十', avatar: '/avatars/user10.jpg', points: 234, level: 2, rank: 10, weeklyPoints: 23, monthlyPoints: 89, badges: [] }
]

// 积分获取方式
const pointsWays = [
  { icon: BookOpen, action: '完成课程', points: '+50', color: 'text-blue-600' },
  { icon: MessageCircle, action: '发布动态', points: '+10', color: 'text-green-600' },
  { icon: Heart, action: '获得点赞', points: '+2', color: 'text-red-600' },
  { icon: Share2, action: '分享内容', points: '+5', color: 'text-purple-600' },
  { icon: Code, action: '提交项目', points: '+100', color: 'text-orange-600' },
  { icon: Users, action: '邀请好友', points: '+30', color: 'text-cyan-600' }
]

type TimeRange = '7day' | '30day' | 'alltime'

export default function LeaderboardsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7day')
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)

  // 根据时间范围获取排行榜数据
  const getLeaderboardData = () => {
    switch (timeRange) {
      case '7day':
        return [...mockUsers].sort((a, b) => b.weeklyPoints - a.weeklyPoints)
      case '30day':
        return [...mockUsers].sort((a, b) => b.monthlyPoints - a.monthlyPoints)
      case 'alltime':
      default:
        return [...mockUsers].sort((a, b) => b.points - a.points)
    }
  }

  const leaderboardData = getLeaderboardData()

  // 获取当前用户等级信息
  const getCurrentLevel = (points: number) => {
    for (let i = levelSystem.length - 1; i >= 0; i--) {
      if (points >= levelSystem[i].minPoints) {
        return levelSystem[i]
      }
    }
    return levelSystem[0]
  }

  // 计算到下一等级的进度
  const getProgressToNextLevel = (points: number) => {
    const currentLevel = getCurrentLevel(points)
    const currentLevelIndex = levelSystem.findIndex(l => l.level === currentLevel.level)
    
    if (currentLevelIndex === levelSystem.length - 1) {
      return 100 // 已达到最高等级
    }
    
    const nextLevel = levelSystem[currentLevelIndex + 1]
    const progress = ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    
    return Math.min(progress, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">深海圈积分榜</h1>
            <Trophy className="w-10 h-10 text-yellow-500" />
          </motion.div>
          <p className="text-gray-600">努力学习，成为深海探索者！</p>
        </div>

        {/* 等级系统展示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            等级系统
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levelSystem.map((level, index) => {
              const isLocked = index > 2 // 模拟部分等级锁定
              
              return (
                <motion.div
                  key={level.level}
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isLocked 
                      ? 'border-gray-200 bg-gray-50 opacity-60' 
                      : 'border-gray-200 hover:border-[#0891A1] bg-white'
                  }`}
                  onClick={() => !isLocked && setSelectedLevel(level.level)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl`}>
                        {level.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Level {level.level} - {level.name}</h3>
                        <p className="text-sm text-gray-500">{level.minPoints.toLocaleString()} 积分起</p>
                      </div>
                    </div>
                    {isLocked ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Unlock className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {level.description}
                  </p>
                  
                  {/* 当前等级的成员数 */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {Math.floor(Math.random() * 20 + 5)}% 的成员达到此等级
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* 时间范围选择 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setTimeRange('7day')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === '7day'
                  ? 'bg-[#0891A1] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                7天榜
              </div>
            </button>
            <button
              onClick={() => setTimeRange('30day')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === '30day'
                  ? 'bg-[#0891A1] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                30天榜
              </div>
            </button>
            <button
              onClick={() => setTimeRange('alltime')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                timeRange === 'alltime'
                  ? 'bg-[#0891A1] text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Infinity className="w-4 h-4" />
                总榜
              </div>
            </button>
          </div>
        </div>

        {/* 排行榜 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 前三名特殊展示 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">排行榜 TOP 10</h3>
              
              {/* TOP 3 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {leaderboardData.slice(0, 3).map((user, index) => {
                  const level = getCurrentLevel(user.points)
                  const medals = ['🥇', '🥈', '🥉']
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative text-center p-4 rounded-xl ${
                        index === 0 ? 'bg-gradient-to-b from-yellow-50 to-yellow-100' :
                        index === 1 ? 'bg-gradient-to-b from-gray-50 to-gray-100' :
                        'bg-gradient-to-b from-orange-50 to-orange-100'
                      }`}
                    >
                      <div className="text-3xl mb-2">{medals[index]}</div>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full mx-auto mb-2 border-4 border-white shadow-md"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.svg'
                        }}
                      />
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{level.name}</p>
                      <p className="text-lg font-bold text-[#0891A1]">
                        {timeRange === '7day' ? user.weeklyPoints :
                         timeRange === '30day' ? user.monthlyPoints :
                         user.points}
                      </p>
                      <div className="flex justify-center gap-1 mt-2">
                        {user.badges.map((badge, i) => (
                          <span key={i} className="text-sm">{badge}</span>
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* 4-10名 */}
              <div className="space-y-3">
                {leaderboardData.slice(3, 10).map((user, index) => {
                  const level = getCurrentLevel(user.points)
                  const displayPoints = timeRange === '7day' ? user.weeklyPoints :
                                       timeRange === '30day' ? user.monthlyPoints :
                                       user.points
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (index + 3) * 0.05 }}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 text-center font-bold text-gray-500">
                        #{index + 4}
                      </div>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = '/default-avatar.svg'
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{level.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#0891A1]">+{displayPoints}</p>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#0891A1] to-[#00A8CC]"
                            style={{ width: `${getProgressToNextLevel(user.points)}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 积分获取方式 */}
          <div className="space-y-6">
            {/* 我的排名 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#0891A1] to-[#00A8CC] rounded-2xl p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-4">我的排名</h3>
              <div className="flex items-center gap-4">
                <img
                  src="/avatars/刘小排.jpg"
                  alt="我"
                  className="w-16 h-16 rounded-full border-4 border-white/30"
                  onError={(e) => {
                    e.currentTarget.src = '/default-avatar.svg'
                  }}
                />
                <div className="flex-1">
                  <p className="text-2xl font-bold">#1</p>
                  <p className="text-white/80">Level 8 - Exabyte</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">3,732</p>
                  <p className="text-sm text-white/80">总积分</p>
                </div>
              </div>
            </motion.div>

            {/* 如何获得积分 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">如何获得积分</h3>
              <div className="space-y-3">
                {pointsWays.map((way, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${way.color}`}>
                        <way.icon className="w-5 h-5" />
                      </div>
                      <span className="text-gray-700">{way.action}</span>
                    </div>
                    <span className="font-bold text-green-600">{way.points}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 成就徽章 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">成就徽章</h3>
              <div className="grid grid-cols-3 gap-3">
                {['🏆', '🔥', '⚡', '💎', '🌟', '🎯'].map((badge, index) => (
                  <div 
                    key={index}
                    className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-3xl hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}