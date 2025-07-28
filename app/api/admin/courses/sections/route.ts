import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 检查管理员权限
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  // 暂时允许所有登录用户，实际应该检查用户角色
  return !!session;
}

export async function POST(request: Request) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const data = await request.json();
    console.log('接收到的数据:', data);
    
    // 创建章节
    const section = await prisma.courseSection.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        order: data.order || 1,
        requiredTier: data.requiredTier || 'ANNUAL',
      }
    });

    // 创建课程（这里简化处理，一个章节对应一个课程）
    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        sectionId: section.id,
        order: 1,
      }
    });

    // 创建章节（课程内的章节）
    const chapter = await prisma.chapter.create({
      data: {
        title: '第1章',
        courseId: course.id,
        order: 1,
      }
    });

    // 创建课时
    if (data.lessons && data.lessons.length > 0) {
      for (let i = 0; i < data.lessons.length; i++) {
        const lesson = data.lessons[i];
        await prisma.lesson.create({
          data: {
            title: lesson.title || `课时${i + 1}`,
            type: lesson.type || 'TEXT_ONLY',
            content: lesson.content || '',
            videoId: lesson.videoUrl || null,
            videoDuration: lesson.duration || 0,
            chapterId: chapter.id,
            order: lesson.order || (i + 1),
            isFree: lesson.isFree || false,
          }
        });
      }
    }

    return NextResponse.json({ success: true, section });
  } catch (error: any) {
    console.error('Create section error:', error);
    return NextResponse.json(
      { 
        error: '创建失败', 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!await checkAdmin()) {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const data = await request.json();
    
    // 更新章节
    const section = await prisma.courseSection.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
      }
    });

    // 更新课程和课时（简化处理）
    // 实际应该更复杂的更新逻辑

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error('Update section error:', error);
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    );
  }
}