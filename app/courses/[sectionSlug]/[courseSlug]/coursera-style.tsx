'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  FileText, 
  CheckCircle, 
  Circle,
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Menu,
  X,
  BookOpen,
  MessageSquare,
  Download,
  Share2,
  Bookmark,
  RotateCcw
} from 'lucide-react';

export default function CourseraStyleCoursePage({
  params
}: {
  params: Promise<{ sectionSlug: string; courseSlug: string }>
}) {
  const { sectionSlug, courseSlug } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showSidebar, setShowSidebar] = useState(true);
  const [loading, setLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);

  // 模拟课程数据
  useEffect(() => {
    // 这里应该从API获取数据
    const mockCourse = {
      title: "深海圈 AI 产品实战课程",
      modules: [
        {
          id: 'week1',
          title: '第1周：产品构思与AI工具准备',
          duration: '4-6小时',
          lessons: [
            {
              id: 'w1-intro',
              title: '欢迎来到AI产品开发',
              type: 'video',
              duration: 600,
              completed: true
            },
            {
              id: 'w1-tools',
              title: 'AI工具介绍：Cursor与ChatGPT',
              type: 'video',
              duration: 900,
              completed: true
            },
            {
              id: 'w1-reading',
              title: '阅读：如何选择产品方向',
              type: 'reading',
              duration: 1200,
              completed: false
            },
            {
              id: 'w1-quiz',
              title: '测验：AI产品基础知识',
              type: 'quiz',
              questions: 10,
              completed: false
            }
          ]
        },
        {
          id: 'week2',
          title: '第2周：快速原型开发',
          duration: '6-8小时',
          lessons: [
            {
              id: 'w2-prototype',
              title: '使用AI构建第一个原型',
              type: 'video',
              duration: 1200,
              completed: false
            },
            {
              id: 'w2-design',
              title: '产品设计最佳实践',
              type: 'video',
              duration: 1500,
              completed: false
            },
            {
              id: 'w2-assignment',
              title: '作业：提交你的产品原型',
              type: 'assignment',
              dueDate: '2025-08-15',
              completed: false
            }
          ]
        }
      ]
    };

    setCourse(mockCourse);
    // 设置第一个未完成的课程为当前课程
    const firstIncomplete = mockCourse.modules[0].lessons.find(l => !l.completed) || mockCourse.modules[0].lessons[0];
    setCurrentLesson(firstIncomplete);
    setLoading(false);
  }, []);

  const handleLessonClick = (lesson: any) => {
    setCurrentLesson(lesson);
  };

  const markAsComplete = () => {
    if (currentLesson) {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(currentLesson.id);
      setCompletedLessons(newCompleted);
      
      // 自动跳转到下一课
      navigateToNext();
    }
  };

  const navigateToNext = () => {
    // 实现导航到下一课的逻辑
  };

  const navigateToPrevious = () => {
    // 实现导航到上一课的逻辑
  };

  const calculateProgress = () => {
    if (!course) return 0;
    const totalLessons = course.modules.reduce((sum: number, module: any) => 
      sum + module.lessons.length, 0
    );
    const completed = course.modules.reduce((sum: number, module: any) => 
      sum + module.lessons.filter((l: any) => l.completed || completedLessons.has(l.id)).length, 0
    );
    return Math.round((completed / totalLessons) * 100);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">{course?.title}</h1>
            <span className="text-sm text-gray-600">{calculateProgress()}% 完成</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 侧边栏 */}
        <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r overflow-hidden`}>
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">课程内容</h2>
              
              {course?.modules.map((module: any) => (
                <div key={module.id} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{module.title}</h3>
                    <span className="text-xs text-gray-500">{module.duration}</span>
                  </div>
                  
                  <div className="space-y-1">
                    {module.lessons.map((lesson: any) => {
                      const isCompleted = lesson.completed || completedLessons.has(lesson.id);
                      const isCurrent = currentLesson?.id === lesson.id;
                      
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                            isCurrent 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="mr-3">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {lesson.type === 'video' && <Play className="w-4 h-4 text-gray-500" />}
                              {lesson.type === 'reading' && <FileText className="w-4 h-4 text-gray-500" />}
                              {lesson.type === 'quiz' && <BookOpen className="w-4 h-4 text-gray-500" />}
                              {lesson.type === 'assignment' && <FileText className="w-4 h-4 text-gray-500" />}
                              
                              <span className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>
                                {lesson.title}
                              </span>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-1">
                              {lesson.duration && formatDuration(lesson.duration)}
                              {lesson.questions && `${lesson.questions} 题`}
                              {lesson.dueDate && `截止：${lesson.dueDate}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col">
          {/* 内容头部 */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentLesson?.title}</h2>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    {currentLesson?.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(currentLesson.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Bookmark className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* 视频/内容区 */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto p-6">
              {currentLesson?.type === 'video' && (
                <div className="mb-8">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <p className="text-white">视频播放器</p>
                  </div>
                  
                  {/* 视频控制栏 */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        <RotateCcw className="w-4 h-4 inline mr-1" />
                        重播
                      </button>
                      <select 
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        <FileText className="w-4 h-4 inline mr-1" />
                        字幕
                      </button>
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        <Download className="w-4 h-4 inline mr-1" />
                        下载
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 课程内容/说明 */}
              <div className="prose prose-lg max-w-none">
                <h3>课程说明</h3>
                <p>这是课程的详细说明内容...</p>
              </div>

              {/* 讨论区 */}
              <div className="mt-12 border-t pt-8">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">讨论区</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                  讨论功能即将上线
                </div>
              </div>
            </div>
          </div>

          {/* 底部导航 */}
          <div className="bg-white border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={navigateToPrevious}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-4 h-4" />
                上一个
              </button>

              <button
                onClick={markAsComplete}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                标记为完成并继续
              </button>

              <button 
                onClick={navigateToNext}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                下一个
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}