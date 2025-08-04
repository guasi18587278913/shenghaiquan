'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  Play, 
  FileText, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Users,
  Target,
  Zap,
  BookOpen,
  Lock,
  Sparkles,
  TrendingUp,
  Award,
  Flame,
  Star,
  Trophy,
  ChevronRight,
  Rocket,
  Brain,
  Code,
  MessageCircle,
  Layers,
  Gift,
  Crown,
  Medal,
  BarChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import UserChat from '@/components/chat/UserChat';

interface CourseSection {
  id: string;
  title: string;
  slug: string;
  courses?: any[];
  _count?: { courses: number };
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('/api/courses/sections');
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const calculateStats = () => {
    const totalCourses = sections.reduce((acc, section) => 
      acc + (section._count?.courses || section.courses?.length || 0), 0
    );
    const totalLessons = totalCourses * 3;
    const totalHours = Math.round(totalLessons * 0.3);
    
    return {
      sectionsCount: sections.length,
      coursesCount: totalCourses,
      lessonsCount: totalLessons,
      hoursCount: totalHours
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 relative mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-teal-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 animate-pulse">正在加载课程...</p>
        </div>
      </div>
    );
  }

  // 用户数据（示例）
  const userData = {
    level: 5,
    xp: 1250,
    nextLevelXP: 2000,
    streak: 7,
    totalHours: 28.5,
    completedCourses: 12,
    certificates: 2
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部用户信息栏 - 添加固定定位和z-index */}
      <div className="bg-white border-b fixed top-16 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* 左侧：用户信息 */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {session?.user?.name?.[0] || '测'}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-gray-900 text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  Lv.{userData.level}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{session?.user?.name || '测试用户'}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span>{userData.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span>{userData.streak}天连续</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：学习统计 */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{userData.totalHours}h</p>
                <p className="text-xs text-gray-500">学习时长</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{userData.completedCourses}</p>
                <p className="text-xs text-gray-500">完成课程</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{userData.certificates}</p>
                <p className="text-xs text-gray-500">获得证书</p>
              </div>
            </div>
          </div>

          {/* 等级进度条 */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">等级进度</span>
              <span className="text-gray-900 font-medium">{userData.xp}/{userData.nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(userData.xp / userData.nextLevelXP) * 100}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 课程板块网格 - 添加顶部间距 */}
      <div className="max-w-7xl mx-auto px-4 pt-48">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 前言 - Start Here */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/courses/preface">
              <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                {/* 顶部大图标区域 */}
                <div className="relative h-48 bg-gradient-to-r from-[#14b8a6] to-[#0891b2] p-8 flex flex-col items-center justify-center">
                  <div className="absolute top-4 left-4">
                    <p className="text-xs text-white/90 font-medium">深海圈动态</p>
                  </div>
                  <div className="absolute top-4 right-4 bg-orange-500 px-3 py-1 rounded-full text-sm font-medium text-white">
                    🔥 最热
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">前言</h3>
                  <p className="text-white/80 text-sm">开始学习</p>
                </div>

                {/* 内容区域 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">前言</h4>
                  <p className="text-gray-600 mb-4">
                    新手必看！了解课程体系，制定学习计划，10分钟快速上手AI产品开发。
                  </p>
                  
                  {/* 课程数量 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        3 个课程
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        30分钟
                      </span>
                    </div>
                    <span className="text-sm font-medium text-orange-600">+100 XP</span>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">完成进度</span>
                      <span className="text-gray-900 font-medium">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="w-full h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* 按钮 */}
                  <button className="w-full bg-green-50 text-green-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    已完成
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 基础篇 - Basic Courses */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/courses/basic">
              <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                {/* 顶部大图标区域 */}
                <div className="relative h-48 bg-[#a78bfa] p-8 flex flex-col items-center justify-center">
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                    基础课程
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">基础篇</h3>
                  <p className="text-white/80 text-sm">基础技能</p>
                </div>

                {/* 内容区域 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">基础篇</h4>
                  <p className="text-gray-600 mb-4">
                    零基础友好！学习Cursor、快速原型开发，10分钟打造你的第一个AI产品。
                  </p>
                  
                  {/* 课程数量 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        5 个课程
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        2小时
                      </span>
                    </div>
                    <span className="text-sm font-medium text-blue-600">+300 XP</span>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">完成进度</span>
                      <span className="text-gray-900 font-medium">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="w-[35%] h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* 按钮 */}
                  <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 group-hover:shadow-lg transition-shadow">
                    继续学习
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 认知篇 - Advanced Mindset */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/courses/core">
              <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                {/* 顶部大图标区域 */}
                <div className="relative h-48 bg-[#fdba74] p-8 flex flex-col items-center justify-center">
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                    思维进阶
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">认知篇</h3>
                  <p className="text-white/80 text-sm">产品思维</p>
                </div>

                {/* 锁定遮罩 */}
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 shadow-xl">
                    <Lock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">认知篇</h4>
                  <p className="text-gray-600 mb-4">
                    建立正确的AI产品思维，理解商业本质，掌握海外软件生意的核心逻辑。
                  </p>
                  
