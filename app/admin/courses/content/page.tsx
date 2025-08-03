'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Edit,
  Plus,
  Eye,
  Lock,
  Unlock,
  Video,
  FileText,
  Clock
} from 'lucide-react';
import { courseSections } from '@/lib/course-data';

export default function CourseContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // 检查权限
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // 统计数据
  const stats = {
    totalSections: Object.keys(courseSections).length,
    totalLessons: Object.values(courseSections).reduce((acc, section) => acc + section.lessons.length, 0),
    freeLessons: Object.values(courseSections).reduce((acc, section) => 
      acc + section.lessons.filter(lesson => lesson.isFree).length, 0
    ),
    totalDuration: Object.values(courseSections).reduce((acc, section) => 
      acc + section.lessons.reduce((lessonAcc, lesson) => {
        const duration = parseInt(lesson.duration || '0');
        return lessonAcc + duration;
      }, 0), 0
    )
  };

  if (status === 'loading') {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">课程内容管理</h1>
        <p className="text-gray-600">管理和查看所有课程内容</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="w-10 h-10 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">章节数</p>
              <p className="text-2xl font-bold">{stats.totalSections}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="w-10 h-10 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">课时总数</p>
              <p className="text-2xl font-bold">{stats.totalLessons}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Unlock className="w-10 h-10 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">免费课时</p>
              <p className="text-2xl font-bold">{stats.freeLessons}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-10 h-10 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">总时长</p>
              <p className="text-2xl font-bold">{stats.totalDuration}分钟</p>
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mb-6">
        <Link href="/admin/courses/import" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          导入新课程
        </Link>
        <Link href="/admin/courses" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Edit className="w-5 h-5" />
          快速添加内容
        </Link>
      </div>

      {/* 课程列表 */}
      <div className="space-y-4">
        {Object.entries(courseSections).map(([key, section]) => (
          <div key={key} className="bg-white rounded-lg shadow">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection(key)}
            >
              <div className="flex items-center gap-3">
                {expandedSections.has(key) ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
                <h3 className="text-xl font-semibold">{section.title}</h3>
                <span className="text-sm text-gray-500">({section.lessons.length} 课时)</span>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href={`/courses/${section.slug}/${section.lessons[0]?.slug || ''}`} 
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Eye className="w-4 h-4" />
                  预览
                </Link>
              </div>
            </div>

            {expandedSections.has(key) && (
              <div className="border-t">
                <div className="p-4">
                  <p className="text-gray-600 mb-4">{section.description}</p>
                  
                  <div className="space-y-2">
                    {section.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                          {lesson.type === 'video' ? (
                            <Video className="w-5 h-5 text-blue-500" />
                          ) : (
                            <FileText className="w-5 h-5 text-green-500" />
                          )}
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{lesson.duration || '5分钟'}</span>
                              {lesson.isFree ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <Unlock className="w-3 h-3" />
                                  免费
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-gray-400">
                                  <Lock className="w-3 h-3" />
                                  付费
                                </span>
                              )}
                              {lesson.isNew && (
                                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs">新</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/courses/${section.slug}/${lesson.slug}`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            查看
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}