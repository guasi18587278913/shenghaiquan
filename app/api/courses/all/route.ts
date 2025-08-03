import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 获取所有章节及其课程
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
                  orderBy: { order: 'asc' },
                  select: {
                    id: true,
                    title: true,
                    content: true,
                    type: true,
                    videoId: true,
                    videoDuration: true,
                    isFree: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Failed to fetch all courses:', error);
    return NextResponse.json(
      { error: '获取课程失败' },
      { status: 500 }
    );
  }
}