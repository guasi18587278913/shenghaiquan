import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const limit = parseInt(searchParams.get('limit') || '5')
    
    if (!city) {
      return NextResponse.json({ error: '需要提供城市参数' }, { status: 400 })
    }
    
    // 获取该城市的用户（需要匹配包含城市名的位置）
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { location: { contains: `/${city}市/` } }, // 匹配 "省/市/区" 格式
          { location: { contains: `/${city}/` } },   // 匹配 "省/市" 格式
          { location: { contains: ` ${city}市 ` } }, // 匹配空格分隔格式
          { location: { contains: ` ${city} ` } },   // 匹配空格分隔格式
          { location: { equals: city } },            // 精确匹配
          { location: { equals: `${city}市` } },     // 匹配带"市"后缀
          // 直辖市特殊处理
          ...(city === '北京' ? [
            { location: { startsWith: '北京' } },
            { location: { equals: '北京' } }
          ] : []),
          ...(city === '上海' ? [
            { location: { startsWith: '上海' } },
            { location: { equals: '上海' } }
          ] : []),
          ...(city === '天津' ? [
            { location: { startsWith: '天津' } },
            { location: { equals: '天津' } }
          ] : []),
          ...(city === '重庆' ? [
            { location: { startsWith: '重庆' } },
            { location: { equals: '重庆' } }
          ] : [])
        ]
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        position: true,
        company: true,
        role: true,
        location: true,
        bio: true
      },
      take: limit,
      orderBy: {
        points: 'desc' // 按积分排序，积分高的更活跃
      }
    })
    
    // 获取该城市的总用户数
    const total = await prisma.user.count({
      where: {
        OR: [
          { location: { contains: `/${city}市/` } },
          { location: { contains: `/${city}/` } },
          { location: { contains: ` ${city}市 ` } },
          { location: { contains: ` ${city} ` } },
          { location: { equals: city } },
          { location: { equals: `${city}市` } },
          ...(city === '北京' ? [
            { location: { startsWith: '北京' } },
            { location: { equals: '北京' } }
          ] : []),
          ...(city === '上海' ? [
            { location: { startsWith: '上海' } },
            { location: { equals: '上海' } }
          ] : []),
          ...(city === '天津' ? [
            { location: { startsWith: '天津' } },
            { location: { equals: '天津' } }
          ] : []),
          ...(city === '重庆' ? [
            { location: { startsWith: '重庆' } },
            { location: { equals: '重庆' } }
          ] : [])
        ]
      }
    })
    
    // 处理用户数据中的空值和默认值
    const processedUsers = users.map(user => ({
      ...user,
      position: user.position && user.position !== '企业员工/创业公司员工' ? user.position : '暂未填写',
      company: user.company && user.company !== '互联网行业' ? user.company : '暂未填写'
    }))
    
    return NextResponse.json({
      users: processedUsers,
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