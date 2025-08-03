import { notFound } from 'next/navigation';
import { getSection, getLesson } from '@/lib/strapi-api';

// 课程详情页面 - 从 Strapi 获取数据
export default async function StrapiCourseDetailPage({
  params
}: {
  params: Promise<{ sectionSlug: string; lessonSlug: string }>
}) {
  const { sectionSlug, lessonSlug } = await params;
  
  // 从 Strapi 获取数据
  const section = await getSection(sectionSlug);
  if (!section) {
    notFound();
  }
  
  const lesson = await getLesson(lessonSlug);
  if (!lesson) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* 面包屑导航 */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <a href="/courses" className="text-blue-600 hover:text-blue-800">
                课程列表
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li>
              <a href={`/courses/strapi/${sectionSlug}`} className="text-blue-600 hover:text-blue-800">
                {section.title}
              </a>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-700">{lesson.title}</li>
          </ol>
        </nav>
        
        {/* 课程标题 */}
        <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
        
        {/* 课程元信息 */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-8">
          {lesson.duration && (
            <span>时长: {lesson.duration}</span>
          )}
          {lesson.videoUrl && (
            <span className="text-blue-600">包含视频</span>
          )}
        </div>
        
        {/* 视频播放器 */}
        {lesson.videoUrl && (
          <div className="mb-8">
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden">
              <video 
                controls 
                className="w-full h-full"
                src={lesson.videoUrl}
              >
                您的浏览器不支持视频播放
              </video>
            </div>
          </div>
        )}
        
        {/* 课程内容 */}
        <div className="prose prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: lesson.content }}
            className="content-container"
          />
        </div>
      </div>
      
      <style jsx global>{`
        .content-container img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        .content-container table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        .content-container td, .content-container th {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
        }
        .content-container th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}