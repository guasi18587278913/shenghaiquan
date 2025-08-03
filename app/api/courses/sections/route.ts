import { NextResponse } from 'next/server';
import { getCourseSections } from '@/lib/db-direct';
import { courseSections } from '@/lib/course-data';

export async function GET() {
  try {
    // 尝试从数据库获取
    try {
      const sections = await getCourseSections();
      
      // 如果有数据，按照原API格式返回
      if (sections && sections.length > 0) {
        const formattedSections = sections.map((section: any) => ({
          id: section.id,
          title: section.title,
          slug: section.slug,
          description: section.description,
          order: section.order,
          icon: section.icon,
          color: section.color,
          _count: {
            courses: section.course_count
          }
        }));
        
        return NextResponse.json(formattedSections);
      }
    } catch (dbError) {
      console.log('Database error, falling back to static data:', dbError);
    }
    
    // 如果数据库失败，返回静态数据
    const staticSections = Object.values(courseSections).map(section => ({
      id: section.id,
      title: section.title,
      slug: section.slug,
      description: section.description,
      _count: {
        courses: section.lessons.length
      }
    }));
    
    return NextResponse.json(staticSections);
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}