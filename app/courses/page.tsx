'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Play, 
  FileText, 
  Clock, 
  CheckCircle, 
  Calendar,
  Award,
  ChevronRight,
  TrendingUp,
  Users,
  Target,
  Zap,
  BookOpen,
  Lock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Trophy,
  Flame
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningCenterPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('learning');
  const [completedNode, setCompletedNode] = useState<string | null>(null);

  // 用户学习数据
  const learningStats = {
    totalHours: 2.5,
    completedLessons: 3,
    totalLessons: 15,
    currentStreak: 7,
    nextMilestone: 10,
    lastLesson: {
      section: 'basic',
      lesson: 2,
      title: '使用Cursor快速开发'
    }
  };

  // 学习路径数据 - 整合了目标信息
  const learningPath = [
    {
      id: 'preface',
      title: '前言',
      subtitle: '了解课程核心理念',
      duration: '30分钟',
      lessons: 3,
      status: 'completed',
      progress: 100,
      icon: 'sparkles',
      iconTooltip: '核心章节',
      color: 'violet',
      milestone: null
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
      currentLesson: '使用Cursor快速开发',
      milestone: {
        title: '第一周发布产品',
        description: '快速验证你的产品想法',
        icon: <Trophy className="w-4 h-4" />
      }
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
      color: 'emerald',
      milestone: {
        title: '掌握AI编程',
        description: '学会使用Cursor等AI工具',
        icon: <Zap className="w-4 h-4" />
      }
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
      color: 'orange',
      milestone: null
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
      color: 'indigo',
      milestone: {
        title: '构建商业闭环',
        description: '从MVP到可持续生意',
        icon: <Target className="w-4 h-4" />
      }
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
      gradient: 'from-violet-500 to-purple-600',
      light: 'bg-violet-100'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      progress: 'bg-blue-500',
      hover: 'hover:bg-blue-100',
      gradient: 'from-blue-500 to-cyan-600',
      light: 'bg-blue-100'
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      progress: 'bg-emerald-500',
      hover: 'hover:bg-emerald-100',
      gradient: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-100'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      progress: 'bg-orange-500',
      hover: 'hover:bg-orange-100',
      gradient: 'from-orange-500 to-amber-600',
      light: 'bg-orange-100'
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-700',
      progress: 'bg-indigo-500',
      hover: 'hover:bg-indigo-100',
      gradient: 'from-indigo-500 to-purple-600',
      light: 'bg-indigo-100'
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

  // 继续学习按钮点击
  const handleContinueLearning = () => {
    if (learningStats.lastLesson) {
      window.location.href = `/courses/${learningStats.lastLesson.section}/${learningStats.lastLesson.lesson}`;
    }
  };

  // 模拟完成节点
  const handleCompleteNode = (nodeId: string) => {
    setCompletedNode(nodeId);
    setTimeout(() => setCompletedNode(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部欢迎区域 - 简化设计 */}
      <div className="relative bg-gradient-to-br from-[#003D4D] via-[#005866] to-[#007A8C] text-white overflow-hidden">
        {/* 背景装饰 - 减少视觉干扰 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-0 w-48 h-48 bg-blue-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-24 pb-20">
          <div className="flex flex-col items-center">
            {/* 欢迎信息 - 居中显示 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl font-bold">
                欢迎回来，{session?.user?.name || '学员'}
              </h1>
            </motion.div>

            {/* 核心行动区 - 主要焦点 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full max-w-md"
            >
              <button
                onClick={handleContinueLearning}
                className="w-full bg-white text-[#005866] px-8 py-5 rounded-2xl text-lg font-semibold hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
              >
                <div className="p-2 bg-[#005866]/10 rounded-full group-hover:bg-[#005866]/20 transition-colors">
                  <Play className="w-5 h-5" />
                </div>
                <span>继续学习：{learningStats.lastLesson.title}</span>
                <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
              
              {/* 进度指示 - 更简洁 */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="text-xs text-cyan-200">当前进度</div>
                <div className="flex-1 max-w-[200px] bg-white/20 rounded-full h-1.5">
                  <div 
                    className="bg-white h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(learningStats.completedLessons / learningStats.totalLessons) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-cyan-200">
                  {Math.round((learningStats.completedLessons / learningStats.totalLessons) * 100)}%
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* 核心数据统计区 - 可交互 */}
        <div className="relative -mt-10 mb-8">
          <div className="grid grid-cols-4 gap-4">
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-100 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => console.log('跳转到学习数据分析')}
            >
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-cyan-600" />
                <BarChart3 className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{learningStats.totalHours}h</p>
              <p className="text-sm text-gray-500">学习时长</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-100 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => console.log('跳转到已完成课程')}
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{learningStats.completedLessons}/{learningStats.totalLessons}</p>
              <p className="text-sm text-gray-500">已完成</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-100 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => console.log('展示学习日历')}
            >
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <CalendarDays className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{learningStats.currentStreak}天</p>
              <p className="text-sm text-gray-500">连续学习</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -2 }}
              className="bg-white rounded-xl shadow-md p-5 border border-gray-100 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => console.log('高亮对应目标节点')}
            >
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-purple-600" />
                <Target className="w-4 h-4 text-gray-300" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{learningStats.nextMilestone}天</p>
              <p className="text-sm text-gray-500">下个目标</p>
            </motion.div>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="flex items-center gap-2 mb-8 bg-white rounded-xl p-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'learning'
                ? 'bg-gradient-to-r from-[#0891A1] to-[#17B8C4] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            学习路径
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'achievements'
                ? 'bg-gradient-to-r from-[#0891A1] to-[#17B8C4] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Award className="w-4 h-4" />
            我的成就
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-[#0891A1] to-[#17B8C4] text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            学习社区
          </button>
        </div>

        {/* 主内容区 - 左中双栏布局 */}
        {activeTab === 'learning' && (
          <div className="space-y-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900">学习路径</h2>
            
            {learningPath.map((section, index) => {
              const colors = colorMap[section.color as keyof typeof colorMap];
              const isLocked = section.status === 'locked' && !session;
              
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                          
                          {/* 图标和提示 */}
                          <div className="relative group">
                            <div className={`p-1.5 ${colors.light} rounded-lg`}>
                              {getIcon(section.icon, `w-5 h-5 ${colors.text}`)}
                            </div>
                            {section.iconTooltip && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {section.iconTooltip}
                              </div>
                            )}
                          </div>

                          {section.status === 'completed' && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium"
                            >
                              已完成
                            </motion.span>
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
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${section.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full`}
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

                        {/* 里程碑整合 */}
                        {section.milestone && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                {section.milestone.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{section.milestone.title}</h4>
                                <p className="text-xs text-gray-600 mt-0.5">{section.milestone.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* 社区联动 */}
                        <div className="mt-4 flex items-center gap-3 text-sm">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-[#0891A1] transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            查看相关讨论
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-[#0891A1] transition-colors">
                            <Users className="w-4 h-4" />
                            向同学提问
                          </button>
                        </div>
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
                </motion.div>
              );
            })}
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

      {/* 成就提示弹窗 - 示例 */}
      {completedNode && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -20, x: 20 }}
          className="fixed top-20 right-4 bg-white rounded-lg shadow-xl p-4 border border-gray-100 z-50"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">恭喜！完成了一个学习节点</p>
              <p className="text-sm text-gray-600">继续加油，离目标更近一步</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}