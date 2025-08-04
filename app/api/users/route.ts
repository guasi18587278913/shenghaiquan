import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    // 临时返回模拟数据
    const mockUsers = [
      {
        id: '1',
        name: '张三',
        avatar: null,
        location: '北京',
        company: '深海科技',
        position: '产品经理',
        bio: '专注于AI产品设计',
        skills: ['产品设计', 'AI', '用户研究'],
        level: 5,
        points: 1200,
        role: 'USER',
        createdAt: new Date().toISOString(),
        online: true
      },
      {
        id: '2',
        name: '李四',
        avatar: null,
        location: '上海',
        company: '创新工场',
        position: '技术总监',
        bio: '全栈开发工程师',
        skills: ['React', 'Node.js', 'Python'],
        level: 8,
        points: 2500,
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
        online: false
      },
      {
        id: '3',
        name: '王五',
        avatar: null,
        location: '深圳',
        company: 'AI Lab',
        position: '算法工程师',
        bio: '深度学习研究',
        skills: ['机器学习', 'TensorFlow', 'PyTorch'],
        level: 6,
        points: 1800,
        role: 'USER',
        createdAt: new Date().toISOString(),
        online: true
      }
    ]
    
    return NextResponse.json({
      users: mockUsers,
      total: 3,
      page: 1,
      pageSize: 20,
      totalPages: 1
    })
    
    /* 原始代码暂时注释
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const online = searchParams.get('online')
    const city = searchParams.get('city') || ''
    
    // 构建查询条件
    const where: any = {}
    const andConditions: any[] = []
    
    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search } },
          { location: { contains: search } },
          { company: { contains: search } },
          { position: { contains: search } }
        ]
      })
    }
    
    // 城市筛选 - 使用模糊匹配以处理不同的location格式
    if (city) {
      andConditions.push({
        OR: [
          {
            location: city  // 精确匹配
          },
          {
            location: {
              contains: city  // 包含城市名
            }
          },
          {
            location: `${city}市`  // 带"市"后缀
          },
          {
            location: {
              contains: `/${city}市/`  // 匹配 "省/市/区" 格式
            }
          },
          {
            location: {
              contains: `/${city}/`  // 匹配不带"市"的格式
            }
          },
          {
            location: {
              startsWith: city  // 以城市名开头
            }
          }
        ]
      })
    }
    
    // 合并所有条件
    if (andConditions.length > 0) {
      where.AND = andConditions
    }
    
    // Note: online field doesn't exist in current schema
    // if (online === 'true') {
    //   where.online = true
    // }
    
    // 查询总数
    const total = await prisma.user.count({ where })
    
    // 查询用户列表
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        avatar: true,
        location: true,
        company: true,
        position: true,
        bio: true,
        skills: true,
        // online: true, // Field doesn't exist in schema
        level: true,
        points: true,
        role: true,
        createdAt: true
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [
        // { online: 'desc' }, // Field doesn't exist in schema
        { createdAt: 'desc' }
      ]
    })
    
    // 处理skills字段（从JSON字符串转为数组）并添加模拟的online状态
    const processedUsers = users.map(user => {
      // 处理skills
      let skills = []
      try {
        if (user.skills && typeof user.skills === 'string' && user.skills.startsWith('[')) {
          skills = JSON.parse(user.skills)
        }
      } catch (e) {
        skills = []
      }
      
      return {
        ...user,
        bio: user.bio && user.bio !== '无' ? user.bio : '这位同学还没有填写个人简介',
        company: user.company && user.company !== '互联网行业' ? user.company : '暂未填写',
        position: user.position && user.position !== '企业员工/创业公司员工' ? user.position : '暂未填写',
        location: user.location || '暂未填写',
        skills,
        online: Math.random() > 0.7 // 30% chance of being online
      }
    })
    
    return NextResponse.json({
      users: processedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    })
    
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}