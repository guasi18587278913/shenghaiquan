import { NextRequest, NextResponse } from 'next/server';

// 直接使用HTTP请求访问远程数据库API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sectionSlug = searchParams.get('section');
  const courseSlug = searchParams.get('course');

  try {
    // 使用远程服务器的API获取数据
    const response = await fetch(`http://111.231.19.162:3000/api/courses/sections`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from remote server');
    }

    const sections = await response.json();
    
    // 如果需要特定的section或course
    if (sectionSlug) {
      const section = sections.find((s: any) => s.slug === sectionSlug);
      if (courseSlug && section) {
        const course = section.courses?.find((c: any) => c.slug === courseSlug);
        return NextResponse.json({ section, course });
      }
      return NextResponse.json({ section });
    }

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}