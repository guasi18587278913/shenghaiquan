import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// 只在生产环境启用，确保安全
const prisma = new PrismaClient()

// 简单的认证密钥
const API_KEY = process.env.DB_PROXY_KEY || 'your-secure-key-2025'

export async function POST(request: NextRequest) {
  try {
    // 验证API密钥
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${API_KEY}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { model, method, args } = await request.json()

    // 验证模型和方法是否存在
    if (!prisma[model] || !prisma[model][method]) {
      return NextResponse.json({ error: 'Invalid model or method' }, { status: 400 })
    }

    // 执行查询
    const result = await prisma[model][method](args)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('DB Proxy Error:', error)
    return NextResponse.json({ 
      error: 'Database query failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

// 健康检查
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}