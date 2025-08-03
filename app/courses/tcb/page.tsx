'use client';

import { useState, useEffect } from 'react';
import { courseService } from '@/lib/tcb';
import Link from 'next/link';
import { Play, FileText, Clock, Lock } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function TCBCoursesPage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAllCourses();
      setCourses(data);
    } catch (err: any) {
      console.error('加载课程失败:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载课程中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载失败：{error}</p>
          <button 
            onClick={loadCourses}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            深海圈课程中心
          </h1>
          <p className="text-xl text-gray-600">
            基于腾讯云CMS的课程管理系统
          </p>
        </div>

        {/* 课程网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div 
              key={course._id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* 课程封面 */}
              {course.cover && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img 
                    src={course.cover} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* 课程信息 */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                {/* 课程统计 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {course.lessonCount || 0} 课时
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration || 0} 小时
                  </span>
                </div>
                
                {/* 操作按钮 */}
                <Link
                  href={`/courses/tcb/${course.slug}`}
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  开始学习
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {courses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">暂无课程</p>
            <p className="text-sm text-gray-400">
              请先在腾讯云CMS后台添加课程
            </p>
          </div>
        )}

        {/* 提示信息 */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            如何添加课程？
          </h2>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>登录腾讯云CloudBase控制台</li>
            <li>进入CMS内容管理系统</li>
            <li>在"课程"菜单中添加新课程</li>
            <li>填写课程信息并发布</li>
            <li>刷新本页面即可看到新课程</li>
          </ol>
        </div>
      </div>
    </div>
  );
}