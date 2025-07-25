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
        isActive: true,
        createdAt: true,
        // 关联数据统计
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
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
        const parsedSkills = typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills
        // 确保是数组格式
        skills = Array.isArray(parsedSkills) ? parsedSkills : [parsedSkills]
      }
    } catch (e) {
      // 如果JSON解析失败，尝试按逗号分割
      if (user.skills && typeof user.skills === 'string') {
        skills = user.skills.split(',').map(s => s.trim()).filter(Boolean)
      }
    }
    
    // 如果skills还是空的，提供默认值
    if (skills.length === 0) {
      skills = ['深海圈成员']
    }
    
    // 从bio中提取干净的简介（去掉微信ID和资源信息）
    let cleanBio = user.bio || ''
    if (cleanBio) {
      const bioLines = cleanBio.split('\n')
      // 过滤掉微信ID和资源信息行
      cleanBio = bioLines
        .filter(line => !line.startsWith('微信ID:') && !line.startsWith('可提供的资源:'))
        .join(' ')
        .trim()
    }
    
    // 处理空值和默认值
    const processedUser = {
      ...user,
      bio: cleanBio || '这位同学还没有填写个人简介',
      company: user.company || '深海圈',
      position: user.position || '成员',
      location: user.location || '中国'
    }
    
    // 构建返回数据
    const userData = {
      ...processedUser,
      skills,
      // 使用真实的统计数据
      followers: user._count.followers,
      following: user._count.following,
      projects: user._count.posts,
      verified: user.level >= 5 || user.role === 'ADMIN',
      status: user.isActive ? 'online' : 'offline',
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