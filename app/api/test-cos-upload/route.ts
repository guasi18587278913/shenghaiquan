import { NextRequest, NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查环境变量
    if (!process.env.COS_SECRET_ID || !process.env.COS_SECRET_KEY) {
      return NextResponse.json({ 
        error: '请先配置COS环境变量：COS_SECRET_ID 和 COS_SECRET_KEY' 
      }, { status: 500 });
    }

    if (!process.env.COS_PRIVATE_BUCKET || !process.env.COS_REGION) {
      return NextResponse.json({ 
        error: '请先配置COS环境变量：COS_PRIVATE_BUCKET 和 COS_REGION' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }

    // 初始化COS
    const cos = new COS({
      SecretId: process.env.COS_SECRET_ID,
      SecretKey: process.env.COS_SECRET_KEY,
    });

    // 生成文件名
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const key = `courses/${courseId}/content/${fileName}`;

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上传到COS（私有存储）
    const result = await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.COS_PRIVATE_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: key,
        Body: buffer,
        ACL: 'private', // 私有权限，重要！
        onProgress: (progressData) => {
          console.log('上传进度:', progressData);
        }
      }, (err, data) => {
        if (err) {
          console.error('COS上传错误:', err);
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    // 返回结果
    return NextResponse.json({
      success: true,
      contentKey: key,
      fileName: file.name,
      size: file.size,
      message: '文件已成功上传到私有存储！'
    });

  } catch (error: any) {
    console.error('上传错误:', error);
    return NextResponse.json({ 
      error: error.message || '上传失败，请检查配置' 
    }, { status: 500 });
  }
}