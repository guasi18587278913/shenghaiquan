'use client'

import { useEffect } from 'react'

export interface CityData {
  id: number
  name: string
  value: number[]
  memberCount: number
  activeCount: number
  level: 'high' | 'medium' | 'low'
  hasOnline?: boolean
}

interface ChinaMapProps {
  cities: CityData[]
  onCityClick: (city: CityData) => void
  showHeatmap: boolean
  showConnections: boolean
}

export default function ChinaMap({ cities, onCityClick }: ChinaMapProps) {
  useEffect(() => {
    console.log('城市数据:', cities)
  }, [cities])

  // 按成员数量排序
  const sortedCities = [...cities].sort((a, b) => b.memberCount - a.memberCount)

  return (
    <div className="w-full h-full overflow-auto p-8">
      <h2 className="text-3xl font-bold text-white text-center mb-8">深海圈成员分布</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {sortedCities.map((city) => (
          <div
            key={city.id}
            onClick={() => onCityClick(city)}
            className={`
              relative p-6 rounded-xl cursor-pointer transform transition-all duration-300
              hover:scale-105 hover:shadow-2xl
              ${city.level === 'high' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                city.level === 'medium' ? 'bg-gradient-to-br from-teal-600 to-teal-800' :
                'bg-gradient-to-br from-gray-600 to-gray-800'}
            `}
          >
            {city.hasOnline && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{city.name}</h3>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">总成员</span>
                <span className="text-white font-semibold">{city.memberCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">活跃成员</span>
                <span className="text-green-300 font-semibold">{city.activeCount}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-xs text-gray-300">
                活跃度: {Math.round((city.activeCount / city.memberCount) * 100)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
