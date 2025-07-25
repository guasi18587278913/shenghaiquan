'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts/core'
import { MapChart, ScatterChart, LinesChart, HeatmapChart, EffectScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  VisualMapComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

// 注册必要的组件
echarts.use([
  MapChart,
  ScatterChart,
  LinesChart,
  HeatmapChart,
  EffectScatterChart,
  TitleComponent,
  TooltipComponent,
  GeoComponent,
  VisualMapComponent,
  CanvasRenderer,
])

export interface CityData {
  id: number
  name: string
  value: number[]  // [经度, 纬度, 成员数]
  memberCount: number
  activeCount: number
  level: 'high' | 'medium' | 'low'
  hasOnline?: boolean  // 是否有在线成员
}

interface ChinaMapProps {
  cities: CityData[]
  onCityClick: (city: CityData) => void
  showHeatmap: boolean
  showConnections: boolean
}

export default function ChinaMap({ cities, onCityClick, showHeatmap, showConnections }: ChinaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [mapData, setMapData] = useState<any>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    // 动态加载中国地图数据
    const loadMapData = async () => {
      try {
        // 尝试多个数据源
        const dataSources = [
          '/data/china.json',  // 本地数据优先
          'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
          'https://unpkg.com/echarts@5.4.3/map/json/china.json'
        ]
        
        let geoJson = null
        let loadError = null
        
        for (const source of dataSources) {
          try {
            console.log(`Trying to load map data from: ${source}`)
            const response = await fetch(source)
            if (response.ok) {
              geoJson = await response.json()
              console.log('Map data loaded successfully from:', source)
              break
            }
          } catch (error) {
            loadError = error
            console.warn(`Failed to load from ${source}:`, error)
          }
        }
        
        if (geoJson) {
          setMapData(geoJson)
          // 注册地图
          echarts.registerMap('china', geoJson)
        } else {
          console.error('Failed to load map data from all sources:', loadError)
          // 使用简化的地图数据作为备用方案
          const fallbackData = {
            type: 'FeatureCollection' as const,
            features: []
          }
          setMapData(fallbackData)
          echarts.registerMap('china', fallbackData as any)
        }
      } catch (error) {
        console.error('Failed to load map data:', error)
      }
    }
    
    loadMapData()
  }, [])

  useEffect(() => {
    if (!chartRef.current || !mapData) return

    // 如果图表实例不存在，则初始化
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    // 获取当前的缩放和中心位置
    const currentOption = chartInstance.current.getOption() as any
    const currentZoom = currentOption?.geo?.[0]?.zoom || 1.2
    const currentCenter = currentOption?.geo?.[0]?.center

    // 准备城市数据 - 统一使用深海主题色
    const cityData = cities.map(city => ({
      name: city.name,
      value: city.value,
      id: city.id,
      memberCount: city.memberCount,
      activeCount: city.activeCount,
      level: city.level,
      hasOnline: city.hasOnline,
      // 根据人数使用不同深浅的蓝色
      itemStyle: {
        color: city.memberCount >= 50 ? '#0891A1' :      // 深海蓝（50人以上）
               city.memberCount >= 20 ? '#00A8CC' :      // 中等蓝（20-49人）
               '#00BCD4',                                 // 浅蓝（20人以下）
        opacity: 0.9
      },
      // 用于散点大小
      symbolSize: city.memberCount >= 50 ? 25 : 
                  city.memberCount >= 20 ? 20 : 15
    }))

    // 准备连接线数据
    const linesData = showConnections ? [
      { coords: [cities[0]?.value, cities[1]?.value] }, // 北京-上海
      { coords: [cities[1]?.value, cities[2]?.value] }, // 上海-深圳
      { coords: [cities[0]?.value, cities[2]?.value] }, // 北京-深圳
      { coords: [cities[4]?.value, cities[1]?.value] }, // 杭州-上海
    ].filter(line => line.coords[0] && line.coords[1]) : []

    const option: EChartsOption = {
      backgroundColor: 'transparent',
      // 视觉映射组件（用于热力图）
      ...(showHeatmap ? {
        visualMap: {
          min: 0,
          max: 120,
          calculable: true,
          inRange: {
            color: ['#00BCD4', '#00ACC1', '#0097A7', '#00838F', '#006064']  // 从浅到深的青色系
          },
          show: false  // 隐藏控制器
        }
      } : {}),
      geo: {
        map: 'china',
        roam: true,  // 开启缩放和平移
        scaleLimit: {
          min: 1,
          max: 5
        },
        zoom: currentZoom,  // 保持当前缩放级别
        center: currentCenter,  // 保持当前中心位置
        itemStyle: {
          areaColor: '#0A4A5C',
          borderColor: '#0891A1',
          borderWidth: 1,
          opacity: 0.8
        },
        emphasis: {
          itemStyle: {
            areaColor: '#0891A1',
            borderColor: '#00A8CC',
            borderWidth: 2
          },
          label: {
            show: true,
            color: '#fff'
          }
        },
        regions: [
          {
            name: '南海诸岛',
            itemStyle: {
              areaColor: '#0A4A5C',
              borderColor: '#0891A1',
              opacity: 0
            },
            label: {
              show: false
            }
          }
        ]
      },
      series: [
        // 热力图效果 - 统一使用清晰的圆点样式
        ...(showHeatmap ? [{
          name: '热力图',
          type: 'scatter' as const,
          coordinateSystem: 'geo',
          data: cityData,
          symbolSize: (val: any) => {
            const count = val[2]
            // 统一的圆点尺寸，不要太大
            if (count >= 100) return 25
            if (count >= 50) return 20
            if (count >= 20) return 15
            return 12
          },
          itemStyle: {
            color: '#00BCD4',  // 统一使用青色
            opacity: 0.8
          },
          silent: true,
          z: 2
        }] : []),
        // 城市标记点（使用effectScatter带动画效果）
        {
          name: '深海圈成员分布',
          type: 'effectScatter' as const,
          coordinateSystem: 'geo',
          data: cityData,
          symbolSize: (val: any) => {
            return val.symbolSize || Math.sqrt(val[2]) * 2
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 4,
            color: '#0891A1',
            number: 2
          },
          z: 10,  // 确保在热力图之上
          label: {
            show: true,
            formatter: (params: any) => {
              const data = params.data
              // 只显示人数较多的城市名称
              return data.memberCount >= 10 ? data.name : ''
            },
            position: 'bottom',
            color: '#fff',
            fontSize: 12,
            fontWeight: 'bold',
            textBorderColor: '#000',
            textBorderWidth: 1
          },
          itemStyle: {
            // 移除阴影效果，保持清晰
          },
          emphasis: {
            scale: 1.5,
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          // 确保点击事件能触发
          silent: false
        },
        // 连接线
        ...(showConnections ? [{
          name: '连接线',
          type: 'lines' as const,
          coordinateSystem: 'geo',
          zlevel: 1,
          effect: {
            show: true,
            period: 6,
            trailLength: 0.7,
            color: '#0891A1',
            symbolSize: 3
          },
          lineStyle: {
            color: '#0891A1',
            width: 1,
            curveness: 0.2,
            opacity: 0.6
          },
          data: linesData
        }] : [])
      ],
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.data && params.data.memberCount) {
            return `<div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 4px;">
                ${params.data.name}
                ${params.data.hasOnline ? '<span style="color: #22c55e; margin-left: 8px;">● 在线</span>' : '<span style="color: #6b7280; margin-left: 8px;">● 离线</span>'}
              </div>
              <div>总成员: ${params.data.memberCount}</div>
              <div>活跃成员: ${params.data.activeCount}</div>
              ${params.data.hasOnline ? '<div style="color: #22c55e;">有成员在线</div>' : ''}
            </div>`
          }
          return params.name
        },
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        borderColor: '#0891A1',
        borderWidth: 1,
        textStyle: {
          color: '#fff'
        }
      }
    }

    // 使用 notMerge: false 来保持地图的缩放和位置状态
    chartInstance.current.setOption(option, {
      notMerge: false,  // 合并选项而不是替换
      lazyUpdate: true  // 延迟更新以提高性能
    })

    // 清除并重新设置点击事件
    chartInstance.current.off('click')
    chartInstance.current.on('click', (params: any) => {
      if (params.componentType === 'series' && params.data) {
        const cityData = params.data
        
        if (cityData.name && cityData.memberCount !== undefined) {
          // 创建符合 CityData 接口的对象
          const city: CityData = {
            id: cityData.id || 0,
            name: cityData.name,
            value: cityData.value || [0, 0, cityData.memberCount],
            memberCount: cityData.memberCount,
            activeCount: cityData.activeCount || 0,
            level: cityData.level || 'low',
            hasOnline: cityData.hasOnline || false
          }
          onCityClick(city)
        }
      }
    })

    // 窗口大小调整
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      // 不要在这里销毁图表实例，因为组件可能只是重新渲染而不是卸载
    }
  }, [mapData, showHeatmap, showConnections, cities, onCityClick]) // 添加所有必要的依赖


  // 组件卸载时才销毁图表实例
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose()
    }
  }, [])

  if (!mapData) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-gray-400">加载地图数据中...</div>
      </div>
    )
  }

  return <div ref={chartRef} className="absolute inset-0" />
}