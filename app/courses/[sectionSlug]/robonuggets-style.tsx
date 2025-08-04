'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, BookOpen, FileText, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  slug: string;
  modules: {
    id: string;
    title: string;
    type: 'preparation' | 'content' | 'assignment';
    completed: boolean;
  }[];
}

// 基础篇的课程数据
const basicCourses: Course[] = [
  {
    id: '1',
    title: '玩起来! 通过 AI，10 分钟发布你的第一款网站产品!',
    slug: 'play-with-ai',
    modules: [
      { id: '1-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '1-2', title: '课程内容', type: 'content', completed: false },
      { id: '1-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '2',
    title: '怎么做「AI 产品」?',
    slug: 'how-to-make-ai-product',
    modules: [
      { id: '2-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '2-2', title: '课程内容', type: 'content', completed: false },
      { id: '2-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '3',
    title: '如何使用 Cursor 打磨产品?',
    slug: 'how-to-use-cursor',
    modules: [
      { id: '3-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '3-2', title: '课程内容', type: 'content', completed: false },
      { id: '3-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '4',
    title: '如何使用 GitHub 管理源代码?',
    slug: 'how-to-use-github',
    modules: [
      { id: '4-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '4-2', title: '课程内容', type: 'content', completed: false },
      { id: '4-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '5',
    title: '如何正式发布你的网站产品?',
    slug: 'how-to-publish-website',
    modules: [
      { id: '5-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '5-2', title: '课程内容', type: 'content', completed: false },
      { id: '5-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '6',
    title: '如何分析用户行为?',
    slug: 'how-to-analyze-user-behavior',
    modules: [
      { id: '6-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '6-2', title: '课程内容', type: 'content', completed: false },
      { id: '6-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '7',
    title: '如何让产品变得高端大气上档次?',
    slug: 'how-to-make-product-premium',
    modules: [
      { id: '7-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '7-2', title: '课程内容', type: 'content', completed: false },
      { id: '7-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '8',
    title: '如何借助开源软件加快开发过程?',
    slug: 'how-to-use-opensource',
    modules: [
      { id: '8-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '8-2', title: '课程内容', type: 'content', completed: false },
      { id: '8-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '9',
    title: '如何冷启动?',
    slug: 'how-to-cold-start',
    modules: [
      { id: '9-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '9-2', title: '课程内容', type: 'content', completed: false },
      { id: '9-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  },
  {
    id: '10',
    title: '如何让 AI发挥最大的潜力?',
    slug: 'how-to-maximize-ai-potential',
    modules: [
      { id: '10-1', title: '课前准备', type: 'preparation', completed: false },
      { id: '10-2', title: '课程内容', type: 'content', completed: false },
      { id: '10-3', title: '课后作业', type: 'assignment', completed: false },
    ]
  }
];

interface RoboNuggetsStyleProps {
  sectionSlug: string;
  sectionTitle: string;
}

export default function RoboNuggetsStyle({ sectionSlug, sectionTitle }: RoboNuggetsStyleProps) {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set(['1'])); // 默认展开第一个课程
  const [activeCourse, setActiveCourse] = useState<string>('1');
  const [activeModule, setActiveModule] = useState<string>('1-1');
  
  // 获取模块图标
  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'preparation': return <BookOpen className="w-4 h-4" />;
      case 'content': return <FileText className="w-4 h-4" />;
      case 'assignment': return <Code className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };
  
  // 获取模块类型颜色
  const getModuleColor = (type: string) => {
    switch (type) {
      case 'preparation': return 'text-blue-600';
      case 'content': return 'text-purple-600';
      case 'assignment': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };
  
  // 切换课程展开状态
  const toggleCourse = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };
  
  // 计算完成进度
  const calculateProgress = () => {
    let totalModules = 0;
    let completedModules = 0;
    
    basicCourses.forEach(course => {
      course.modules.forEach(module => {
        totalModules++;
        if (module.completed) completedModules++;
      });
    });
    
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  };
  
  const progress = calculateProgress();
  
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
          
          <h2 className="font-bold text-xl mb-2">{sectionTitle}</h2>
          
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
          {basicCourses.map((course, index) => (
            <div key={course.id} className="mb-2">
              {/* 课程标题 */}
              <button
                onClick={() => toggleCourse(course.id)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all",
                  activeCourse === course.id ? 
                    "bg-purple-50 text-purple-900" : 
                    "hover:bg-gray-50"
                )}
              >
                <span className="text-sm font-medium text-gray-500 w-8">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-medium text-sm">{course.title}</span>
                {expandedCourses.has(course.id) ? 
                  <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </button>
              
              {/* 模块列表 */}
              {expandedCourses.has(course.id) && (
                <div className="ml-12 mt-1">
                  {course.modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => {
                        setActiveCourse(course.id);
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
                        {module.completed ? 
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
        </div>
      </div>
      
      {/* 右侧内容区 */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* 面包屑导航 */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <Link href="/courses" className="hover:text-gray-900">课程</Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span>{sectionTitle}</span>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            <span className="text-gray-900">
              {basicCourses.find(c => c.id === activeCourse)?.title}
            </span>
          </nav>
          
          {/* 内容占位 */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-4">
              {basicCourses.find(c => c.id === activeCourse)?.title}
            </h1>
            <div className="text-gray-600">
              <p className="mb-4">当前模块：{basicCourses.find(c => c.id === activeCourse)?.modules.find(m => m.id === activeModule)?.title}</p>
              <p className="text-sm">课程内容将通过 Strapi 配置并显示在这里。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}