import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')
    
    if (!name) {
      return NextResponse.json({ error: '需要提供用户名' }, { status: 400 })
    }
    
    // 获取用户信息
    const user = await prisma.user.findFirst({
      where: {
        name: name
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        company: true,
        position: true,
        skills: true,
        role: true,
        level: true,
        points: true,
        createdAt: true,
        // 关注者和项目数量需要从关联表查询，暂时模拟
        _count: {
          select: {
            posts: true,
            articles: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }
    
    // 处理skills字段
    let skills = []
    try {
      if (user.skills) {
        skills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills
      }
    } catch (e) {
      skills = []
    }
    
    // 处理空值和默认值
    const processedUser = {
      ...user,
      bio: user.bio && user.bio !== '无' ? user.bio : '这位同学还没有填写个人简介',
      company: user.company && user.company !== '互联网行业' ? user.company : '暂未填写',
      position: user.position && user.position !== '企业员工/创业公司员工' ? user.position : '暂未填写',
      location: user.location || '暂未填写'
    }
    
    // 构建返回数据
    const userData = {
      ...processedUser,
      skills,
      // 模拟一些额外数据
      followers: Math.floor(Math.random() * 5000) + 100,
      following: Math.floor(Math.random() * 500) + 50,
      projects: user._count.posts + user._count.articles,
      verified: user.level >= 5,
      status: Math.random() > 0.5 ? 'online' : 'offline',
      joinDate: user.createdAt.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return NextResponse.json(userData)
    
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}