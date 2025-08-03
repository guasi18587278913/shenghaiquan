import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const params = await context.params;
    const { lessonId } = params;
    const data = await request.json();

    // 更新课时内容
    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        content: data.content,
        videoId: data.videoId,
        // 如果有视频ID，可以后续通过腾讯云API获取视频时长
        videoDuration: data.videoDuration || 0
      }
    });

    return NextResponse.json({ 
      success: true, 
      lesson,
      message: '课时内容更新成功'
    });

  } catch (error: any) {
    console.error('更新课时失败:', error);
    return NextResponse.json(
      { 
        error: '更新失败', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ lessonId: string }> }
) {
  try {
    const params = await context.params;
    const { lessonId } = params;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        chapter: {
          include: {
            course: {
              include: {
                section: true
              }
            }
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json(
        { error: '课时未找到' },
        { status: 404 }
      );
    }

    return NextResponse.json(lesson);
  } catch (error) {
    console.error('获取课时失败:', error);
    return NextResponse.json(
      { error: '获取失败' },
      { status: 500 }
    );
  }
}