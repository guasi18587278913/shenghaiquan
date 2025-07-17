import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { phone, password, name } = await request.json()

    // 验证输入
    if (!phone || !password) {
      return NextResponse.json(
        { error: "手机号和密码不能为空" },
        { status: 400 }
      )
    }

    // 检查手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "请输入有效的手机号" },
        { status: 400 }
      )
    }

    // 检查密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少6位" },
        { status: 400 }
      )
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "该手机号已被注册" },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name: name || `用户${phone.slice(-4)}`,
      },
      select: {
        id: true,
        phone: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: "注册成功",
      user,
    })
  } catch (error) {
    console.error("注册错误:", error)
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}