'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Play, 
  FileText, 
  Clock, 
  CheckCircle, 
  MoreVertical,
  Calendar,
  BarChart3,
  Award,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Users,
  Star,
  Target,
  Zap,
  BookOpen,
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CoursesPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('learning');

  // 模拟用户的学习数据
  const learningStats = {
    totalHours: 2.5,
    completedLessons: 3,
    currentStreak: 7,
    nextMilestone: 10
  };

  // 课程章节数据
  const courseSections = [
    {
      id: 'preface',
      title: '前言',
      subtitle: '了解课程核心理念',
      duration: '30分钟',
      lessons: 3,
      status: 'completed',
      progress: 100,
      icon: 'sparkles',
      color: 'violet'
    },
    {
      id: 'basic',
      title: '基础篇',
      subtitle: '10分钟搞定产品雏形',
      duration: '2小时',
      lessons: 5,
      status: 'in-progress',
      progress: 40,
      icon: 'target',
      color: 'blue',
      currentLesson: '使用Cursor快速开发'
    },
    {
      id: 'cognition',
      title: '认知篇',
      subtitle: '海外软件生意认知体系',
      duration: '3小时',
      lessons: 5,
      status: 'locked',
      progress: 0,
      icon: 'book-open',
      color: 'emerald'
    },
    {
      id: 'internal',
      title: '内功篇',
      subtitle: '补齐技术原理',
      duration: '选修',
      lessons: 3,
      status: 'locked',
      progress: 0,
      icon: 'zap',
      color: 'orange'
    },
    {
      id: 'advanced',
      title: '进阶篇',
      subtitle: '从MVP到商业闭环',
      duration: '深入提升',
      lessons: 3,
      status: 'locked',
      progress: 0,
      icon: 'trending-up',
      color: 'indigo'
    }
  ];

  // 颜色映射
  const colorMap = {
    violet: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-700',
      progress: 'bg-violet-500',
      hover: 'hover:bg-violet-100',
      gradient: 'from-violet-500 to-purple-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      progress: 'bg-blue-500',
      hover: 'hover:bg-blue-100',
      gradient: 'from-blue-500 to-cyan-600'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      progress: 'bg-emerald-500',
      hover: 'hover:bg-emerald-100',
      gradient: 'from-emerald-500 to-teal-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      progress: 'bg-orange-500',
      hover: 'hover:bg-orange-100',
      gradient: 'from-orange-500 to-amber-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
      progress: 'bg-indigo-500',
      hover: 'hover:bg-indigo-100',
      gradient: 'from-indigo-500 to-purple-600'
    }
  };

  // 图标映射
  const getIcon = (iconType: string, className: string) => {
    switch (iconType) {
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'book-open':
        return <BookOpen className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'trending-up':
        return <TrendingUp className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const tabs = [
    { id: 'learning', label: '学习路径', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'achievements', label: '我的成就', icon: <Award className="w-4 h-4" /> },
    { id: 'community', label: '学习社区', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部欢迎区域 - 深海渐变 */}
      <div className="relative bg-gradient-to-br from-[#003D4D] via-[#005866] to-[#007A8C] text-white overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 pb-24">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-3">
              {session ? `欢迎回来，${session.user?.name || '学员'}` : '深海圈 AI 产品实战课程'}
            </h1>
            <p className="text-cyan-100 text-lg mb-8 max-w-3xl mx-auto">
              {session ? '继续你的 AI 产品开发学习之旅' : '从产品 idea、到使用 AI 编程做出软件产品、到变现、到成为一门可持续生意的全流程'}
            </p>

            {/* 核心理念 */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-cyan-300" />
                <span className="text-sm">第一周就能发布产品</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-cyan-300" />
                <span className="text-sm">全面使用 AI 编程</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-cyan-300" />
                <span className="text-sm">四步学习 + 2个作品</span>
              </div>
            </div>

            {!session && (
              <div className="flex justify-center gap-4">
                <Link
                  href="/login"
                  className="bg-white text-[#005866] px-6 py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  立即开始
                </Link>
                <Link
                  href="#preview"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all"
                >
                  免费预览
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* 学习统计卡片 - 跨越两个区域 */}
        {session && (
          <div className="relative -mt-16 mb-8">
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-50 rounded-lg">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <span className="text-sm text-gray-600">学习时长</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{learningStats.totalHours}h</p>
                <p className="text-xs text-gray-500 mt-1">本周累计</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">已完成</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{learningStats.completedLessons}课</p>
                <p className="text-xs text-gray-500 mt-1">共15课</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-600">连续学习</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{learningStats.currentStreak}天</p>
                <p className="text-xs text-gray-500 mt-1">继续保持！</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">下个里程碑</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{learningStats.nextMilestone}天</p>
                <p className="text-xs text-gray-500 mt-1">连续学习目标</p>
              </div>
            </div>
          </div>
        )}

        {/* 标签导航 */}
        <div className="flex items-center gap-2 mb-8 bg-white rounded-xl p-1.5 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#0891A1] to-[#17B8C4] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 主内容区 */}
        {activeTab === 'learning' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* 学习路径 */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">学习路径</h2>
              
              {courseSections.map((section, index) => {
                const colors = colorMap[section.color as keyof typeof colorMap];
                const isLocked = section.status === 'locked' && !session;
                
                return (
                  <div
                    key={section.id}
                    className={`relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden ${
                      isLocked ? 'opacity-75' : ''
                    }`}
                  >
                    {/* 章节序号 */}
                    <div className="absolute top-6 left-6 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-600">{index + 1}</span>
                    </div>

                    <div className="p-6 pl-24">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                            {section.status === 'completed' && (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                已完成
                              </span>
                            )}
                            {section.status === 'in-progress' && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                学习中
                              </span>
                            )}
                            {isLocked && (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{section.subtitle}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {section.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {section.lessons} 课时
                            </span>
                          </div>

                          {/* 进度条 */}
                          {section.status !== 'locked' && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600">完成进度</span>
                                <span className={`font-medium ${colors.text}`}>{section.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                  className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full transition-all duration-500`}
                                  style={{ width: `${section.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* 当前课程提示 */}
                          {section.currentLesson && (
                            <div className={`mt-4 ${colors.bg} ${colors.border} border rounded-lg p-3`}>
                              <p className="text-sm text-gray-600">当前学习</p>
                              <p className={`font-medium ${colors.text}`}>{section.currentLesson}</p>
                            </div>
                          )}
                        </div>

                        {/* 章节图标 */}
                        <div className={`p-3 ${colors.bg} rounded-xl`}>
                          {getIcon(section.icon, `w-8 h-8 ${colors.text}`)}
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="mt-6 flex items-center gap-3">
                        {section.status === 'completed' && (
                          <Link
                            href={`/courses/${section.id}/1`}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
                          >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            查看复习
                          </Link>
                        )}
                        {section.status === 'in-progress' && (
                          <Link
                            href={`/courses/${section.id}/2`}
                            className={`flex items-center gap-2 bg-gradient-to-r ${colors.gradient} text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all`}
                          >
                            继续学习
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        )}
                        {section.status === 'locked' && !session && (
                          <Link
                            href="/login"
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium"
                          >
                            <Lock className="w-4 h-4" />
                            登录解锁
                          </Link>
                        )}
                        {section.status === 'locked' && session && (
                          <button
                            disabled
                            className="flex items-center gap-2 text-gray-400 font-medium cursor-not-allowed"
                          >
                            <Lock className="w-4 h-4" />
                            完成前置章节后解锁
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 学习目标卡片 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#0891A1]" />
                  学习目标
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">第一周发布产品</p>
                      <p className="text-sm text-gray-500">快速验证你的产品想法</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">掌握 AI 编程</p>
                      <p className="text-sm text-gray-500">学会使用 Cursor 等工具</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">构建商业闭环</p>
                      <p className="text-sm text-gray-500">从 MVP 到可持续生意</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 课程特色 */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">课程特色</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="text-sm text-gray-700">实战导向，边学边做</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="text-sm text-gray-700">导师辅导，社群支持</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-gray-700">持续更新，紧跟趋势</span>
                  </div>
                </div>
              </div>

              {/* 加入会员 */}
              {!session && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                  <Award className="w-8 h-8 text-amber-600 mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">升级年度会员</h3>
                  <p className="text-sm text-gray-600 mb-4">解锁全部课程内容，加入专属学习社群</p>
                  <Link
                    href="/membership"
                    className="block w-full text-center bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  >
                    了解会员权益
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 成就页面 */}
        {activeTab === 'achievements' && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">成就系统即将上线</h3>
            <p className="text-gray-600">完成学习任务，解锁成就徽章，展示你的学习成果</p>
          </div>
        )}

        {/* 社区页面 */}
        {activeTab === 'community' && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">学习社区即将开放</h3>
            <p className="text-gray-600">与其他学员交流心得，分享作品，共同成长</p>
          </div>
        )}
      </div>
    </div>
  );
}