'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronDown, PlayCircle, FileText, Check, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  type: 'TEXT_ONLY' | 'VIDEO_TEXT';
  content: string;
  videoUrl?: string;
  duration?: number;
  isFree: boolean;
  order: number;
  completed?: boolean;
}

interface Section {
  id: string;
  title: string;
  slug: string;
  description: string;
  lessons: Lesson[];
}

interface CourseraStylePageProps {
  sections: Section[];
  currentSection: string;
  currentLesson: string;
}

export default function CourseraStylePage({ 
  sections, 
  currentSection, 
  currentLesson 
}: CourseraStylePageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [currentContent, setCurrentContent] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<Map<string, boolean>>(new Map());

  // 初始化当前内容
  useEffect(() => {
    const section = sections.find(s => s.slug === currentSection);
    const lesson = section?.lessons.find(l => l.slug === currentLesson);
    if (lesson) {
      setCurrentContent(lesson);
      // 自动展开当前章节
      setExpandedSections(prev => new Set(prev).add(section!.id));
      // 标记为已完成
      markAsCompleted(lesson.id);
    }
  }, [currentSection, currentLesson, sections]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const navigateToLesson = (section: Section, lesson: Lesson) => {
    // 检查权限
    if (!lesson.isFree && !session) {
      alert('请先登录后再学习付费课程');
      router.push('/login');
      return;
    }
    router.push(`/courses/${section.slug}/${lesson.slug}`);
  };

  const markAsCompleted = (lessonId: string) => {
    const newProgress = new Map(progress);
    newProgress.set(lessonId, true);
    setProgress(newProgress);
    // TODO: 保存到服务器
  };

  const calculateProgress = () => {
    const totalLessons = sections.reduce((sum, section) => sum + section.lessons.length, 0);
    const completedLessons = Array.from(progress.values()).filter(Boolean).length;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部进度条 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-semibold">深海圈AI编程课程</h1>
            <span className="text-sm text-gray-600">{calculateProgress()}% 完成</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* 左侧课程大纲 */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">课程内容</h2>
            
            {sections.map((section) => (
              <div key={section.id} className="mb-4">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-medium text-left">{section.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {section.lessons.filter(l => progress.get(l.id)).length}/{section.lessons.length}
                  </span>
                </button>
                
                {expandedSections.has(section.id) && (
                  <div className="mt-2 ml-6 space-y-1">
                    {section.lessons.map((lesson) => {
                      const isActive = currentLesson === lesson.slug;
                      const isCompleted = progress.get(lesson.id);
                      const isLocked = !lesson.isFree && !session;
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => navigateToLesson(section, lesson)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'hover:bg-gray-50 text-gray-700'
                          } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                          disabled={isLocked}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4 text-gray-400" />
                            ) : lesson.type === 'VIDEO_TEXT' ? (
                              <PlayCircle className="w-4 h-4" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{lesson.title}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {lesson.duration && (
                                <span>{Math.floor(lesson.duration / 60)}分钟</span>
                              )}
                              {lesson.isFree && (
                                <span className="text-green-600">免费</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-y-auto">
          {currentContent && (
            <div className="max-w-4xl mx-auto p-8">
              {/* 视频播放器 */}
              {currentContent.type === 'VIDEO_TEXT' && currentContent.videoUrl && (
                <div className="mb-8">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    {/* 这里集成腾讯云播放器 */}
                    <div id="player-container" className="w-full h-full">
                      {/* 临时占位，实际使用腾讯云播放器SDK */}
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <PlayCircle className="w-16 h-16" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 课程标题 */}
              <h1 className="text-3xl font-bold mb-6">{currentContent.title}</h1>

              {/* 课程内容 */}
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: currentContent.content }}
              />

              {/* 底部导航 */}
              <div className="mt-12 pt-8 border-t flex justify-between">
                <button
                  onClick={() => {
                    // 导航到上一课
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-900"
                >
                  上一课
                </button>
                <button
                  onClick={() => {
                    markAsCompleted(currentContent.id);
                    // 导航到下一课
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  下一课
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}