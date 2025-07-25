import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const online = searchParams.get('online')
    const city = searchParams.get('city') || ''
    
    // 构建查询条件
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { company: { contains: search } },
        { position: { contains: search } }
      ]
    }
    
    // 城市筛选（支持多种格式的位置数据）
    if (city) {
      where.OR = [
        { location: { contains: `/${city}市/` } }, // 匹配 "省/市/区" 格式
        { location: { contains: `/${city}/` } },   // 匹配 "省/市" 格式
        { location: { contains: ` ${city}市 ` } }, // 匹配空格分隔格式
        { location: { contains: ` ${city} ` } },   // 匹配空格分隔格式
        { location: { equals: city } },            // 精确匹配
        { location: { equals: `${city}市` } },     // 匹配带"市"后缀
        // 直辖市特殊处理
        ...(city === '北京' ? [
          { location: { startsWith: '北京' } }
        ] : []),
        ...(city === '上海' ? [
          { location: { startsWith: '上海' } }
        ] : []),
        ...(city === '天津' ? [
          { location: { startsWith: '天津' } }
        ] : []),
        ...(city === '重庆' ? [
          { location: { startsWith: '重庆' } }
        ] : [])
      ]
      
      // 如果已有搜索条件，需要组合AND逻辑
      if (search) {
        const searchConditions = where.OR
        where.AND = [
          { OR: searchConditions },
          { OR: where.OR }
        ]
        delete where.OR
      }
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