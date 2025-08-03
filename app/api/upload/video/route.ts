import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '没有文件上传' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mov', 'video/avi'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的视频格式' }, { status: 400 });
    }

    // 验证文件大小（最大500MB）
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '视频文件太大，最大支持500MB' }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = path.extname(file.name);
    const fileName = `${timestamp}-${randomString}${fileExt}`;
    
    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    await mkdir(uploadDir, { recursive: true });
    
    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // 返回视频URL
    const videoUrl = `/uploads/videos/${fileName}`;
    
    return NextResponse.json({
      success: true,
      data: {
        url: videoUrl,
        fileName: fileName,
        size: file.size,
        originalName: file.name,
        duration: null // 视频时长需要额外处理
      }
    });
    
  } catch (error) {
    console.error('视频上传错误:', error);
    return NextResponse.json(
      { error: '视频上传失败' },
      { status: 500 }
    );
  }
}

// 配置大文件上传
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};