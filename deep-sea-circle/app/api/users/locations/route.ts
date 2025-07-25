import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 聚合用户位置数据
    const locations = await prisma.user.groupBy({
      by: ['location'],
      _count: {
        location: true
      },
      where: {
        AND: [
          {
            location: {
              not: null
            }
          },
          {
            location: {
              not: ''
            }
          }
        ]
      }
    })

    // 转换为地图需要的格式
    const locationData = locations
      .filter(loc => loc.location && loc.location !== '未知' && loc.location !== '未知位置')
      .map(loc => {
        // 处理位置名称，提取城市名
        let cityName = ''
        const location = loc.location.trim()
        
        // 处理不同格式的位置数据
        if (location.includes('/')) {
          // 格式: 省/市/区
          const parts = location.split('/').map(p => p.trim())
          if (parts.length >= 2) {
            cityName = parts[1] // 取第二部分（市）
          } else if (parts.length === 1) {
            cityName = parts[0]
          }
        } else if (location.includes(' ')) {
          // 格式: 省 市 区
          const parts = location.split(/\s+/).filter(p => p)
          if (parts.length >= 2) {
            cityName = parts[1]
          } else if (parts.length === 1) {
            cityName = parts[0]
          }
        } else {
          // 单独的城市名或省份名
          cityName = location
        }
        
        // 清理城市名称
        cityName = cityName
          .replace(/[市]$/, '') // 移除"市"后缀
          .replace(/^(北京|上海|天津|重庆).*/, '$1') // 直辖市特殊处理
          .trim()
        
        // 特殊处理一些情况
        if (cityName === '北京市') cityName = '北京'
        if (cityName === '上海市') cityName = '上海'
        if (cityName === '天津市') cityName = '天津'
        if (cityName === '重庆市') cityName = '重庆'
        
        return {
          city: cityName,
          count: loc._count.location,
          originalLocation: loc.location
        }
      })
      .filter(loc => loc.city && loc.city !== '未知') // 过滤掉空城市和未知城市

    // 合并相同城市的数据
    const cityMap = new Map<string, number>()
    locationData.forEach(loc => {
      const current = cityMap.get(loc.city) || 0
      cityMap.set(loc.city, current + loc.count)
    })

    // 转换回数组格式
    const mergedData = Array.from(cityMap.entries()).map(([city, count]) => ({
      city,
      count
    }))

    // 获取总用户数
    const totalUsers = await prisma.user.count()

    return NextResponse.json({
      locations: mergedData,
      total: totalUsers,
      locationsCount: mergedData.length
    })
    
  } catch (error) {
    console.error('获取用户位置数据失败:', error)
    return NextResponse.json(
      { error: '获取用户位置数据失败' },
      { status: 500 }
    )
  }
}