                  {/* 课程数量 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        4 个课程
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        3小时
                      </span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">+500 XP</span>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">完成进度</span>
                      <span className="text-gray-900 font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="w-0 h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* 按钮 */}
                  <button className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-medium cursor-not-allowed">
                    待解锁
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 内功篇 - Technical Foundation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/courses/skills">
              <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                {/* 顶部大图标区域 */}
                <div className="relative h-48 bg-[#c084fc] p-8 flex flex-col items-center justify-center">
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                    技术深度
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">内功篇</h3>
                  <p className="text-white/80 text-sm">技术内功</p>
                </div>

                {/* 锁定遮罩 */}
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 shadow-xl">
                    <Lock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">内功篇</h4>
                  <p className="text-gray-600 mb-4">
                    深入技术原理，掌握编程基础，构建系统架构思维，打造技术护城河。
                  </p>
                  
                  {/* 课程数量 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        6 个课程
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        4小时
                      </span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">+800 XP</span>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">完成进度</span>
                      <span className="text-gray-900 font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="w-0 h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* 按钮 */}
                  <button className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-medium cursor-not-allowed">
                    待解锁
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 进阶篇 - Business & Scale */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/courses/advanced">
              <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                {/* 顶部大图标区域 */}
                <div className="relative h-48 bg-[#86efac] p-8 flex flex-col items-center justify-center">
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                    高级进阶
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">进阶篇</h3>
                  <p className="text-white/80 text-sm">商业闭环</p>
                </div>

                {/* 锁定遮罩 */}
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="bg-white rounded-full p-3 shadow-xl">
                    <Lock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>

                {/* 内容区域 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">进阶篇</h4>
                  <p className="text-gray-600 mb-4">
                    从MVP到规模化，学习高级功能开发、商业化运营，打造可持续的生意。
                  </p>
                  
                  {/* 课程数量 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        5 个课程
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        5小时
                      </span>
                    </div>
                    <span className="text-sm font-medium text-red-600">+1000 XP</span>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">完成进度</span>
                      <span className="text-gray-900 font-medium">0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="w-0 h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* 按钮 */}
                  <button className="w-full bg-gray-100 text-gray-500 py-3 rounded-xl font-medium cursor-not-allowed">
                    待解锁
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 问答篇 - Q&A & Community */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link href="/courses/appendix">
              <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden h-full">
                {/* 顶部大图标区域 */}
                <div className="relative h-48 bg-[#64748b] p-8 flex flex-col items-center justify-center">
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium text-white">
                    持续更新
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-2">问答社区</h3>
                  <p className="text-white/80 text-sm">持续更新</p>
                </div>

                {/* 更新标签 */}
                <div className="absolute top-0 left-0">
                  <div className="w-16 h-16 bg-green-500 transform rotate-45 -translate-x-8 -translate-y-8"></div>
                  <span className="absolute top-2 left-2 text-white text-xs font-bold">新</span>
                </div>

                {/* 内容区域 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">问答</h4>
                  <p className="text-gray-600 mb-4">
                    常见问题解答，经验分享，与其他学员交流心得，共同成长进步。
                  </p>
                  
                  {/* 课程数量 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        持续更新
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        社区互动
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">+200 XP</span>
                  </div>

                  {/* 最新动态 */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">最新回答</p>
                    <p className="text-sm text-gray-700">如何快速上手Cursor？</p>
                  </div>

                  {/* 按钮 */}
                  <button className="w-full bg-gradient-to-r from-gray-600 to-gray-800 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 group-hover:shadow-lg transition-shadow">
                    查看问答
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* 底部成就和排行榜 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pb-12">
          {/* 最新成就 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              最新成就
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: '连续学习', icon: '🔥', desc: '连续7天' },
                { name: 'AI先锋', icon: '⚡', desc: '完成基础篇' },
                { name: '快速学习者', icon: '🎯', desc: '首个课程' }
              ].map((achievement, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-2 text-3xl">
                    {achievement.icon}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{achievement.name}</p>
                  <p className="text-xs text-gray-500">{achievement.desc}</p>
                </div>
              ))}
            </div>
            <Link href="/achievements" className="mt-6 inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium">
              查看全部成就
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* 本周排行榜 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Crown className="w-6 h-6 text-orange-500" />
              本周排行榜
            </h3>
            <div className="space-y-3">
              {[
                { name: '学习达人', xp: 2850, rank: 1, avatar: '👨‍💻' },
                { name: 'AI探索者', xp: 2650, rank: 2, avatar: '👩‍🚀' },
                { name: '产品新星', xp: 2400, rank: 3, avatar: '🧑‍💼' }
              ].map((user) => (
                <div key={user.rank} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${
                      user.rank === 1 ? 'text-yellow-500' : 
                      user.rank === 2 ? 'text-gray-400' : 
                      'text-orange-400'
                    }`}>#{user.rank}</span>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-xl">
                      {user.avatar}
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">{user.xp} XP</span>
                </div>
              ))}
            </div>
            <Link href="/leaderboard" className="mt-6 inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium">
              查看完整排行榜
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* 聊天功能 */}
      <UserChat />
    </div>
  );
}