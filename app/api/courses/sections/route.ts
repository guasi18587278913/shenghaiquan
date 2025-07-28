import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sections = await prisma.courseSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        courses: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            totalLessons: true,
            totalDuration: true,
          }
        }
      }
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}