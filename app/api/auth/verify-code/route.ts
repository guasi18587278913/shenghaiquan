import { NextResponse } from 'next/server';
import { verifyCode } from '../send-code/route';

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { valid: false, error: '参数错误' },
        { status: 400 }
      );
    }

    const isValid = verifyCode(phone, code);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('验证码验证错误:', error);
    return NextResponse.json(
      { valid: false, error: '验证失败' },
      { status: 500 }
    );
  }
}