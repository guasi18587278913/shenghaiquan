'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, BookOpen, FileText, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrapiSection, StrapiLesson, StrapiModule } from '@/lib/strapi-api';
import DiscussionSection from '@/components/course/DiscussionSection';

interface RoboNuggetsWithStrapiProps {
  section: StrapiSection;
  lessons: StrapiLesson[];
}

export default function RoboNuggetsWithStrapi({ section, lessons }: RoboNuggetsWithStrapiProps) {
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [activeCourse, setActiveCourse] = useState<number | null>(null);
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  
  // 默认展开第一个课程
  useEffect(() => {
    if (lessons.length > 0) {
      const firstLessonId = lessons[0].id;
      setExpandedCourses(new Set([firstLessonId]));
      setActiveCourse(firstLessonId);
      if (lessons[0].modules && lessons[0].modules.length > 0) {
        setActiveModule(lessons[0].modules[0].id);
      }
    }
  }, [lessons]);
  
  // 从localStorage加载完成状态
  useEffect(() => {
    const saved = localStorage.getItem(`section-${section.id}-completed`);
    if (saved) {
      setCompletedModules(new Set(JSON.parse(saved)));
    }
  }, [section.id]);
  
  // 保存完成状态
  const saveCompletedModules = (modules: Set<number>) => {
    localStorage.setItem(`section-${section.id}-completed`, JSON.stringify(Array.from(modules)));
  };
  
  // 获取模块图标
  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileText className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'assignment': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };
  
  // 获取模块类型颜色
  const getModuleColor = (type: string) => {
    switch (type) {
      case 'reading': return 'text-blue-600';
      case 'video': return 'text-purple-600';
      case 'assignment': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };
  
  // 获取模块类型名称
  const getModuleTypeName = (type: string) => {
    switch (type) {
      case 'video': return '课程内容';
      case 'reading': return '课前准备';
      case 'assignment': return '课后作业';
      default: return type;
    }
  };
  
  // 切换课程展开状态
  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };
  
  // 标记模块为完成
  const markModuleAsCompleted = (moduleId: number) => {
    const newCompleted = new Set(completedModules);
    if (newCompleted.has(moduleId)) {
      newCompleted.delete(moduleId);
    } else {
      newCompleted.add(moduleId);
    }
    setCompletedModules(newCompleted);
    saveCompletedModules(newCompleted);
  };
  
  // 计算完成进度
  const calculateProgress = () => {
    let totalModules = 0;
    let completedCount = 0;
    
    lessons.forEach(lesson => {
      if (lesson.modules) {
        lesson.modules.forEach(module => {
          totalModules++;
          if (completedModules.has(module.id)) {
            completedCount++;
          }
        });
      }
    });
    
    return totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  };
  
  const progress = calculateProgress();
  const activeLesson = lessons.find(l => l.id === activeCourse);
  const activeModuleData = activeLesson?.modules?.find(m => m.id === activeModule);
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧导航栏 */}
      <div className="w-96 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
        {/* 顶部标题 */}
        <div className="p-6 border-b bg-gradient-to-br from-purple-50 to-indigo-50">
          <Link href="/courses" className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-3">
            <ChevronLeft className="w-4 h-4" />
            返回课程列表
          </Link>
          
          <h2 className="font-bold text-xl mb-2">{section.title}</h2>
          {section.description && (
            <p className="text-sm text-gray-600 mb-4">{section.description}</p>
          )}
          
          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>完成进度</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 课程列表 */}
        <div className="p-4">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="mb-2">
              {/* 课程标题 */}
              <button
                onClick={() => toggleCourse(lesson.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all",
                  activeCourse === lesson.id ? 
                    "bg-purple-50 text-purple-900" : 
                    "hover:bg-gray-50"
                )}
              >
                <span className="text-sm font-medium text-gray-500 w-8">
                  {String(lesson.order || index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-medium text-sm">{lesson.title}</span>
                {expandedCourses.has(lesson.id) ? 
                  <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </button>
              
              {/* 模块列表 */}
              {expandedCourses.has(lesson.id) && lesson.modules && (
                <div className="ml-12 mt-1">
                  {lesson.modules
                    .sort((a, b) => a.order - b.order)
                    .map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        setActiveCourse(lesson.id);
                        setActiveModule(module.id);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-2 rounded-lg flex items-center gap-3 transition-all text-sm",
                        activeModule === module.id ? 
                          "bg-yellow-50 border-l-4 border-yellow-400" : 
                          "hover:bg-gray-50 border-l-4 border-transparent"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {completedModules.has(module.id) ? 
                          <CheckCircle2 className="w-4 h-4 text-green-500" /> : 
                          <Circle className="w-4 h-4 text-gray-300" />
                        }
                      </div>
                      <div className={cn("flex-shrink-0", getModuleColor(module.type))}>
                        {getModuleIcon(module.type)}
                      </div>
                      <span className="text-gray-700">{module.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {lessons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>暂无课程数据</p>
              <p className="text-sm mt-2">请在 Strapi 中创建课程</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 右侧内容区 */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {activeLesson && activeModuleData ? (
            <>
              {/* 面包屑导航 */}
              <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                <Link href="/courses" className="hover:text-gray-900">课程</Link>
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span>{section.title}</span>
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span className="text-gray-900">{activeLesson.title}</span>
              </nav>
              
              {/* 内容卡片 */}
              <div className="bg-white rounded-lg shadow-sm">
                {/* 模块标题栏 */}
                <div className={cn(
                  "px-8 py-6 border-b flex items-center justify-between",
                  activeModuleData.type === 'reading' && "bg-blue-50",
                  activeModuleData.type === 'video' && "bg-purple-50",
                  activeModuleData.type === 'assignment' && "bg-orange-50"
                )}>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn("p-2 rounded-lg", 
                        activeModuleData.type === 'reading' && "bg-blue-100",
                        activeModuleData.type === 'video' && "bg-purple-100",
                        activeModuleData.type === 'assignment' && "bg-orange-100"
                      )}>
                        {getModuleIcon(activeModuleData.type)}
                      </div>
                      <h2 className="text-xl font-bold">{activeModuleData.title}</h2>
                    </div>
                    {activeModuleData.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>预计时长：{activeModuleData.duration}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => markModuleAsCompleted(activeModuleData.id)}
                    className={cn(
                      "px-4 py-2 rounded-lg font-medium transition-all",
                      completedModules.has(activeModuleData.id) ?
                        "bg-green-100 text-green-700 hover:bg-green-200" :
                        "bg-white text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {completedModules.has(activeModuleData.id) ? 
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        已完成
                      </span> : 
                      '标记为完成'
                    }
                  </button>
                </div>
                
                {/* 模块内容 */}
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-6">{activeLesson.title}</h1>
                  
                  {/* 视频内容 */}
                  {activeModuleData.type === 'video' && activeModuleData.videoUrl && (
                    <div className="mb-8">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <iframe
                          src={activeModuleData.videoUrl}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* 文本内容 */}
                  {activeModuleData.content ? (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: activeModuleData.content }}
                    />
                  ) : (
                    !activeModuleData.videoUrl && (
                      <div className="text-gray-500 text-center py-12">
                        <p className="text-lg mb-2">内容即将上线</p>
                        <p className="text-sm">请稍后再来查看</p>
                      </div>
                    )
                  )}
                </div>
              </div>
              
              {/* 讨论区 */}
              <DiscussionSection 
                lessonId={activeLesson.id} 
                lessonTitle={activeLesson.title} 
              />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">请从左侧选择一个课程开始学习</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}