import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取所有章节及其相关数据
    const sections = await prisma.courseSection.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        courses: {
          include: {
            chapters: {
              include: {
                lessons: true
              }
            }
          }
        }
      }
    });

    // 格式化数据
    const formattedData = sections.map(section => ({
      id: section.id,
      title: section.title,
      slug: section.slug,
      description: section.description || '',
      createdAt: section.createdAt.toISOString(),
      order: section.order,
      courses: section.courses,
      _count: {
        courses: section.courses.length
      },
      totalLessons: section.courses.reduce((acc, course) => 
        acc + course.chapters.reduce((chapterAcc, chapter) => 
          chapterAcc + chapter.lessons.length, 0
        ), 0
      )
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Failed to fetch course data:', error);
    return NextResponse.json(
      { error: '获取数据失败' },
      { status: 500 }
    );
  }
}