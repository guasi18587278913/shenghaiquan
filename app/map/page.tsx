'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  Menu,
  Loader2,
  AlertCircle
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

// 中国主要城市的经纬度映射
const cityCoordinates: { [key: string]: [number, number] } = {
  '北京': [116.4074, 39.9042],
  '上海': [121.4737, 31.2304],
  '深圳': [114.0579, 22.5431],
  '广州': [113.2644, 23.1291],
  '杭州': [120.1551, 30.2741],
  '成都': [104.0668, 30.5728],
  '武汉': [114.3055, 30.5928],
  '西安': [108.9398, 34.3416],
  '南京': [118.7969, 32.0603],
  '重庆': [106.5516, 29.5630],
  '天津': [117.1901, 39.1256],
  '苏州': [120.6195, 31.3114],
  '青岛': [120.3690, 36.0944],
  '大连': [121.6147, 38.9140],
  '厦门': [118.0894, 24.4798],
  '郑州': [113.6254, 34.7466],
  '长沙': [112.9388, 28.2282],
  '合肥': [117.2272, 31.8206],
  '福州': [119.2965, 26.0745],
  '昆明': [102.8329, 24.8801],
  '济南': [117.1205, 36.6519],
  '哈尔滨': [126.5350, 45.8038],
  '沈阳': [123.4315, 41.8057],
  '长春': [125.3235, 43.8171],
  '石家庄': [114.5149, 38.0428],
  '太原': [112.5489, 37.8706],
  '呼和浩特': [111.7518, 40.8419],
  '南昌': [115.8581, 28.6829],
  '贵阳': [106.6302, 26.6477],
  '南宁': [108.3665, 22.8170],
  '兰州': [103.8236, 36.0581],
  '西宁': [101.7782, 36.6171],
  '银川': [106.2309, 38.4879],
  '乌鲁木齐': [87.6168, 43.8256],
  '拉萨': [91.1145, 29.6449],
  '海口': [110.1999, 20.0444],
  // 海外城市
  '旧金山': [-122.4194, 37.7749],
  '纽约': [-74.0060, 40.7128],
  '伦敦': [-0.1278, 51.5074],
  '东京': [139.6503, 35.6762],
  '新加坡': [103.8198, 1.3521],
  '悉尼': [151.2093, -33.8688],
  '洛杉矶': [-118.2437, 34.0522],
  '西雅图': [-122.3321, 47.6062],
  '温哥华': [-123.1216, 49.2827],
  '多伦多': [-79.3832, 43.6532],
  '巴黎': [2.3522, 48.8566],
  '柏林': [13.4050, 52.5200],
  '阿姆斯特丹': [4.8952, 52.3676],
  '首尔': [126.9780, 37.5665],
  '曼谷': [100.5018, 13.7563],
  '吉隆坡': [101.6869, 3.1390],
  '迪拜': [55.2708, 25.2048],
  '墨尔本': [144.9631, -37.8136],
  '奥克兰': [174.7633, -36.8485]
}

// 实时活动数据
const realtimeActivities = [
  { id: 1, user: '张三', action: '加入了深圳分会', time: '2分钟前', city: '深圳', type: 'join' },
  { id: 2, user: '李四', action: '发布了AI项目', time: '5分钟前', city: '上海', type: 'project' },
  { id: 3, user: '王五', action: '完成了进阶课程', time: '10分钟前', city: '北京', type: 'learn' },
  { id: 4, user: 'John', action: '组织了线下聚会', time: '15分钟前', city: '旧金山', type: 'event' }
]

