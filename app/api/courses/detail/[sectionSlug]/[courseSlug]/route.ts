import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ sectionSlug: string; courseSlug: string }> }
) {
  try {
    const params = await props.params;
    const { sectionSlug, courseSlug } = params;

    const course = await prisma.course.findFirst({
      where: {
        slug: courseSlug,
        section: {
          slug: sectionSlug
        },
        isPublished: true
      },
      include: {
        section: true,
        chapters: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                type: true,
                videoDuration: true,
                isFree: true,
                content: true,
                videoId: true
              }
            }
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Failed to fetch course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}