'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Play, FileText, Clock, Lock, CheckCircle, ArrowRight, Sparkles, BookOpen, Users, Target } from 'lucide-react';

export default function NewCoursesPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState('preface');

  // 课程结构（根据您的实际内容）
  const courseSections = [
    {
      id: 'preface',
      title: '前言',
      description: '了解课程核心理念与学习路径',
      duration: '30分钟',
      type: 'document',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      isFree: true,
      lessons: [
        { title: '这套课程有什么不同？', duration: '10分钟', type: 'document' },
        { title: '你要学什么？', duration: '10分钟', type: 'document' },
        { title: '学习门槛说明', duration: '10分钟', type: 'document' }
      ]
    },
    {
      id: 'basic',
      title: '基础篇',
      description: '10分钟搞定产品雏形',
      duration: '2小时',
      type: 'video',
      icon: <Target className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      isFree: false,
      lessons: [
        { title: '选择你的第一个产品idea', duration: '20分钟', type: 'video' },
        { title: '使用Cursor快速开发', duration: '30分钟', type: 'video' },
        { title: '部署你的第一个产品', duration: '20分钟', type: 'video' },
        { title: '获取第一批用户', duration: '25分钟', type: 'video' },
        { title: '收集反馈并迭代', duration: '25分钟', type: 'video' }
      ]
    },
    {
      id: 'cognition',
      title: '认知篇',
      description: '海外软件生意认知体系',
      duration: '3小时',
      type: 'document',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      isFree: false,
      lessons: [
        { title: '什么是MicroSaaS', duration: '40分钟', type: 'document' },
        { title: '如何寻找利基市场', duration: '40分钟', type: 'document' },
        { title: '定价策略', duration: '30分钟', type: 'document' },
        { title: '用户获取渠道', duration: '40分钟', type: 'document' },
        { title: '产品迭代思维', duration: '30分钟', type: 'document' }
      ]
    },
    {
      id: 'internal',
      title: '内功篇',
      description: '补齐技术原理',
      duration: '选修',
      type: 'mixed',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      isFree: false,
      lessons: [
        { title: 'NextJS核心概念', duration: '60分钟', type: 'document' },
        { title: '数据库设计基础', duration: '45分钟', type: 'document' },
        { title: 'API设计原理', duration: '45分钟', type: 'document' }
      ]
    },
    {
      id: 'advanced',
      title: '进阶篇',
      description: '从MVP到商业闭环',
      duration: '深入提升',
      type: 'mixed',
      icon: <Users className="w-6 h-6" />,
      color: 'from-indigo-500 to-purple-500',
      isFree: false,
      lessons: [
        { title: '集成支付系统', duration: '90分钟', type: 'video' },
        { title: '用户系统设计', duration: '60分钟', type: 'mixed' },
        { title: '数据分析和优化', duration: '45分钟', type: 'document' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - 学习路径图 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              深海圈 AI 产品实战课程
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              从产品 idea、到使用 AI 编程做出软件产品、到变现、到成为一门可持续生意的全流程
            </p>
          </div>

          {/* 核心理念 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  四步学习 + 2个作品
                </h2>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span>第一周就能发布自己的产品</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span>全面使用 AI，无需编程基础</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span>探讨软件产品生意全流程</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                    <span>持续更新，与AI发展同步</span>
                  </li>
                </ul>
              </div>
              <div className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">学习路径</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium">前言</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium">基础</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium">认知</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-2 mt-4">
                        <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium">内功</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                        <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium">进阶</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 课程内容区 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">课程章节</h3>
              <div className="space-y-2">
                {courseSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r ' + section.color + ' text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={activeSection === section.id ? 'text-white' : 'text-gray-500'}>
                          {section.icon}
                        </div>
                        <div>
                          <div className="font-medium">{section.title}</div>
                          <div className={`text-xs ${activeSection === section.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {section.duration} · {section.lessons.length} 课时
                          </div>
                        </div>
                      </div>
                      {!section.isFree && !session && (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* 加入会员提示 */}
              {!session && (
                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-900 mb-3">
                    升级年度会员，解锁全部课程内容
                  </p>
                  <Link
                    href="/membership"
                    className="block w-full text-center py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    成为会员
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-2">
            {courseSections.map((section) => (
              <div
                key={section.id}
                className={`${activeSection === section.id ? 'block' : 'hidden'}`}
              >
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* 章节头部 */}
                  <div className={`bg-gradient-to-r ${section.color} p-8 text-white`}>
                    <div className="flex items-center space-x-4 mb-4">
                      {section.icon}
                      <h2 className="text-3xl font-bold">{section.title}</h2>
                    </div>
                    <p className="text-lg text-white/90">{section.description}</p>
                    <div className="mt-4 flex items-center space-x-6 text-sm text-white/80">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {section.duration}
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" />
                        {section.lessons.length} 课时
                      </span>
                      <span className="flex items-center">
                        {section.type === 'video' && <Play className="w-4 h-4 mr-1" />}
                        {section.type === 'document' && <FileText className="w-4 h-4 mr-1" />}
                        {section.type === 'video' ? '视频课程' : section.type === 'document' ? '文档课程' : '混合课程'}
                      </span>
                    </div>
                  </div>

                  {/* 课时列表 */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">课程内容</h3>
                    <div className="space-y-3">
                      {section.lessons.map((lesson, index) => (
                        <Link
                          key={index}
                          href={section.isFree || session ? `/courses/${section.id}/${index + 1}` : '/membership'}
                          className="block"
                        >
                          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                {lesson.type === 'video' ? (
                                  <Play className="w-5 h-5 text-gray-600" />
                                ) : (
                                  <FileText className="w-5 h-5 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                <p className="text-sm text-gray-500">{lesson.duration}</p>
                              </div>
                            </div>
                            {!section.isFree && !session ? (
                              <Lock className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ArrowRight className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}