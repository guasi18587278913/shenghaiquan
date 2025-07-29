import { notFound } from 'next/navigation';
import { getSection, getLesson } from '@/lib/course-data';
import CourseDetailClient from './course-detail-client';

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ sectionSlug: string; courseSlug: string }>
}) {
  const { sectionSlug, courseSlug } = await params;
  
  // 服务端获取数据
  const section = getSection(sectionSlug);
  
  if (!section) {
    notFound();
  }
  
  const courseData = section.courses?.find(c => c.slug === courseSlug);
  
  if (!courseData) {
    notFound();
  }
  
  // 预处理课程数据
  const processedCourse = {
    ...courseData,
    section: {
      id: section.id,
      title: section.title,
      slug: section.slug
    }
  };
  
  return <CourseDetailClient initialCourse={processedCourse} />;
}