import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '5')
    
    if (!city) {
      return NextResponse.json({ error: '需要提供城市参数' }, { status: 400 })
    }
    
    // 模拟用户数据
    const mockUsers = [
      {
        id: '1',
        name: '张三',
        avatar: '/avatars/user1.jpg',
        position: '前端工程师',
        company: '深海科技',
        role: 'USER'
      },
      {
        id: '2',
        name: '李四',
        avatar: '/avatars/user2.jpg',
        position: '后端工程师',
        company: '海洋集团',
        role: 'USER'
      },
      {
        id: '3',
        name: '王五',
        avatar: '/avatars/user3.jpg',
        position: '产品经理',
        company: '蓝海创新',
        role: 'USER'
      },
      {
        id: '4',
        name: '赵六',
        avatar: null,
        position: 'UI设计师',
        company: '深海设计',
        role: 'USER'
      },
      {
        id: '5',
        name: '陈七',
        avatar: null,
        position: '数据分析师',
        company: '海数科技',
        role: 'USER'
      }
    ]
    
    // 根据城市返回不同数量的用户
    const cityUserCount = {
      '北京': 156,
      '上海': 234,
      '深圳': 189,
      '广州': 145,
      '杭州': 98,
      '成都': 87,
      '武汉': 76,
      '西安': 65,
      '南京': 54,
      '重庆': 43
    }
    
    const total = cityUserCount[city as keyof typeof cityUserCount] || Math.floor(Math.random() * 50) + 5
    const users = mockUsers.slice(0, Math.min(limit, mockUsers.length))
    
    return NextResponse.json({
      users,
      total,
      city
    })
    
  } catch (error) {
    console.error('获取城市用户失败:', error)
    return NextResponse.json(
      { error: '获取城市用户失败' },
      { status: 500 }
    )
  }
}