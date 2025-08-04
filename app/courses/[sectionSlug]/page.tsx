import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, BookOpen, Video, FileText, Code, Users, ChevronRight } from 'lucide-react';
import { getSectionLessons, getSection } from '@/lib/strapi-api';
import { getSection as getStaticSection } from '@/lib/course-data';
import RoboNuggetsStyle from './robonuggets-style';
import RoboNuggetsWithStrapi from './robonuggets-with-strapi';

interface PageProps {
  params: Promise<{ sectionSlug: string }>
}

// 获取模块类型的图标
function getModuleIcon(type: string) {
  switch (type) {
    case 'video': return <Video className="w-4 h-4" />;
    case 'reading': return <FileText className="w-4 h-4" />;
    case 'assignment': return <Code className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
}

// 获取模块类型的中文名
function getModuleTypeName(type: string) {
  switch (type) {
    case 'video': return '视频';
    case 'reading': return '阅读';
    case 'assignment': return '作业';
    case 'discussion': return '讨论';
    default: return '学习';
  }
}

export default async function SectionCoursesPage({ params }: PageProps) {
  const { sectionSlug } = await params;
  
  // 尝试从Strapi获取数据
  let sectionData = await getSection(sectionSlug);
  let lessons = await getSectionLessons(sectionData?.id || 0);
  
  // 如果是基础篇，使用 RoboNuggets 风格
  if (sectionSlug === 'basic') {
    // 如果有 Strapi 数据，使用带数据的版本
    if (sectionData && lessons && lessons.length > 0) {
      console.log('Found lessons:', lessons.length);
      return <RoboNuggetsWithStrapi section={sectionData} lessons={lessons} />;
    } else {
      // 否则使用静态版本
      console.log('No lessons found, using static version');
      return <RoboNuggetsStyle sectionSlug={sectionSlug} sectionTitle="基础篇" />;
    }
  }
  
  // 如果Strapi没有数据，使用静态数据
  if (!sectionData || lessons.length === 0) {
    const staticSection = getStaticSection(sectionSlug);
    if (!staticSection) {
      notFound();
    }
    
    // 转换静态数据格式
    sectionData = {
      id: 0,
      documentId: sectionSlug,
      title: staticSection.title,
      slug: staticSection.slug,
      description: staticSection.description,
      order: 0,
      createdAt: '',
      updatedAt: '',
      publishedAt: ''
    };
    
    // 使用静态课程数据
    lessons = staticSection.lessons.map((lesson: any, index: number) => ({
      id: index,
      documentId: `static-${index}`,
      title: lesson.title,
      slug: lesson.slug,
      description: lesson.description,
      videoUrl: lesson.videoId ? `https://example.com/video/${lesson.videoId}` : undefined,
      duration: lesson.duration,
      order: index,
      modules: [], // 静态数据没有modules
      createdAt: '',
      updatedAt: '',
      publishedAt: ''
    }));
  }
  
  // 获取篇章的样式类
  const getSectionStyle = (slug: string) => {
    switch (slug) {
      case 'preface':
        return 'bg-gradient-to-br from-teal-500 to-cyan-600';
      case 'basic':
        return 'bg-gradient-to-br from-purple-500 to-indigo-600';
      case 'core':
        return 'bg-gradient-to-br from-orange-500 to-red-600';
      case 'advanced':
        return 'bg-gradient-to-br from-pink-500 to-rose-600';
      case 'appendix':
        return 'bg-gradient-to-br from-gray-600 to-gray-800';
      default:
        return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <nav className="flex items-center space-x-2 text-sm">
              <Link href="/courses" className="text-gray-500 hover:text-gray-700">
                课程
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">{sectionData.title}</span>
            </nav>
          </div>
        </div>
      </div>
      
      {/* 篇章头部 */}
      <div className={`${getSectionStyle(sectionSlug)} text-white`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">{sectionData.title}</h1>
          {sectionData.description && (
            <p className="text-xl opacity-90 max-w-3xl">{sectionData.description}</p>
          )}
          <div className="mt-6 flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>{lessons.length} 节课程</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>约 {lessons.length * 30} 分钟</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 课程列表 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/courses/${sectionSlug}/${lesson.slug}`}
              className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {/* 课程封面 */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-gray-300">
                      {index + 1}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">第 {index + 1} 课</div>
                  </div>
                </div>
              </div>
              
              {/* 课程信息 */}
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {lesson.title}
                </h3>
                
                {lesson.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {lesson.description}
                  </p>
                )}
                
                {/* 模块信息 */}
                {lesson.modules && lesson.modules.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {lesson.modules.slice(0, 3).map((module: any) => (
                        <div
                          key={module.id}
                          className="flex items-center space-x-1 text-xs text-gray-500"
                        >
                          {getModuleIcon(module.type)}
                          <span>{getModuleTypeName(module.type)}</span>
                        </div>
                      ))}
                      {lesson.modules.length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{lesson.modules.length - 3} 更多
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {lesson.videoUrl && (
                      <div className="flex items-center space-x-1">
                        <Video className="w-4 h-4" />
                        <span>视频课程</span>
                      </div>
                    )}
                    {lesson.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 开始学习按钮 */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {lesson.modules ? `${lesson.modules.length} 个学习模块` : '立即开始'}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* 如果没有课程 */}
        {lessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">该篇章暂无课程</p>
          </div>
        )}
      </div>
    </div>
  );
}