import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verificationCodes } from '@/lib/auth/verification';

// 生成6位随机验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 清理过期验证码
function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [phone, data] of verificationCodes.entries()) {
    if (now - data.timestamp > 5 * 60 * 1000) { // 5分钟过期
      verificationCodes.delete(phone);
    }
  }
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: '请输入正确的手机号' },
        { status: 400 }
      );
    }

    // 检查手机号是否存在（可选：如果只允许已注册用户使用验证码登录）
    // const user = await prisma.user.findUnique({
    //   where: { phone },
    // });
    // if (!user) {
    //   return NextResponse.json(
    //     { error: '该手机号尚未注册' },
    //     { status: 400 }
    //   );
    // }

    // 清理过期验证码
    cleanupExpiredCodes();

    // 检查是否频繁发送
    const existing = verificationCodes.get(phone);
    if (existing && Date.now() - existing.timestamp < 60 * 1000) {
      return NextResponse.json(
        { error: '请等待60秒后再次发送' },
        { status: 429 }
      );
    }

    // 生成验证码
    const code = generateCode();
    verificationCodes.set(phone, {
      code,
      timestamp: Date.now(),
    });

    // TODO: 集成短信服务发送验证码
    // 这里需要您配置腾讯云短信服务
    // 示例代码：
    /*
    const smsClient = new SmsClient({
      credential: {
        secretId: process.env.TENCENT_SECRET_ID,
        secretKey: process.env.TENCENT_SECRET_KEY,
      },
      region: "ap-guangzhou",
    });

    await smsClient.SendSms({
      PhoneNumberSet: [`+86${phone}`],
      SmsSdkAppId: process.env.SMS_SDK_APP_ID,
      SignName: "深海圈",
      TemplateId: process.env.SMS_TEMPLATE_ID,
      TemplateParamSet: [code, "5"],
    });
    */

    // 开发环境返回验证码（生产环境删除）
    const response: any = { success: true, message: '验证码已发送' };
    if (process.env.NODE_ENV === 'development') {
      response.code = code; // 仅开发环境
      console.log(`验证码已发送至 ${phone}: ${code}`);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('发送验证码错误:', error);
    return NextResponse.json(
      { error: '发送失败，请稍后重试' },
      { status: 500 }
    );
  }
}

