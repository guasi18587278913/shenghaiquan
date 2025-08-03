import { notFound } from 'next/navigation';
import { getSection, getCourse } from '@/lib/course-data';
import CourseDetailClient from './course-detail-client';
import { getCourseWithContent } from '@/lib/db-direct';

// 尝试从数据库获取数据的函数
async function fetchFromDatabase(sectionSlug: string, courseSlug: string) {
  try {
    // 使用直接数据库连接
    const courseData = await getCourseWithContent(sectionSlug, courseSlug);
    
    if (courseData) {
      // 转换数据格式，将章节中的课时展平
      const lessons = courseData.chapters.flatMap((chapter: any) => 
        (chapter.lessons || []).map((lesson: any, index: number) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          slug: `lesson-${chapter.order}-${lesson.order}`,
          type: lesson.type === 'VIDEO_TEXT' ? 'video' : 'article',
          content: lesson.content,
          videoId: lesson.videoId,
          videoDuration: lesson.videoDuration,
          duration: lesson.videoDuration ? `${Math.floor(lesson.videoDuration / 60)}分钟` : '5分钟',
          order: chapter.order * 100 + lesson.order, // 确保顺序正确
          isFree: lesson.isFree,
          chapterTitle: chapter.title
        }))
      );

      return {
        id: courseData.section_slug,
        title: courseData.section_title,
        slug: courseData.section_slug,
        description: courseData.description,
        lessons,
        section: {
          id: courseData.section_slug,
          title: courseData.section_title,
          slug: courseData.section_slug
        },
        currentCourseSlug: courseSlug,
        currentCourse: {
          id: courseData.id,
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          chapters: courseData.chapters
        }
      };
    }
  } catch (error) {
    console.log('Database fetch failed, will use static data');
  }
  
  return null;
}

export default async function CourseDetailPageHybrid({
  params
}: {
  params: Promise<{ sectionSlug: string; courseSlug: string }>
}) {
  const { sectionSlug, courseSlug } = await params;
  
  // 首先尝试从数据库获取
  let processedData = await fetchFromDatabase(sectionSlug, courseSlug);
  
  // 如果数据库没有数据，使用静态数据
  if (!processedData) {
    const section = getSection(sectionSlug);
    if (!section) {
      notFound();
    }
    
    const courseData = getCourse(sectionSlug, courseSlug);
    if (!courseData) {
      notFound();
    }
    
    processedData = {
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
  }
  
  return <CourseDetailClient initialCourse={processedData} />;
}