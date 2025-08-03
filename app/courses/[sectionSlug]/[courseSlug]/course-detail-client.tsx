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
  BookOpen,
  MessageSquare
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
    // 如果有指定的当前课程，使用它；否则使用第一个课时
    if (initialCourse?.currentCourse) {
      setCurrentLesson(initialCourse.currentCourse);
    } else if (initialCourse?.lessons?.length > 0 && !currentLesson) {
      setCurrentLesson(initialCourse.lessons[0]);
    }
  }, [initialCourse]);

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

      {/* 侧边栏 - Coursera 风格 */}
      <div className={`${
        showSidebar ? 'translate-x-0' : '-translate-x-full'
      } fixed md:relative md:translate-x-0 z-40 w-80 h-screen bg-gray-50 border-r border-gray-200 transition-transform duration-300 overflow-y-auto`}>
        {/* 课程信息 */}
        <div className="p-6 bg-white border-b">
          <h1 className="text-xl font-bold mb-2">{initialCourse.title?.replace(/^[├└]── /, '')}</h1>
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

        {/* 课时列表 - Coursera 风格 */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">课程内容</h3>
          <div className="space-y-2">
            {initialCourse.lessons?.map((lesson: any, index: number) => {
              const isCompleted = completedLessons.has(lesson.id);
              const isCurrent = currentLesson?.id === lesson.id;
              
              // 根据课时类型选择图标和标签
              const getTypeInfo = (type: string, title: string) => {
                if (type === 'VIDEO_TEXT' || title.includes('视频')) {
                  return { 
                    icon: Play, 
                    label: 'Video', 
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50'
                  };
                } else if (title.includes('作业')) {
                  return { 
                    icon: MessageSquare, 
                    label: 'Practice', 
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50'
                  };
                } else {
                  return { 
                    icon: FileText, 
                    label: 'Reading', 
                    color: 'text-green-600',
                    bgColor: 'bg-green-50'
                  };
                }
              };
              
              const typeInfo = getTypeInfo(lesson.type, lesson.title);
              const Icon = typeInfo.icon;
              
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    isCurrent 
                      ? 'bg-white shadow-sm border border-gray-200' 
                      : 'hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* 完成状态图标 */}
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className={`h-5 w-5 rounded-full border-2 ${
                          isCurrent ? 'border-blue-500' : 'border-gray-300'
                        }`} />
                      )}
                    </div>
                    
                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}:
                        </span>
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {lesson.title}
                        </h4>
                      </div>
                      
                      {/* 时长或其他信息 */}
                      {lesson.videoDuration && lesson.videoDuration > 0 && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {Math.floor(lesson.videoDuration / 60)} min
                        </p>
                      )}
                    </div>
                    
                    {/* 类型图标 */}
                    <div className={`p-1.5 rounded ${typeInfo.bgColor}`}>
                      <Icon className={`h-4 w-4 ${typeInfo.color}`} />
                    </div>
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
              
              {/* 讨论区 */}
              <div className="mt-12 border-t pt-8">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">课程讨论</h3>
                  <span className="text-sm text-gray-500">({currentLesson?.title})</span>
                </div>
                
                {/* 发表评论 */}
                <div className="mb-8">
                  <textarea
                    placeholder="分享你的学习心得或提出问题..."
                    className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="mt-3 flex justify-end">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      发表评论
                    </button>
                  </div>
                </div>
                
                {/* 评论列表 */}
                <div className="space-y-6">
                  {/* 示例评论 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">学员A</span>
                        <span className="text-xs text-gray-500">2小时前</span>
                      </div>
                      <p className="text-gray-700">这节课讲得真清楚，特别是关于AI产品的部分，受益匪浅！</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <button className="text-gray-500 hover:text-blue-600">回复</button>
                        <button className="text-gray-500 hover:text-blue-600">点赞 (3)</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">学员B</span>
                        <span className="text-xs text-gray-500">5小时前</span>
                      </div>
                      <p className="text-gray-700">请问老师，关于Cursor的使用还有更详细的教程吗？</p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <button className="text-gray-500 hover:text-blue-600">回复</button>
                        <button className="text-gray-500 hover:text-blue-600">点赞 (1)</button>
                      </div>
                      
                      {/* 回复 */}
                      <div className="mt-4 ml-8 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">助教</span>
                          <span className="text-xs text-gray-500">3小时前</span>
                        </div>
                        <p className="text-sm text-gray-700">在后续的课程中会有更详细的Cursor实战内容，请继续学习！</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 加载更多 */}
                  <div className="text-center pt-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      查看更多评论
                    </button>
                  </div>
                </div>
              </div>
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