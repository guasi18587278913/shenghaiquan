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
        const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
        const geoJson = await response.json()
        setMapData(geoJson)
        
        // 注册地图
        echarts.registerMap('china', geoJson)
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

    // 准备城市数据 - 分离在线和离线城市
    const onlineCities = cities.filter(city => city.hasOnline).map(city => ({
      name: city.name,
      value: city.value,
      id: city.id,
      memberCount: city.memberCount,
      activeCount: city.activeCount,
      level: city.level,
      hasOnline: true,
      itemStyle: {
        color: city.level === 'high' ? '#ff4757' :      // 亮红色
               city.level === 'medium' ? '#ff7f50' :     // 亮橙色
               '#32ff7e',         // 亮绿色（默认）
        shadowBlur: 20,
        shadowColor: city.level === 'high' ? '#ff4757' : 
                     city.level === 'medium' ? '#ff7f50' : '#32ff7e'
      }
    }))
    
    const offlineCities = cities.filter(city => !city.hasOnline).map(city => ({
      name: city.name,
      value: city.value,
      id: city.id,
      memberCount: city.memberCount,
      activeCount: city.activeCount,
      level: city.level,
      hasOnline: false,
      itemStyle: {
        color: city.level === 'high' ? '#ff6b6b' :     // 更亮的红色
               city.level === 'medium' ? '#ff9f43' :    // 更亮的橙色
               '#ffd93d',        // 更亮的黄色（默认）
        opacity: 0.85,  // 提高透明度
        shadowBlur: 15,
        shadowColor: city.level === 'high' ? '#ff6b6b' : 
                     city.level === 'medium' ? '#ff9f43' : '#ffd93d'
      }
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
        // 热力图效果（使用散点图模拟）
        ...(showHeatmap ? [{
          name: '热力图',
          type: 'scatter' as const,
          coordinateSystem: 'geo',
          data: [...onlineCities, ...offlineCities],
          symbolSize: (val: any) => {
            return Math.sqrt(val[2]) * 5
          },
          itemStyle: {
            color: (params: any) => {
              const value = params.data.memberCount
              if (value > 100) return 'rgba(239, 68, 68, 0.3)'
              if (value > 50) return 'rgba(249, 115, 22, 0.3)'
              return 'rgba(251, 191, 36, 0.3)'
            },
            shadowBlur: 20,
            shadowColor: 'rgba(8, 145, 161, 0.5)'
          },
          silent: true
        }] : []),
        // 离线城市标记点（不带动画效果）
        {
          name: '离线城市',
          type: 'scatter' as const,
          coordinateSystem: 'geo',
          data: offlineCities,
          symbolSize: (val: any) => {
            return Math.sqrt(val[2]) * 1.8  // 增大尺寸
          },
          label: {
            show: true,
            formatter: (params: any) => params.name,
            position: 'bottom',
            color: '#e5e7eb',  // 使用更亮的灰色，更易读
            fontSize: 12
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1,
            borderType: 'solid'
          },
          emphasis: {
            scale: 1.3,
            itemStyle: {
              borderWidth: 2,
              shadowBlur: 20
            }
          }
        },
        // 在线城市标记点（带动画效果）
        {
          name: '在线城市',
          type: 'effectScatter' as const,
          coordinateSystem: 'geo',
          data: onlineCities,
          symbolSize: (val: any) => {
            return Math.sqrt(val[2]) * 2
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 2
          },
          label: {
            show: true,
            formatter: (params: any) => params.name,
            position: 'bottom',
            color: '#fff',
            fontSize: 12
          },
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          emphasis: {
            scale: 1.5,
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          }
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
      if (params.componentType === 'series' && 
          (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') &&
          (params.seriesName === '在线城市' || params.seriesName === '离线城市')) {
        const cityName = params.data.name
        const city = cities.find(c => c.name === cityName)
        if (city) {
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
  }, [mapData, showHeatmap, showConnections, cities]) // 添加 cities 依赖，但优化更新逻辑


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