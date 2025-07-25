import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // 验证参数
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: '请提供当前密码和新密码' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码长度至少为6位' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '当前密码不正确' },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: '密码修改成功' })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: '修改密码失败' },
      { status: 500 }
    )
  }
}