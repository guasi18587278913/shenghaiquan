'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Play, FileText, Clock, Lock, ChevronRight } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: string;
  isFree: boolean;
  duration?: number;
  order: number;
}

interface Section {
  id: string;
  title: string;
  slug: string;
  description: string;
  lessons: Lesson[];
}

export default function SimpleCoursePage() {
  const { data: session } = useSession();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/courses/sections');
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">课程列表</h1>
        
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                <p className="text-gray-600">{section.description}</p>
                <p className="text-sm text-gray-500 mt-1">
                  URL: /courses/{section.slug} | 共 {section.lessons.length} 课时
                </p>
              </div>
              
              <div className="space-y-3">
                {section.lessons.map((lesson, index) => {
                  const isLocked = !lesson.isFree && !session;
                  
                  return (
                    <Link
                      key={lesson.id}
                      href={isLocked ? '/login' : `/courses/${section.slug}/${lesson.order}`}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isLocked 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                          {lesson.order}
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.type === 'VIDEO_TEXT' ? (
                            <Play className="w-4 h-4 text-gray-500" />
                          ) : (
                            <FileText className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="font-medium">{lesson.title}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {lesson.duration && (
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(lesson.duration / 60)}分钟
                          </span>
                        )}
                        {lesson.isFree && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            免费
                          </span>
                        )}
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
              
              <div className="mt-6 flex gap-4">
                <Link
                  href={`/courses/${section.slug}/1`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  开始学习
                </Link>
                <Link
                  href={`/admin/courses`}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900"
                >
                  管理课程
                </Link>
              </div>
            </div>
          ))}
        </div>

        {sections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">暂无课程</p>
            <Link
              href="/admin/courses"
              className="text-blue-600 hover:text-blue-700"
            >
              去创建课程 →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}