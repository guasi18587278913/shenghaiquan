'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Circle,
  Clock, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Menu,
  X,
  BookOpen
} from 'lucide-react';
import LessonContent from '@/components/course/lesson-content';

interface CourseDetailClientProps {
  initialCourse: any;
}

export default function CourseDetailClient({ initialCourse }: CourseDetailClientProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // 设置第一个课时为当前课时
    if (initialCourse?.lessons?.length > 0 && !currentLesson) {
      setCurrentLesson(initialCourse.lessons[0]);
    }
  }, [initialCourse, currentLesson]);

  const handleLessonClick = (lesson: any) => {
    setCurrentLesson(lesson);
    
    // 在移动端，选择课时后自动隐藏侧边栏
    if (window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  const markAsCompleted = () => {
    if (currentLesson) {
      setCompletedLessons(prev => new Set(prev).add(currentLesson.id));
    }
  };

  const getNextLesson = () => {
    if (!currentLesson || !initialCourse?.lessons) return null;
    const currentIndex = initialCourse.lessons.findIndex((l: any) => l.id === currentLesson.id);
    return initialCourse.lessons[currentIndex + 1] || null;
  };

  const getPreviousLesson = () => {
    if (!currentLesson || !initialCourse?.lessons) return null;
    const currentIndex = initialCourse.lessons.findIndex((l: any) => l.id === currentLesson.id);
    return initialCourse.lessons[currentIndex - 1] || null;
  };

  if (!initialCourse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">课程不存在</p>
      </div>
    );
  }

  const totalLessons = initialCourse.lessons?.length || 0;
  const completedCount = completedLessons.size;
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 移动端菜单按钮 */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="md:hidden fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* 侧边栏 */}
      <div className={`${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      } fixed md:relative md:translate-x-0 z-40 w-80 h-screen bg-white border-r border-gray-200 transition-transform duration-300 overflow-y-auto`}>
        {/* 课程信息 */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold mb-2">{initialCourse.title}</h1>
          <p className="text-sm text-gray-600 mb-4">{initialCourse.section?.title}</p>
          
          {/* 进度条 */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>学习进度</span>
              <span>{completedCount}/{totalLessons} 已完成</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 课时列表 */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">课程内容</h3>
          <div className="space-y-1">
            {initialCourse.lessons?.map((lesson: any, index: number) => {
              const isCompleted = completedLessons.has(lesson.id);
              const isCurrent = currentLesson?.id === lesson.id;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isCurrent 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        第{index + 1}课：{lesson.title}
                      </h4>
                      {lesson.duration && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration}
                        </p>
                      )}
                    </div>
                    {lesson.type === 'video' && <Play className="h-4 w-4 text-gray-400 mt-0.5" />}
                    {lesson.type === 'article' && <FileText className="h-4 w-4 text-gray-400 mt-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部导航 */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {currentLesson?.title || '选择一个课时开始学习'}
              </h2>
            </div>
            
            {currentLesson && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentLesson(getPreviousLesson())}
                  disabled={!getPreviousLesson()}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentLesson(getNextLesson())}
                  disabled={!getNextLesson()}
                  className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 课时内容 */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-5xl mx-auto p-6">
              <LessonContent lesson={currentLesson} />
              
              {/* 完成按钮 */}
              {!completedLessons.has(currentLesson.id) && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={markAsCompleted}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    标记为已完成
                  </button>
                </div>
              )}
              
              {/* 下一课按钮 */}
              {completedLessons.has(currentLesson.id) && getNextLesson() && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setCurrentLesson(getNextLesson())}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    继续下一课
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">选择一个课时开始学习</p>
                <p className="text-gray-400 text-sm mt-2">从左侧课程列表中选择您想学习的内容</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}