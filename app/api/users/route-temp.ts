import { NextResponse } from 'next/server'
import Database from 'better-sqlite3'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const search = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    
    // 使用 SQLite 直接连接
    const dbPath = path.join(process.cwd(), 'prisma/dev.db')
    const db = new Database(dbPath, { readonly: true })
    
    // 构建查询
    let whereClause = 'WHERE 1=1'
    const params: any = {}
    
    if (search) {
      whereClause += ' AND (name LIKE @search OR location LIKE @search OR company LIKE @search OR position LIKE @search)'
      params.search = `%${search}%`
    }
    
    if (city) {
      whereClause += ' AND (location = @city OR location LIKE @cityLike)'
      params.city = city
      params.cityLike = `%${city}%`
    }
    
    // 查询总数
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM User ${whereClause}`)
    const { count } = countStmt.get(params) as { count: number }
    
    // 查询用户列表
    const usersStmt = db.prepare(`
      SELECT id, name, avatar, location, company, position, bio, skills, level, points, role, createdAt
      FROM User 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT @limit OFFSET @offset
    `)
    
    const users = usersStmt.all({
      ...params,
      limit: pageSize,
      offset: (page - 1) * pageSize
    })
    
    // 处理数据
    const processedUsers = users.map((user: any) => {
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
        online: Math.random() > 0.7
      }
    })
    
    db.close()
    
    return NextResponse.json({
      users: processedUsers,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize)
    })
    
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}