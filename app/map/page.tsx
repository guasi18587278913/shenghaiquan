'use client'

import { useState, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Users, 
  Activity, 
  TrendingUp,
  Globe,
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Clock,
  Eye,
  BarChart3,
  Waves,
  Anchor,
  Menu
} from 'lucide-react'
import { CreateMeetupModal } from '@/components/create-meetup-modal'
import { MemberInfoModal } from '@/components/member-info-modal'

// 动态导入 ECharts 组件（避免 SSR 问题）
const ChinaMap = dynamic(() => import('./ChinaMap'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-gray-400">加载地图中...</div>
    </div>
  )
})

import type { CityData } from './ChinaMap'

// 中国城市数据（包含经纬度和在线状态）
const chinaCityData = [
  { id: 1, name: '北京', value: [116.4074, 39.9042, 156], memberCount: 156, activeCount: 89, level: 'high' as const, hasOnline: true },
  { id: 2, name: '上海', value: [121.4737, 31.2304, 134], memberCount: 134, activeCount: 76, level: 'high' as const, hasOnline: true },
  { id: 3, name: '深圳', value: [114.0579, 22.5431, 98], memberCount: 98, activeCount: 67, level: 'high' as const, hasOnline: true },
  { id: 4, name: '广州', value: [113.2644, 23.1291, 89], memberCount: 89, activeCount: 52, level: 'high' as const, hasOnline: false },
  { id: 5, name: '杭州', value: [120.1551, 30.2741, 78], memberCount: 78, activeCount: 45, level: 'high' as const, hasOnline: true },
  { id: 6, name: '成都', value: [104.0668, 30.5728, 67], memberCount: 67, activeCount: 41, level: 'medium' as const, hasOnline: false },
  { id: 7, name: '武汉', value: [114.3055, 30.5928, 56], memberCount: 56, activeCount: 38, level: 'medium' as const, hasOnline: false },
  { id: 8, name: '西安', value: [108.9398, 34.3416, 54], memberCount: 54, activeCount: 31, level: 'medium' as const, hasOnline: false },
  { id: 9, name: '南京', value: [118.7969, 32.0603, 76], memberCount: 76, activeCount: 45, level: 'high' as const, hasOnline: true },
  { id: 10, name: '重庆', value: [106.5516, 29.5630, 45], memberCount: 45, activeCount: 28, level: 'medium' as const, hasOnline: false },
  { id: 11, name: '天津', value: [117.1901, 39.1256, 45], memberCount: 45, activeCount: 30, level: 'medium' as const, hasOnline: false },
  { id: 12, name: '苏州', value: [120.6195, 31.3114, 54], memberCount: 54, activeCount: 35, level: 'medium' as const, hasOnline: true },
  { id: 13, name: '青岛', value: [120.3690, 36.0944, 38], memberCount: 38, activeCount: 26, level: 'medium' as const, hasOnline: false },
  { id: 14, name: '大连', value: [121.6147, 38.9140, 34], memberCount: 34, activeCount: 22, level: 'low' as const, hasOnline: false },
  { id: 15, name: '厦门', value: [118.0894, 24.4798, 45], memberCount: 45, activeCount: 30, level: 'medium' as const, hasOnline: true },
  { id: 16, name: '郑州', value: [113.6254, 34.7466, 38], memberCount: 38, activeCount: 24, level: 'medium' as const, hasOnline: false },
  { id: 17, name: '长沙', value: [112.9388, 28.2282, 43], memberCount: 43, activeCount: 28, level: 'medium' as const, hasOnline: false },
  { id: 18, name: '合肥', value: [117.2272, 31.8206, 34], memberCount: 34, activeCount: 21, level: 'low' as const, hasOnline: false },
  { id: 19, name: '福州', value: [119.2965, 26.0745, 38], memberCount: 38, activeCount: 25, level: 'medium' as const, hasOnline: false },
  { id: 20, name: '昆明', value: [102.8329, 24.8801, 32], memberCount: 32, activeCount: 20, level: 'low' as const, hasOnline: false },
  { id: 21, name: '济南', value: [117.1205, 36.6519, 41], memberCount: 41, activeCount: 27, level: 'medium' as const, hasOnline: true },
  { id: 22, name: '哈尔滨', value: [126.5350, 45.8038, 28], memberCount: 28, activeCount: 18, level: 'low' as const, hasOnline: false },
  { id: 23, name: '沈阳', value: [123.4315, 41.8057, 35], memberCount: 35, activeCount: 23, level: 'medium' as const, hasOnline: false },
  { id: 24, name: '长春', value: [125.3235, 43.8171, 25], memberCount: 25, activeCount: 16, level: 'low' as const, hasOnline: false },
  { id: 25, name: '石家庄', value: [114.5149, 38.0428, 31], memberCount: 31, activeCount: 20, level: 'low' as const, hasOnline: false },
  { id: 26, name: '太原', value: [112.5489, 37.8706, 29], memberCount: 29, activeCount: 19, level: 'low' as const, hasOnline: false },
  { id: 27, name: '呼和浩特', value: [111.7518, 40.8419, 22], memberCount: 22, activeCount: 14, level: 'low' as const, hasOnline: false },
  { id: 28, name: '南昌', value: [115.8581, 28.6829, 33], memberCount: 33, activeCount: 22, level: 'low' as const, hasOnline: false },
  { id: 29, name: '贵阳', value: [106.6302, 26.6477, 27], memberCount: 27, activeCount: 17, level: 'low' as const, hasOnline: false },
  { id: 30, name: '南宁', value: [108.3665, 22.8170, 30], memberCount: 30, activeCount: 19, level: 'low' as const, hasOnline: false },
  { id: 31, name: '兰州', value: [103.8236, 36.0581, 24], memberCount: 24, activeCount: 15, level: 'low' as const, hasOnline: false },
  { id: 32, name: '西宁', value: [101.7782, 36.6171, 20], memberCount: 20, activeCount: 13, level: 'low' as const, hasOnline: false },
  { id: 33, name: '银川', value: [106.2309, 38.4879, 21], memberCount: 21, activeCount: 14, level: 'low' as const, hasOnline: false },
  { id: 34, name: '乌鲁木齐', value: [87.6168, 43.8256, 26], memberCount: 26, activeCount: 17, level: 'low' as const, hasOnline: false },
  { id: 35, name: '拉萨', value: [91.1145, 29.6449, 15], memberCount: 15, activeCount: 10, level: 'low' as const, hasOnline: false },
  { id: 36, name: '海口', value: [110.1999, 20.0444, 28], memberCount: 28, activeCount: 18, level: 'low' as const, hasOnline: false },
  // 海外城市
  { id: 37, name: '旧金山', value: [-122.4194, 37.7749, 134], memberCount: 134, activeCount: 92, level: 'high' as const, hasOnline: true },
  { id: 38, name: '纽约', value: [-74.0060, 40.7128, 156], memberCount: 156, activeCount: 98, level: 'high' as const, hasOnline: true },
  { id: 39, name: '伦敦', value: [-0.1278, 51.5074, 98], memberCount: 98, activeCount: 67, level: 'high' as const, hasOnline: true },
  { id: 40, name: '东京', value: [139.6503, 35.6762, 89], memberCount: 89, activeCount: 61, level: 'high' as const, hasOnline: true },
  { id: 41, name: '新加坡', value: [103.8198, 1.3521, 67], memberCount: 67, activeCount: 45, level: 'medium' as const, hasOnline: false },
  { id: 42, name: '悉尼', value: [151.2093, -33.8688, 45], memberCount: 45, activeCount: 30, level: 'medium' as const, hasOnline: false }
]