export default function MapPage() {
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<'china' | 'world'>('china')
  const [showCreateMeetup, setShowCreateMeetup] = useState(false)
  const [meetupCity, setMeetupCity] = useState<string>('')
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [selectedMemberName, setSelectedMemberName] = useState<string | null>(null)
  const [locationData, setLocationData] = useState<CityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cityUsers, setCityUsers] = useState<any[]>([])
  const [loadingCityUsers, setLoadingCityUsers] = useState(false)
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [allCityMembers, setAllCityMembers] = useState<any[]>([])
  const [loadingAllMembers, setLoadingAllMembers] = useState(false)
  const [memberPage, setMemberPage] = useState(1)
  const [hasMoreMembers, setHasMoreMembers] = useState(true)

  // 获取用户位置数据
  useEffect(() => {
    fetchLocationData()
  }, [])

  const fetchLocationData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/users/locations')
      if (!response.ok) {
        throw new Error('获取位置数据失败')
      }

      const data = await response.json()
      
      // 转换为地图需要的格式
      const cityData: CityData[] = data.locations.map((loc: any, index: number) => {
        const coords = cityCoordinates[loc.city] || [116.4074, 39.9042] // 默认北京坐标
        
        // 根据用户数量确定级别
        let level: 'high' | 'medium' | 'low' = 'low'
        if (loc.count >= 50) level = 'high'
        else if (loc.count >= 20) level = 'medium'
        
        return {
          id: index + 1,
          name: loc.city,
          value: [...coords, loc.count],
          memberCount: loc.count,
          activeCount: Math.floor(loc.count * 0.6), // 假设60%活跃
          level,
          hasOnline: loc.count > 30 // 假设人数大于30的城市有在线成员
        }
      })

      setLocationData(cityData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取位置数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 根据视图模式和在线状态过滤城市
  const displayCities = useMemo(() => {
    let filtered = locationData
    
    // 视图模式过滤
    if (viewMode === 'china') {
      // 过滤出中国城市（非负经度的亚洲城市）
      filtered = filtered.filter(city => {
        const longitude = city.value[0]
        return longitude > 0 && longitude < 140
      })
    }
    
    // 在线状态过滤
    if (showOnlineOnly) {
      filtered = filtered.filter(city => city.hasOnline)
    }
    
    return filtered
  }, [locationData, viewMode, showOnlineOnly])

  // 统计数据
  const stats = useMemo(() => {
    const cities = displayCities
    return {
      totalMembers: cities.reduce((sum, city) => sum + city.memberCount, 0),
      totalCities: cities.length,
      activeMembers: cities.reduce((sum, city) => sum + city.activeCount, 0),
    }
  }, [displayCities])

  const handleCityClick = async (city: CityData) => {
    console.log('handleCityClick called with:', city)
    setSelectedCity(city)
    setShowAllMembers(false) // 重置展开状态
    setMemberPage(1) // 重置页码
    setAllCityMembers([]) // 清空之前的数据
    
    // 获取该城市的用户
    try {
      setLoadingCityUsers(true)
      const response = await fetch(`/api/users/by-city?city=${encodeURIComponent(city.name)}&limit=3`)
      if (response.ok) {
        const data = await response.json()
        setCityUsers(data.users)
      }
    } catch (err) {
      console.error('获取城市用户失败:', err)
      setCityUsers([])
    } finally {
      setLoadingCityUsers(false)
    }
  }

  // 加载全部成员
  const loadAllMembers = async (page: number = 1) => {
    if (!selectedCity || loadingAllMembers) return
    
    try {
      setLoadingAllMembers(true)
      const response = await fetch(`/api/users?city=${encodeURIComponent(selectedCity.name)}&page=${page}&pageSize=20`)
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setAllCityMembers(data.users)
        } else {
          setAllCityMembers(prev => [...prev, ...data.users])
        }
        setHasMoreMembers(data.page < data.totalPages)
        setMemberPage(page)
      }
    } catch (err) {
      console.error('获取全部成员失败:', err)
    } finally {
      setLoadingAllMembers(false)
    }
  }

  if (loading) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-b from-[#0B1929] via-[#0D2538] to-[#0F3448] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0891A1] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-b from-[#0B1929] via-[#0D2538] to-[#0F3448] flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-6 h-6" />
            <p className="text-lg">{error}</p>
          </div>
        </div>
      </div>
    )
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

      {/* 右侧面板 - 可折叠和扩展 */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ 
          x: isRightPanelCollapsed ? (showAllMembers ? 480 : 320) : 0,
          width: showAllMembers ? '480px' : '320px'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute right-0 top-20 bottom-6 z-20"
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
        <div className={`h-full bg-gray-900/90 backdrop-blur-md rounded-l-xl shadow-2xl overflow-hidden transition-all duration-300 ${
          showAllMembers ? 'bg-gray-900/95' : ''
        }`}>
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
                    onClick={() => {
                      setSelectedCity(null)
                      setCityUsers([])
                    }}
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
                    {loadingCityUsers ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                      </div>
                    ) : cityUsers.length > 0 ? (
                      cityUsers.map((member) => (
                        <div 
                          key={member.id} 
                          className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedMemberName(member.name)
                          }}
                        >
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name}
                              className="w-8 h-8 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.nextElementSibling?.classList.remove('hidden')
                              }}
                            />
                          ) : null}
                          <div className={`w-8 h-8 bg-gradient-to-br from-[#0891A1] to-[#00A8CC] rounded-full flex items-center justify-center text-white text-sm font-bold ${member.avatar ? 'hidden' : ''}`}>
                            {member.name[0]}
                          </div>
                          <div className="flex-1 pointer-events-none">
                            <p className="text-sm text-white">{member.name}</p>
                            <p className="text-xs text-gray-400">
                              {member.position || member.role || '深海圈成员'}
                              {member.company && ` @ ${member.company}`}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-4">
                        暂无成员数据
                      </p>
                    )}
                    {cityUsers.length > 0 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        还有 {Math.max(0, selectedCity.memberCount - cityUsers.length)} 位成员...
                      </p>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-2">
                  <button 
                    className="w-full py-2 bg-[#0891A1] text-white rounded-lg font-medium hover:bg-[#07788A] transition-colors flex items-center justify-center gap-2"
                    onClick={() => {
                      setShowAllMembers(!showAllMembers)
                      if (!showAllMembers && allCityMembers.length === 0) {
                        loadAllMembers(1)
                      }
                    }}
                  >
                    {showAllMembers ? (
                      <>
                        <ChevronLeft className="w-4 h-4" />
                        收起列表
                      </>
                    ) : (
                      <>
                        查看全部成员
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
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

                {/* 展开的成员列表 */}
                <AnimatePresence>
                  {showAllMembers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 border-t border-gray-800 pt-4"
                    >
                      {/* 标题和统计 */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">
                          全部成员 ({selectedCity.memberCount})
                        </h3>
                        <span className="text-xs text-gray-500">
                          已加载 {allCityMembers.length} 人
                        </span>
                      </div>
                      
                      <div className="max-h-[calc(100vh-500px)] overflow-y-auto">
                        {/* 成员网格 */}
                        <div className="grid grid-cols-2 gap-3">
                          {allCityMembers.map((member) => (
                            <motion.div
                              key={member.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ scale: 1.02 }}
                              className="bg-gray-800/50 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-all"
                              onClick={() => setSelectedMemberName(member.name)}
                            >
                              <div className="flex items-start gap-2">
                                {member.avatar ? (
                                  <img 
                                    src={member.avatar} 
                                    alt={member.name}
                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                ) : null}
                                <div className={`w-10 h-10 bg-gradient-to-br from-[#0891A1] to-[#00A8CC] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${member.avatar ? 'hidden' : ''}`}>
                                  {member.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{member.name}</p>
                                  <p className="text-xs text-gray-400 truncate">
                                    {member.position || member.role || '深海圈成员'}
                                  </p>
                                  {member.company && (
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                      @{member.company}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* 加载更多按钮 */}
                        {loadingAllMembers && (
                          <div className="flex justify-center py-4">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                          </div>
                        )}
                        
                        {!loadingAllMembers && hasMoreMembers && (
                          <button
                            onClick={() => loadAllMembers(memberPage + 1)}
                            className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                          >
                            加载更多...
                          </button>
                        )}

                        {!loadingAllMembers && !hasMoreMembers && allCityMembers.length > 0 && (
                          <p className="text-center text-gray-500 text-sm mt-4">
                            已显示全部 {allCityMembers.length} 位成员
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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