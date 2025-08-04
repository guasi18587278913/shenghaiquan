import { notFound } from 'next/navigation';
import { getSection, getLesson, StrapiLesson, StrapiModule } from '@/lib/strapi-api';
import CourseraStyleClient from './coursera-style-client';

interface PageProps {
  params: Promise<{ sectionSlug: string; courseSlug: string }>
}

export default async function CourseraStylePage({ params }: PageProps) {
  const { sectionSlug, courseSlug } = await params;
  
  // 从Strapi获取数据
  const section = await getSection(sectionSlug);
  if (!section) {
    notFound();
  }
  
  const lesson = await getLesson(courseSlug);
  if (!lesson || !lesson.modules || lesson.modules.length === 0) {
    // 如果没有modules，尝试创建一个默认的video module（向后兼容）
    if (lesson && lesson.videoUrl) {
      const defaultModule: StrapiModule = {
        id: 0,
        documentId: 'default',
        title: lesson.title,
        type: 'video',
        order: 0,
        content: lesson.content,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
        publishedAt: lesson.publishedAt
      };
      lesson.modules = [defaultModule];
    } else {
      notFound();
    }
  }
  
  return <CourseraStyleClient section={section} lesson={lesson} />;
}