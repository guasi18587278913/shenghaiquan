import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ sectionSlug: string }> }
) {
  try {
    const params = await props.params;
    const { sectionSlug } = params;

    // 获取章节及其课时
    const section = await prisma.courseSection.findFirst({
      where: {
        slug: sectionSlug,
        isPublished: true
      },
      include: {
        course: true,
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            content: true,
            videoUrl: true,
            duration: true,
            isFree: true,
            order: true
          }
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: '章节未找到' },
        { status: 404 }
      );
    }

    // 转换为页面期望的格式
    const courseData = {
      id: section.courseId,
      title: section.title,
      description: section.description,
      chapters: [{
        id: section.id,
        title: section.title,
        lessons: section.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          videoUrl: lesson.videoUrl,
          videoDuration: lesson.duration,
          isFree: lesson.isFree,
          order: lesson.order
        }))
      }]
    };

    return NextResponse.json(courseData);
  } catch (error) {
    console.error('获取章节失败:', error);
    return NextResponse.json(
      { error: '获取章节失败' },
      { status: 500 }
    );
  }
}