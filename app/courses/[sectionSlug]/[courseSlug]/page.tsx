'use client';

import { useState, useEffect, use, useCallback } from 'react';
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
  MessageSquare,
  Download,
  Share2,
  Bookmark,
  RotateCcw,
  Settings
} from 'lucide-react';
import LessonContent from '@/components/course/lesson-content';

export default function CourseDetailPage({
  params
}: {
  params: Promise<{ sectionSlug: string; courseSlug: string }>
}) {
  const { sectionSlug, courseSlug } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchCourseDetail = async () => {
    try {
      // 从静态数据获取课程结构（临时方案，后续可以改为 API）
      const { getSection, getLesson } = await import('@/lib/course-data');
      const section = getSection(sectionSlug);
      
      if (!section) {
        throw new Error('Section not found');
      }
      
      // 转换为页面期望的格式
      const courseData = {
        id: section.id,
        title: section.title,
        description: section.description,
        chapters: [{
          id: section.id,
          title: section.title,
          lessons: section.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type,
            content: lesson.content,
            videoUrl: lesson.videoUrl,
            wordpressSlug: lesson.wordpressSlug,
            videoDuration: lesson.duration,
            isFree: lesson.isFree,
            order: lesson.order,
            isNew: lesson.isNew
          }))
        }]
      };
      
      setCourse(courseData);
      
      // 根据 courseSlug (实际是课时的order) 找到对应的课时
      if (courseData.chapters && courseData.chapters[0]?.lessons) {
        const lessonIndex = parseInt(courseSlug) - 1; // URL中的数字减1得到索引
        const targetLesson = courseData.chapters[0].lessons[lessonIndex];
        if (targetLesson) {
          setCurrentLesson(targetLesson);
        } else if (courseData.chapters[0].lessons[0]) {
          // 如果找不到，显示第一个课时
          setCurrentLesson(courseData.chapters[0].lessons[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetail();
  }, [sectionSlug, courseSlug]);

  useEffect(() => {
    setProgress(calculateProgress());
  }, [completedLessons, course]);

  const handleLessonClick = (lesson: any) => {
    setCurrentLesson(lesson);
    // 可以在这里添加进度记录逻辑
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`;
  };

  const calculateProgress = useCallback(() => {
    if (!course) return 0;
    let totalLessons = 0;
    let completed = 0;
    
    course.chapters?.forEach((chapter: any) => {
      totalLessons += chapter.lessons?.length || 0;
      chapter.lessons?.forEach((lesson: any) => {
        if (lesson.completed || completedLessons.has(lesson.id)) {
          completed++;
        }
      });
    });
    
    return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  }, [course, completedLessons]);

  const markAsComplete = () => {
    if (currentLesson) {
      const newCompleted = new Set(completedLessons);
      newCompleted.add(currentLesson.id);
      setCompletedLessons(newCompleted);
      
      // TODO: 保存到后端
      
      // 自动跳转到下一课
      navigateToNext();
    }
  };

  const navigateToNext = () => {
    // 实现导航到下一课的逻辑
    if (!course || !currentLesson) return;
    
    let foundCurrent = false;
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (foundCurrent) {
          setCurrentLesson(lesson);
          return;
        }
        if (lesson.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
    }
  };

  const navigateToPrevious = () => {
    // 实现导航到上一课的逻辑
    if (!course || !currentLesson) return;
    
    let previousLesson = null;
    for (const chapter of course.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.id === currentLesson.id && previousLesson) {
          setCurrentLesson(previousLesson);
          return;
        }
        previousLesson = lesson;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">课程未找到</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/courses')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{course?.title || '加载中...'}</h1>
            </div>
            <span className="text-sm text-gray-600">{progress}% 完成</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 侧边栏 */}
        <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex-shrink-0`}>
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">课程内容</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 章节列表 */}
              {course?.chapters?.map((chapter: any) => (
                <div key={chapter.id} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                    {chapter.title}
                    <span className="text-xs font-normal text-gray-500">
                      {chapter.lessons?.filter((l: any) => l.completed || completedLessons.has(l.id)).length}/{chapter.lessons?.length || 0}
                    </span>
                  </h3>
                  <div className="space-y-1">
                    {chapter.lessons?.map((lesson: any) => {
                      const isCompleted = lesson.completed || completedLessons.has(lesson.id);
                      const isCurrent = currentLesson?.id === lesson.id;
                      const isLocked = !lesson.isFree && !session;
                      
                      return (
                        <div
                          key={lesson.id}
                          onClick={() => !isLocked && handleLessonClick(lesson)}
                          className={`flex items-center p-3 rounded-lg transition-all ${
                            isCurrent 
                              ? 'bg-blue-50 border border-blue-200' 
                              : isLocked
                              ? 'opacity-60 cursor-not-allowed'
                              : 'hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <div className="mr-3 flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {lesson.type === 'VIDEO_TEXT' ? (
                                <Play className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              )}
                              
                              <span className={`text-sm truncate ${
                                isCurrent ? 'font-medium text-gray-900' : 'text-gray-700'
                              }`}>
                                {lesson.title}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              {lesson.videoDuration && (
                                <span>{formatDuration(lesson.videoDuration)}</span>
                              )}
                              {lesson.isFree && (
                                <span className="text-green-600 font-medium">免费</span>
                              )}
                            </div>
                          </div>
                          
                          {isLocked && (
                            <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                          )}
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
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{currentLesson?.title || '选择一个课时开始学习'}</h2>
                  {currentLesson && (
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      {currentLesson.videoDuration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDuration(currentLesson.videoDuration)}
                        </span>
                      )}
                      {currentLesson.type === 'VIDEO_TEXT' && (
                        <span className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          视频课程
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bookmark className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* 视频/内容区 */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-5xl mx-auto p-6">
              {currentLesson ? (
                <>
                  {currentLesson.type === 'VIDEO_TEXT' && (
                    <div className="mb-8">
                      <div className="bg-black rounded-lg overflow-hidden shadow-xl">
                        <div className="aspect-video flex items-center justify-center">
                          <p className="text-white">视频播放器（集成腾讯云点播）</p>
                        </div>
                      </div>
                      
                      {/* 视频控制栏 */}
                      <div className="mt-4 bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                              <RotateCcw className="w-4 h-4" />
                              重播
                            </button>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">播放速度</span>
                              <select 
                                value={playbackSpeed}
                                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                                className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value={0.5}>0.5x</option>
                                <option value={0.75}>0.75x</option>
                                <option value={1}>1x</option>
                                <option value={1.25}>1.25x</option>
                                <option value={1.5}>1.5x</option>
                                <option value={2}>2x</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => setShowTranscript(!showTranscript)}
                              className={`text-sm flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                                showTranscript ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              <FileText className="w-4 h-4" />
                              字幕
                            </button>
                            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                              <Download className="w-4 h-4" />
                              下载
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 课程内容 */}
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <LessonContent lesson={currentLesson} />
                  </div>

                  {/* 讨论区 */}
                  <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-semibold">讨论区</h3>
                      <span className="text-sm text-gray-500">({0} 条讨论)</span>
                    </div>
                    <div className="border rounded-lg p-8 text-center text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>讨论功能即将上线</p>
                      <p className="text-sm mt-2">与其他学员一起交流学习心得</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">选择一个课时开始学习</h3>
                  <p className="text-gray-600">从左侧课程列表中选择您想学习的内容</p>
                </div>
              )}
            </div>
          </div>

          {/* 底部导航 */}
          <div className="bg-white border-t px-6 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={navigateToPrevious}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={!currentLesson}
              >
                <ChevronLeft className="w-4 h-4" />
                上一个
              </button>

              {currentLesson && (
                <button
                  onClick={markAsComplete}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  标记为完成并继续
                </button>
              )}

              <button 
                onClick={navigateToNext}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                disabled={!currentLesson}
              >
                下一个
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 内容锁定遮罩 */}
      {currentLesson && !currentLesson.isFree && !session && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              该课程需要登录后访问
            </h3>
            <p className="text-gray-600 mb-6">
              请登录或升级会员以解锁全部课程内容
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                立即登录
              </button>
              <button
                onClick={() => setCurrentLesson(null)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                返回选择
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}