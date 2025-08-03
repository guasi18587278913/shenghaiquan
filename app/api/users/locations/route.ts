import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 模拟数据，暂时不使用数据库
    const mockLocations = [
      { city: '北京', count: 156 },
      { city: '上海', count: 234 },
      { city: '深圳', count: 189 },
      { city: '广州', count: 145 },
      { city: '杭州', count: 98 },
      { city: '成都', count: 87 },
      { city: '武汉', count: 76 },
      { city: '西安', count: 65 },
      { city: '南京', count: 54 },
      { city: '重庆', count: 43 },
      { city: '天津', count: 32 },
      { city: '苏州', count: 45 },
      { city: '青岛', count: 28 },
      { city: '大连', count: 21 },
      { city: '厦门', count: 19 },
      { city: '郑州', count: 17 },
      { city: '长沙', count: 15 },
      { city: '合肥', count: 12 },
      { city: '福州', count: 10 },
      { city: '昆明', count: 8 }
    ]

    return NextResponse.json({
      locations: mockLocations,
      total: 906,
      locationsCount: mockLocations.length
    })
    
  } catch (error) {
    console.error('获取用户位置数据失败:', error)
    return NextResponse.json(
      { error: '获取用户位置数据失败' },
      { status: 500 }
    )
  }
}