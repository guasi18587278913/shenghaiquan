import { NextRequest, NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const courseId = formData.get('courseId') as string;
    const sectionId = formData.get('sectionId') as string;
    const type = formData.get('type') as string;

    if (!file || !courseId || !sectionId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 读取文件内容
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 生成存储路径
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // 根据类型组织存储路径
    let folder = 'content';
    if (type === 'video') folder = 'videos';
    else if (type === 'pdf') folder = 'documents';
    else if (type === 'image') folder = 'images';
    
    const key = `courses/${sectionId}/${courseId}/${folder}/${fileName}`;

    // 上传到COS（私有存储）
    await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.COS_PRIVATE_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: key,
        Body: buffer,
        ACL: 'private', // 私有权限
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
      type: type,
      message: '内容已成功上传到私有存储'
    });

  } catch (error: any) {
    console.error('上传错误:', error);
    return NextResponse.json({ 
      error: error.message || '上传失败' 
    }, { status: 500 });
  }
}