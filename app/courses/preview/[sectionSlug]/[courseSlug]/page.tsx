'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, FileText, Video } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string;
  videoId?: string;
  videoDuration: number;
  isFree: boolean;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
  section: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CoursePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    fetchCourseData();
  }, [params.sectionSlug, params.courseSlug]);

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/courses/preview/${params.sectionSlug}/${params.courseSlug}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data);
        // 默认选择第一个课时
        if (data.chapters.length > 0 && data.chapters[0].lessons.length > 0) {
          setSelectedLesson(data.chapters[0].lessons[0]);
        }
      } else {
        console.error('课程未找到');
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载课程内容...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">课程未找到</h2>
          <button
            onClick={() => router.push('/courses')}
            className="text-blue-600 hover:underline"
          >
            返回课程列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                返回
              </button>
              <div>
                <h1 className="text-xl font-bold">{course.title}</h1>
                <p className="text-sm text-gray-600">{course.section.title}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：课程大纲 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">课程大纲</h2>
              {course.chapters.map((chapter) => (
                <div key={chapter.id} className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">{chapter.title}</h3>
                  <div className="space-y-2">
                    {chapter.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedLesson?.id === lesson.id
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {lesson.type === 'VIDEO_TEXT' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          <span className="text-sm">{lesson.title}</span>
                        </div>
                        {lesson.videoDuration > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {Math.floor(lesson.videoDuration / 60)}分钟
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：课程内容 */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6">{selectedLesson.title}</h2>
                
                {selectedLesson.type === 'VIDEO_TEXT' && selectedLesson.videoId && (
                  <div className="mb-8 bg-gray-100 rounded-lg p-8 text-center">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">视频内容</p>
                    <p className="text-sm text-gray-500 mt-2">Video ID: {selectedLesson.videoId}</p>
                  </div>
                )}

                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      img: ({ src, alt }) => (
                        <img
                          src={src}
                          alt={alt || '图片'}
                          className="max-w-full h-auto rounded-lg shadow-md my-4"
                        />
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 leading-relaxed">{children}</p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>
                      ),
                      li: ({ children }) => (
                        <li className="ml-4">{children}</li>
                      ),
                      code: ({ inline, children }) => 
                        inline ? (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>
                        ) : (
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                            <code>{children}</code>
                          </pre>
                        )
                    }}
                  >
                    {selectedLesson.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">请从左侧选择一个课时开始学习</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}