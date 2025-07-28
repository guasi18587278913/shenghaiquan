import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    const sections = await prisma.courseSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        courses: {
          orderBy: { order: 'asc' },
          include: {
            chapters: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    // 转换数据格式以适配管理界面
    const formattedSections = sections.map(section => {
      const lessons: any[] = [];
      
      // 收集所有课时
      section.courses.forEach(course => {
        course.chapters.forEach(chapter => {
          chapter.lessons.forEach(lesson => {
            lessons.push({
              title: lesson.title,
              type: lesson.type,
              content: lesson.content || '',
              videoUrl: lesson.videoId,
              duration: lesson.videoDuration,
              isFree: lesson.isFree,
              order: lesson.order
            });
          });
        });
      });

      return {
        id: section.id,
        title: section.title,
        slug: section.slug,
        description: section.description || '',
        order: section.order,
        lessons
      };
    });

    return NextResponse.json(formattedSections);
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    // 如果没有数据，返回空数组而不是错误
    return NextResponse.json([]);
  }
}