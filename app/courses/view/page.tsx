'use client';

import { useState, useEffect } from 'react';
import { FileText, Video, ChevronRight, Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: string;
  videoId?: string;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  chapters: Chapter[];
}

interface Section {
  id: string;
  title: string;
  slug: string;
  courses: Course[];
}

export default function CourseViewPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      const response = await fetch('/api/courses/all');
      if (response.ok) {
        const data = await response.json();
        setSections(data);
        
        // 自动选择第一个课时
        if (data.length > 0 && data[0].courses.length > 0) {
          const firstCourse = data[0].courses[0];
          if (firstCourse.chapters.length > 0 && firstCourse.chapters[0].lessons.length > 0) {
            setSelectedLesson(firstCourse.chapters[0].lessons[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.courses.some(course => 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.chapters.some(chapter =>
        chapter.lessons.some(lesson =>
          lesson.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    )
  );

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">课程内容查看器</h1>
        
        {/* 搜索框 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索章节、课程或课时..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：课程目录 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">课程目录</h2>
              
              {filteredSections.map(section => (
                <div key={section.id} className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                    <ChevronRight className="w-4 h-4" />
                    {section.title}
                    <span className="text-xs text-gray-500">({section.slug})</span>
                  </h3>
                  
                  {section.courses.map(course => (
                    <div key={course.id} className="ml-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {course.title}
                      </h4>
                      
                      {course.chapters.map(chapter => (
                        <div key={chapter.id} className="ml-4">
                          <p className="text-xs text-gray-600 mb-1">{chapter.title}</p>
                          
                          {chapter.lessons.map(lesson => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLesson(lesson)}
                              className={`w-full text-left p-2 rounded text-sm mb-1 flex items-center gap-2 ${
                                selectedLesson?.id === lesson.id
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {lesson.type === 'VIDEO_TEXT' ? (
                                <Video className="w-3 h-3" />
                              ) : (
                                <FileText className="w-3 h-3" />
                              )}
                              {lesson.title}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：内容显示 */}
          <div className="lg:col-span-2">
            {selectedLesson ? (
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6">{selectedLesson.title}</h2>
                
                {selectedLesson.type === 'VIDEO_TEXT' && selectedLesson.videoId && (
                  <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">视频ID: {selectedLesson.videoId}</p>
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
                      )
                    }}
                  >
                    {selectedLesson.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600">请从左侧选择一个课时查看内容</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}