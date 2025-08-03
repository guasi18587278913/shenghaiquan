import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ sectionSlug: string; courseSlug: string }> }
) {
  try {
    const params = await context.params;
    const { sectionSlug, courseSlug } = params;
    
    console.log('查找课程 - sectionSlug:', sectionSlug, 'courseSlug:', courseSlug);

    // 查找课程
    const course = await prisma.course.findFirst({
      where: {
        slug: courseSlug,
        section: {
          slug: sectionSlug
        }
      },
      include: {
        section: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        },
        chapters: {
          include: {
            lessons: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      // 尝试查找该章节下的任何课程
      const sectionCourses = await prisma.course.findMany({
        where: {
          section: {
            slug: sectionSlug
          }
        },
        select: {
          slug: true,
          title: true
        }
      });
      
      console.log('未找到课程，该章节下的课程有:', sectionCourses);
      
      return NextResponse.json(
        { 
          error: '课程未找到',
          availableCourses: sectionCourses,
          requestedSlug: courseSlug
        },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Failed to fetch course:', error);
    return NextResponse.json(
      { error: '获取课程失败' },
      { status: 500 }
    );
  }
}