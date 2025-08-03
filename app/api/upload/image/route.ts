import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
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
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 });
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = path.extname(file.name);
    const fileName = `${timestamp}-${randomString}${fileExt}`;
    
    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    await mkdir(uploadDir, { recursive: true });
    
    // 保存原始文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 使用 sharp 压缩图片
    const compressedBuffer = await sharp(buffer)
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    // 保存压缩后的图片
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, compressedBuffer);
    
    // 生成缩略图
    const thumbnailName = `thumb-${fileName}`;
    const thumbnailPath = path.join(uploadDir, thumbnailName);
    
    await sharp(buffer)
      .resize(400, 300, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    // 返回图片URL
    const imageUrl = `/uploads/images/${fileName}`;
    const thumbnailUrl = `/uploads/images/${thumbnailName}`;
    
    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        thumbnailUrl: thumbnailUrl,
        fileName: fileName,
        size: compressedBuffer.length,
        originalName: file.name
      }
    });
    
  } catch (error) {
    console.error('图片上传错误:', error);
    return NextResponse.json(
      { error: '图片上传失败' },
      { status: 500 }
    );
  }
}