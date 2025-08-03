import { notFound } from 'next/navigation';
import CourseDetailClient from './course-detail-client';

async function fetchCourseFromDB(sectionSlug: string, courseSlug: string) {
  try {
    // 首先尝试从本地API获取
    const localUrl = `http://localhost:3000/api/courses/db?section=${sectionSlug}&course=${courseSlug}`;
    const response = await fetch(localUrl, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Local fetch failed');
    }

    return await response.json();
  } catch (error) {
    // 如果本地失败，尝试从远程服务器获取
    try {
      const remoteUrl = `http://111.231.19.162:3000/api/courses/sections`;
      const response = await fetch(remoteUrl, {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Remote fetch failed');
      }

      const sections = await response.json();
      const section = sections.find((s: any) => s.slug === sectionSlug);
      
      if (!section) return null;

      const course = section.courses?.find((c: any) => c.slug === courseSlug);
      return { section, course };
    } catch (err) {
      console.error('Failed to fetch from both sources:', err);
      return null;
    }
  }
}

export default async function CourseDetailPageDB({
  params
}: {
  params: Promise<{ sectionSlug: string; courseSlug: string }>
}) {
  const { sectionSlug, courseSlug } = await params;
  
  // 从数据库获取数据
  const data = await fetchCourseFromDB(sectionSlug, courseSlug);
  
  if (!data || !data.section) {
    notFound();
  }

  // 预处理数据，适配现有的组件格式
  const processedData = {
    id: data.section.id,
    title: data.section.title,
    slug: data.section.slug,
    description: data.section.description,
    lessons: data.section.courses || [], // 数据库中是courses，但组件需要lessons
    section: {
      id: data.section.id,
      title: data.section.title,
      slug: data.section.slug
    },
    currentCourseSlug: courseSlug,
    currentCourse: data.course || data.section.courses?.[0] // 如果没有找到特定课程，使用第一个
  };
  
  return <CourseDetailClient initialCourse={processedData} />;
}