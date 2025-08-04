'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Clock, FileText, Video, Code, MessageSquare, Download, CheckCircle2, Circle, BookOpen, Trophy, ChevronDown, ChevronUp, Star, Zap } from 'lucide-react';
import { StrapiSection, StrapiLesson, StrapiModule, updateModuleCompletion } from '@/lib/strapi-api';
import { cn } from '@/lib/utils';

interface CourseraStyleClientProps {
  section: StrapiSection;
  lesson: StrapiLesson;
}

export default function CourseraStyleClient({ section, lesson }: CourseraStyleClientProps) {
  const router = useRouter();
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());
  const [essentialsOpen, setEssentialsOpen] = useState(true);
  const [optionalsOpen, setOptionalsOpen] = useState(true);
  
  const activeModule = lesson.modules?.[activeModuleIndex];
  
  // 将模块分为必修和选修
  const essentialModules = lesson.modules?.filter(m => 
    m.type === 'video' || m.type === 'reading' || m.type === 'assignment'
  ) || [];
  const optionalModules = lesson.modules?.filter(m => 
    m.type === 'discussion' || m.type === 'resource'
  ) || [];
  
  // 从localStorage加载完成状态
  useEffect(() => {
    const saved = localStorage.getItem(`lesson-${lesson.id}-completed`);
    if (saved) {
      setCompletedModules(new Set(JSON.parse(saved)));
    }
  }, [lesson.id]);
  
  // 保存完成状态
  const saveCompletedModules = (modules: Set<number>) => {
    localStorage.setItem(`lesson-${lesson.id}-completed`, JSON.stringify(Array.from(modules)));
  };
  
  // 标记模块为完成
  const markModuleAsCompleted = async (moduleId: number) => {
    const newCompleted = new Set(completedModules);
    newCompleted.add(moduleId);
    setCompletedModules(newCompleted);
    saveCompletedModules(newCompleted);
    
    // 更新到Strapi（可选）
    await updateModuleCompletion(moduleId, true);
  };
  
  // 获取模块图标
  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'reading': return <FileText className="w-4 h-4" />;
      case 'assignment': return <Code className="w-4 h-4" />;
      case 'discussion': return <MessageSquare className="w-4 h-4" />;
      case 'resource': return <Download className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };
  
  // 获取模块类型名称
  const getModuleTypeName = (type: string) => {
    switch (type) {
      case 'video': return '视频';
      case 'reading': return '阅读';
      case 'assignment': return '作业';
      case 'discussion': return '讨论';
      case 'resource': return '资源';
      default: return '内容';
    }
  };
  
  // 计算完成进度
  const completionRate = essentialModules.length > 0 ? 
    Math.round((Array.from(completedModules).filter(id => 
      essentialModules.some(m => m.id === id)
    ).length / essentialModules.length) * 100) : 0;
  
  // 获取篇章样式
  const getSectionColor = (slug: string) => {
    switch (slug) {
      case 'preface': return 'from-teal-500 to-cyan-600';
      case 'basic': return 'from-purple-500 to-indigo-600';
      case 'core': return 'from-orange-500 to-red-600';
      case 'advanced': return 'from-pink-500 to-rose-600';
      case 'appendix': return 'from-gray-600 to-gray-800';
      default: return 'from-blue-500 to-indigo-600';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 左侧导航栏 - RoboNuggets风格 */}
      <div className="w-96 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
        {/* 顶部标题和进度 */}
        <div className="p-6 border-b bg-gradient-to-br from-gray-50 to-gray-100">
          <Link href={`/courses/${section.slug}`} className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-3">
            <ChevronLeft className="w-4 h-4" />
            返回{section.title}
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <h2 className="font-bold text-lg">开始学习</h2>
          </div>
          
          {/* 进度条 */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>课程进度</span>
              <span className="font-semibold">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* 课程标题 */}
        <div className="p-6 border-b">
          <h3 className="text-base font-semibold text-gray-900 leading-tight">
            {lesson.title}
          </h3>
        </div>
        
        {/* 必修模块 - Essentials */}
        <div className="border-b">
          <button
            onClick={() => setEssentialsOpen(!essentialsOpen)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-gray-900">必修内容</span>
            {essentialsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {essentialsOpen && (
            <div className="pb-2">
              {essentialModules.map((module, index) => {
                const moduleIndex = lesson.modules?.findIndex(m => m.id === module.id) || 0;
                return (
                  <button
                    key={module.id}
                    onClick={() => setActiveModuleIndex(moduleIndex)}
                    className={cn(
                      "w-full text-left px-6 py-3 flex items-center gap-3 transition-all",
                      activeModuleIndex === moduleIndex ? 
                        "bg-yellow-50 border-l-4 border-yellow-400" : 
                        "hover:bg-gray-50 border-l-4 border-transparent"
                    )}
                  >
                    <div className="flex-shrink-0">
                      {completedModules.has(module.id) ? 
                        <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2",
                          activeModuleIndex === moduleIndex ? "border-yellow-400" : "border-gray-300"
                        )} />
                      }
                    </div>
                    <div className="flex-shrink-0 text-gray-600">
                      {getModuleIcon(module.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {module.title}
                      </div>
                      {module.duration && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {module.duration}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              
              {essentialModules.length === 0 && (
                <div className="px-6 py-4 text-sm text-gray-500">
                  暂无必修内容
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 选修模块 - Optionals */}
        {optionalModules.length > 0 && (
          <div>
            <button
              onClick={() => setOptionalsOpen(!optionalsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">选修内容</span>
              {optionalsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {optionalsOpen && (
              <div className="pb-2">
                {optionalModules.map((module) => {
                  const moduleIndex = lesson.modules?.findIndex(m => m.id === module.id) || 0;
                  return (
                    <button
                      key={module.id}
                      onClick={() => setActiveModuleIndex(moduleIndex)}
                      className={cn(
                        "w-full text-left px-6 py-3 flex items-center gap-3 transition-all",
                        activeModuleIndex === moduleIndex ? 
                          "bg-yellow-50 border-l-4 border-yellow-400" : 
                          "hover:bg-gray-50 border-l-4 border-transparent"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {completedModules.has(module.id) ? 
                          <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2",
                            activeModuleIndex === moduleIndex ? "border-yellow-400" : "border-gray-300"
                          )} />
                        }
                      </div>
                      <div className="flex-shrink-0 text-gray-600">
                        {getModuleIcon(module.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {module.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
        
        {/* 底部奖励提示 */}
        <div className="p-6 mt-auto">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-gray-900">完成奖励</span>
            </div>
            <p className="text-xs text-gray-600">
              完成所有必修内容获得 <span className="font-semibold text-orange-600">100 XP</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="flex-1">
        {/* 顶部面包屑导航 */}
        <div className="bg-white border-b px-6 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/courses" className="text-gray-600 hover:text-gray-900">
              课程
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/courses/${section.slug}`} className="text-gray-600 hover:text-gray-900">
              {section.title}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{lesson.title}</span>
          </nav>
        </div>
        
        {/* 模块内容 */}
        {activeModule && (
          <div className="max-w-4xl mx-auto p-8">
            {/* 标题横幅 - RoboNuggets风格 */}
            <div className={cn(
              "bg-gradient-to-br rounded-lg p-8 mb-8 text-white",
              getSectionColor(section.slug)
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                  {getModuleIcon(activeModule.type)}
                </div>
                <div>
                  <div className="text-sm opacity-90">{getModuleTypeName(activeModule.type)}</div>
                  <h1 className="text-2xl font-bold">{activeModule.title}</h1>
                </div>
              </div>
              
              {/* 模块信息 */}
              <div className="flex items-center gap-6 text-sm">
                {activeModule.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{activeModule.duration}</span>
                  </div>
                )}
                {activeModule.assignmentPoints && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>{activeModule.assignmentPoints} 分</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* 内容区域 */}
            <div className="bg-white rounded-lg shadow-sm">
              {/* 视频内容 */}
              {activeModule.type === 'video' && activeModule.videoUrl && (
                <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                  <iframe
                    src={activeModule.videoUrl}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              )}
              
              {/* 作业提示 */}
              {activeModule.type === 'assignment' && (
                <div className="p-6 bg-blue-50 border-b border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Code className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">编程作业</h3>
                      <p className="text-sm text-gray-600">
                        请根据下方要求完成作业，完成后点击"标记为已完成"。
                      </p>
                      {activeModule.assignmentDeadline && (
                        <p className="text-sm text-gray-500 mt-2">
                          截止时间：{new Date(activeModule.assignmentDeadline).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 主要内容 */}
              {activeModule.content && (
                <div className="p-8">
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: activeModule.content }}
                  />
                </div>
              )}
              
              {/* 底部操作区 */}
              <div className="p-6 bg-gray-50 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveModuleIndex(Math.max(0, activeModuleIndex - 1))}
                      disabled={activeModuleIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      上一个
                    </button>
                    
                    <button
                      onClick={() => {
                        if (activeModuleIndex < (lesson.modules?.length || 0) - 1) {
                          setActiveModuleIndex(activeModuleIndex + 1);
                        }
                      }}
                      disabled={activeModuleIndex >= (lesson.modules?.length || 0) - 1}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一个
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {!completedModules.has(activeModule.id) && (
                    <button
                      onClick={() => markModuleAsCompleted(activeModule.id)}
                      className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md"
                    >
                      标记为已完成
                    </button>
                  )}
                  
                  {completedModules.has(activeModule.id) && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-medium">已完成</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 推荐下一步 */}
            {completionRate === 100 && (
              <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Trophy className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">恭喜完成本课程！</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  你已经掌握了本课程的所有内容，获得了 <span className="font-semibold text-green-600">100 XP</span>！
                </p>
                <Link 
                  href={`/courses/${section.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  继续下一课
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}