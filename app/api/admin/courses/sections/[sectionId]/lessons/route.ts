import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取该章节下的所有课程和课时
    const courses = await prisma.course.findMany({
      where: {
        sectionId: params.sectionId
      },
      include: {
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

    // 扁平化课时数据
    const lessons = courses.flatMap(course => 
      course.chapters.flatMap(chapter => 
        chapter.lessons.map(lesson => ({
          ...lesson,
          courseName: course.title,
          chapterName: chapter.title
        }))
      )
    );

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Failed to fetch lessons:', error);
    return NextResponse.json(
      { error: '获取课时失败' },
      { status: 500 }
    );
  }
}