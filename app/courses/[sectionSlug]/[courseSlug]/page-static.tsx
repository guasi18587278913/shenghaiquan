import { notFound } from 'next/navigation';
import { getSection, getCourse } from '@/lib/course-data';
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
  
  const courseData = getCourse(sectionSlug, courseSlug);
  
  if (!courseData) {
    notFound();
  }
  
  // 预处理章节数据，包含所有课程和当前选中的课程
  const processedData = {
    id: section.id,
    title: section.title,
    slug: section.slug,
    description: section.description,
    lessons: section.lessons,
    section: {
      id: section.id,
      title: section.title,
      slug: section.slug
    },
    currentCourseSlug: courseSlug,
    currentCourse: courseData
  };
  
  return <CourseDetailClient initialCourse={processedData} />;
}