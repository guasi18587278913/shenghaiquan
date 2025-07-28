import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, phone, password } = await request.json();

    // 验证输入
    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '请输入正确的手机号' },
        { status: 400 }
      );
    }

    // 检查手机号是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该手机号已被注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        email: `${phone}@example.com`, // 临时邮箱，可以后续让用户更新
        role: 'USER',
      },
    });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '注册成功',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}