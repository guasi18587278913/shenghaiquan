'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MapPin, 
  Users, 
  Activity, 
  Calendar,
  TrendingUp,
  Globe,
  Map as MapIcon
} from 'lucide-react'

// 模拟地图数据
const mockMapData = {
  cities: [
    {
      id: 1,
      name: '北京',
      lat: 39.9042,
      lng: 116.4074,
      memberCount: 156,
      activeCount: 89,
      recentActivity: 12,
      level: 'high'
    },
    {
      id: 2,
      name: '上海',
      lat: 31.2304,
      lng: 121.4737,
      memberCount: 124,
      activeCount: 76,
      recentActivity: 8,
      level: 'high'
    },
    {
      id: 3,
      name: '深圳',
      lat: 22.5431,
      lng: 114.0579,
      memberCount: 98,
      activeCount: 67,
      recentActivity: 15,
      level: 'high'
    },
    {
      id: 4,
      name: '杭州',
      lat: 30.2741,
      lng: 120.1551,
      memberCount: 67,
      activeCount: 45,
      recentActivity: 6,
      level: 'medium'
    },
    {
      id: 5,
      name: '成都',
      lat: 30.5728,
      lng: 104.0668,
      memberCount: 45,
      activeCount: 28,
      recentActivity: 4,
      level: 'medium'
    },
    {
      id: 6,
      name: '广州',
      lat: 23.1291,
      lng: 113.2644,
      memberCount: 78,
      activeCount: 52,
      recentActivity: 9,
      level: 'high'
    },
    {
      id: 7,
      name: '武汉',
      lat: 30.5928,
      lng: 114.3055,
      memberCount: 34,
      activeCount: 21,
      recentActivity: 3,
      level: 'medium'
    },
    {
      id: 8,
      name: '西安',
      lat: 34.3416,
      lng: 108.9398,
      memberCount: 23,
      activeCount: 12,
      recentActivity: 2,
      level: 'low'
    }
  ],
  globalStats: {
    totalMembers: 825,
    totalCities: 35,
    activeMembers: 467,
    monthlyGrowth: 12.5
  }
}

// 模拟成员数据
const mockMembers = [
  {
    id: 1,
    name: '张三',
    avatar: '/avatar1.jpg',
    role: 'AI产品经理',
    joinedAt: '2024-01-15',
    skills: ['Next.js', 'AI编程', '产品设计']
  },
  {
    id: 2,
    name: '李四',
    avatar: '/avatar2.jpg',
    role: '全栈开发',
    joinedAt: '2024-02-20',
    skills: ['React', 'Node.js', 'Python']
  },
  {
    id: 3,
    name: '王五',
    avatar: '/avatar3.jpg',
    role: '创业者',
    joinedAt: '2024-03-10',
    skills: ['商业模式', '增长黑客', 'AI应用']
  }
]

// 模拟活动数据
const mockActivities = [
  {
    id: 1,
    title: '深圳AI产品交流会',
    date: '2024-03-15',
    type: '线下聚会',
    participants: 23
  },
  {
    id: 2,
    title: '上海创业者沙龙',
    date: '2024-03-20',
    type: '线下聚会',
    participants: 18
  }
]

export default function MapPage() {
  const [selectedCity, setSelectedCity] = useState<typeof mockMapData.cities[0] | null>(null)
  const [viewMode, setViewMode] = useState<'china' | 'world'>('china')
  const [searchQuery, setSearchQuery] = useState('')

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-orange-500'
      case 'low':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getMarkerSize = (memberCount: number) => {
    if (memberCount > 100) return 'w-12 h-12'
    if (memberCount > 50) return 'w-10 h-10'
    return 'w-8 h-8'
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">成员分布地图</h1>
        <p className="text-muted-foreground">
          查看深海圈成员在全球的分布情况
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">总成员数</p>
              <p className="text-2xl font-bold">{mockMapData.globalStats.totalMembers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <MapPin className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">覆盖城市</p>
              <p className="text-2xl font-bold">{mockMapData.globalStats.totalCities}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <Activity className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">活跃成员</p>
              <p className="text-2xl font-bold">{mockMapData.globalStats.activeMembers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-4">
            <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">月增长率</p>
              <p className="text-2xl font-bold">{mockMapData.globalStats.monthlyGrowth}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 地图区域 */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4">
              {/* 控制栏 */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'china' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('china')}
                  >
                    <MapIcon className="h-4 w-4 mr-1" />
                    中国
                  </Button>
                  <Button
                    variant={viewMode === 'world' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('world')}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    世界
                  </Button>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索城市..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 模拟地图区域 */}
              <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg h-[500px] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">地图可视化区域（需集成地图API）</p>
                </div>
                
                {/* 模拟城市标记 */}
                {mockMapData.cities.map((city) => {
                  // 简单的位置映射（实际应使用地图投影算法）
                  const left = `${((city.lng - 70) / 80) * 100}%`
                  const top = `${((60 - city.lat) / 60) * 100}%`
                  
                  return (
                    <div
                      key={city.id}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                        selectedCity?.id === city.id ? 'z-10' : ''
                      }`}
                      style={{ left, top }}
                      onClick={() => setSelectedCity(city)}
                    >
                      <div
                        className={`${getMarkerSize(city.memberCount)} ${getActivityLevelColor(
                          city.level
                        )} rounded-full flex items-center justify-center text-white font-bold shadow-lg relative`}
                      >
                        {city.memberCount}
                        {selectedCity?.id === city.id && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-current"></div>
                        )}
                      </div>
                      <p className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 text-xs font-medium whitespace-nowrap">
                        {city.name}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* 图例 */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">高活跃</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">中活跃</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">低活跃</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 信息面板 */}
        <div className="space-y-4">
          {selectedCity ? (
            <>
              {/* 城市信息 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4">{selectedCity.name}市</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">成员总数</span>
                      <span className="font-medium">{selectedCity.memberCount}人</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">活跃成员</span>
                      <span className="font-medium">{selectedCity.activeCount}人</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">本月活动</span>
                      <span className="font-medium">{selectedCity.recentActivity}场</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">活跃度</span>
                      <Badge variant={selectedCity.level === 'high' ? 'default' : 'secondary'}>
                        {selectedCity.level === 'high' ? '高' : selectedCity.level === 'medium' ? '中' : '低'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 成员列表 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4">部分成员</h3>
                  <div className="space-y-3">
                    {mockMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="w-full mt-3">
                    查看全部 {selectedCity.memberCount} 位成员
                  </Button>
                </CardContent>
              </Card>

              {/* 近期活动 */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4">近期活动</h3>
                  <div className="space-y-3">
                    {mockActivities.map((activity) => (
                      <div key={activity.id} className="border-l-2 border-primary pl-3">
                        <p className="font-medium">{activity.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {activity.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {activity.participants}人
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">点击地图上的城市查看详情</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}