// 实时活动数据
const realtimeActivities = [
  { id: 1, user: '张三', action: '加入了深圳分会', time: '2分钟前', city: '深圳', type: 'join' },
  { id: 2, user: '李四', action: '发布了AI项目', time: '5分钟前', city: '上海', type: 'project' },
  { id: 3, user: '王五', action: '完成了进阶课程', time: '10分钟前', city: '北京', type: 'learn' },
  { id: 4, user: 'John', action: '组织了线下聚会', time: '15分钟前', city: '旧金山', type: 'event' }
]

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showConnections, setShowConnections] = useState(false)  // 默认关闭连接线
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<'china' | 'world'>('china')
  const [showCreateMeetup, setShowCreateMeetup] = useState(false)
  const [meetupCity, setMeetupCity] = useState<string>('')
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)  // 只显示在线成员
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null)

  // 根据视图模式和在线状态过滤城市
  const displayCities = useMemo(() => {
    let filtered = chinaCityData
    
    // 视图模式过滤
    if (viewMode === 'china') {
      filtered = filtered.filter(city => city.id <= 36) // 只显示国内城市
    }
    
    // 在线状态过滤
    if (showOnlineOnly) {
      // 使用 hasOnline 属性过滤有在线成员的城市
      filtered = filtered.filter(city => city.hasOnline)
    }
    
    return filtered
  }, [viewMode, showOnlineOnly])

  // 统计数据
  const stats = useMemo(() => {
    const cities = displayCities
    return {
      totalMembers: cities.reduce((sum, city) => sum + city.memberCount, 0),
      totalCities: cities.length,
      activeMembers: cities.reduce((sum, city) => sum + city.activeCount, 0),
    }
  }, [displayCities])

  const handleCityClick = (city: CityData) => {
    console.log('handleCityClick called with:', city)
    setSelectedCity(city)
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#0B1929] via-[#0D2538] to-[#0F3448] overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <defs>
              <pattern id="grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#0891A1" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* 主地图容器 */}
      <div className="absolute inset-0 top-16">
        <ChinaMap 
          cities={displayCities}
          onCityClick={handleCityClick}
          showHeatmap={showHeatmap}
          showConnections={showConnections}
        />
      </div>

      {/* 顶部导航栏 */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gray-900/50 backdrop-blur-sm z-20">
        <div className="h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-[#0891A1]">深海圈</div>
            <nav className="hidden md:flex items-center gap-6 ml-8">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">学习</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">社区</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">资源</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">日历</a>
              <a href="#" className="text-[#0891A1] font-medium">地图</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">成员</a>
            </nav>
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-[#0891A1] text-white rounded-lg hover:bg-[#07788A] transition-colors">
              注册
            </button>
          </div>
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        {/* 在线筛选按钮 */}
        <div className="bg-gray-900/90 backdrop-blur-md rounded-full px-1 py-1">
          <button
            onClick={() => setShowOnlineOnly(!showOnlineOnly)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              showOnlineOnly 
                ? 'bg-[#0891A1] text-white' 
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${showOnlineOnly ? 'bg-white' : 'bg-green-500'} ${
              showOnlineOnly ? '' : 'animate-pulse'
            }`} />
            {showOnlineOnly ? '只看在线' : '显示全部'}
          </button>
        </div>
        
        {/* 统计信息 */}
        <div className="bg-gray-900/90 backdrop-blur-md rounded-full px-6 py-3 text-sm">
          <span className="text-gray-400">
            深海圈 · {stats.totalCities} 个城市 · {stats.totalMembers} 位成员
            {showOnlineOnly && ` · 在线城市 ${displayCities.length} 个`}
          </span>
        </div>
      </div>

      {/* 右侧面板 - 可折叠 */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: isRightPanelCollapsed ? 320 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute right-0 top-20 bottom-6 w-80 z-20"
      >
        {/* 折叠按钮 */}
        <button
          onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
          className="absolute -left-8 top-4 bg-gray-900/90 backdrop-blur-md p-2 rounded-l-lg hover:bg-gray-800 transition-colors"
        >
          {isRightPanelCollapsed ? (
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {/* 面板内容 */}
        <div className="h-full bg-gray-900/90 backdrop-blur-md rounded-l-xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedCity ? (
              <motion.div
                key="city-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-6"
              >
                {/* 城市详情头部 */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedCity.name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      深海圈 {selectedCity.name} 分会
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCity(null)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* 统计数据 */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-green-400">+15%</span>
                    </div>
                    <p className="text-xl font-bold text-white">{selectedCity.memberCount}</p>
                    <p className="text-xs text-gray-400">总成员</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-gray-400">
                        {Math.round((selectedCity.activeCount / selectedCity.memberCount) * 100)}%
                      </span>
                    </div>
                    <p className="text-xl font-bold text-white">{selectedCity.activeCount}</p>
                    <p className="text-xs text-gray-400">活跃成员</p>
                  </div>
                </div>

                {/* 成员列表预览 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">活跃成员</h3>
                  <div className="space-y-2">
                    {/* 模拟成员数据 */}
                    {[
                      { name: '张三', role: 'AI产品经理', avatar: '张' },
                      { name: '李四', role: '全栈开发', avatar: '李' },
                      { name: '王五', role: '设计师', avatar: '王' },
                    ].slice(0, 3).map((member, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMemberName(member.name)
                        }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#0891A1] to-[#00A8CC] rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {member.avatar}
                        </div>
                        <div className="flex-1 pointer-events-none">
                          <p className="text-sm text-white">{member.name}</p>
                          <p className="text-xs text-gray-400">{member.role}</p>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 text-center pt-2">
                      还有 {Math.max(0, selectedCity.activeCount - 3)} 位成员...
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2">
                  <button className="w-full py-2 bg-[#0891A1] text-white rounded-lg font-medium hover:bg-[#07788A] transition-colors">
                    查看全部成员
                  </button>
                  <button 
                    className="w-full py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setMeetupCity(selectedCity.name)
                      setShowCreateMeetup(true)
                    }}
                  >
                    在{selectedCity.name}创建组局
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="activity-feed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col"
              >
                {/* 实时动态标题 */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">实时动态</h2>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-400">Live</span>
                    </div>
                  </div>
                </div>

                {/* 动态列表 */}
                <div className="flex-1 overflow-y-auto px-6">
                  <div className="space-y-3">
                    {realtimeActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800/50 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.user[0] === '张' ? 'bg-blue-500/20 text-blue-400' :
                            activity.user[0] === '李' ? 'bg-purple-500/20 text-purple-400' :
                            activity.user[0] === '王' ? 'bg-green-500/20 text-green-400' :
                            'bg-orange-500/20 text-orange-400'
                          }`}>
                            <span className="text-sm font-bold">{activity.user[0]}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium text-white">{activity.user}</span>
                              <span className="text-gray-400"> {activity.action}</span>
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {activity.time}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {activity.city}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* 城市排行榜 */}
                <div className="p-6 pt-4 border-t border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    城市排行榜
                  </h3>
                  <div className="space-y-2">
                    {displayCities
                      .sort((a, b) => b.memberCount - a.memberCount)
                      .slice(0, 3)
                      .map((city, index) => (
                        <motion.div
                          key={city.id}
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                          onClick={() => setSelectedCity(city)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-lg font-bold ${
                              index === 0 ? 'text-yellow-400' :
                              index === 1 ? 'text-gray-300' :
                              'text-orange-400'
                            }`}>
                              #{index + 1}
                            </span>
                            <div>
                              <p className="text-white font-medium">{city.name}</p>
                              <p className="text-xs text-gray-400">{city.memberCount} 成员</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      ))}
                  </div>
                  
                  {/* 创建组局按钮 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateMeetup(true)}
                    className="w-full mt-4 py-3 bg-gradient-to-r from-[#0891A1] to-[#00A8CC] text-white rounded-lg font-medium hover:from-[#07788A] hover:to-[#009AB8] transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    创建组局
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* 创建组局弹窗 */}
      <CreateMeetupModal
        isOpen={showCreateMeetup}
        onClose={() => setShowCreateMeetup(false)}
        defaultCity={meetupCity}
      />
      
      {/* 成员信息弹窗 */}
      {selectedMemberName && (
        <MemberInfoModal
          isOpen={!!selectedMemberName}
          onClose={() => setSelectedMemberName(null)}
          memberName={selectedMemberName}
          position="right"
          size="small"
        />
      )}
    </div>
  )
}