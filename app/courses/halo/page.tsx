'use client';

import { useState, useEffect } from 'react';
import { haloService, HaloPost, HaloCategory } from '@/lib/halo-api';
import Link from 'next/link';
import { Clock, BookOpen, ChevronRight } from 'lucide-react';

export default function HaloCoursesPage() {
  const [posts, setPosts] = useState<HaloPost[]>([]);
  const [categories, setCategories] = useState<HaloCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载分类
      if (categories.length === 0) {
        const categoriesData = await haloService.getCategories();
        setCategories(categoriesData.items || []);
      }

      // 加载文章
      const postsData = await haloService.getPosts({
        categoryName: selectedCategory,
        size: 20
      });
      setPosts(postsData.items || []);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            深海圈课程中心
          </h1>
          <p className="text-xl text-gray-600">
            基于 Halo CMS 的课程管理系统
          </p>
        </div>

        {/* 分类筛选 */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                全部课程
              </button>
              {categories.map((category) => (
                <button
                  key={category.metadata.name}
                  onClick={() => setSelectedCategory(category.metadata.name)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.metadata.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.spec.displayName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 课程列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.metadata.name}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* 课程封面 */}
              {post.spec.cover && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={post.spec.cover}
                    alt={post.spec.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 课程信息 */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.spec.title}
                </h3>
                
                {post.spec.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.spec.excerpt}
                  </p>
                )}

                {/* 元信息 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(post.metadata.creationTimestamp).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    免费
                  </span>
                </div>

                {/* 查看按钮 */}
                <Link
                  href={`/courses/halo/${post.spec.slug}`}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  查看课程
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">暂无课程</p>
            <p className="text-sm text-gray-400">
              请先在 Halo 后台添加文章作为课程
            </p>
          </div>
        )}

        {/* 管理提示 */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            如何管理课程？
          </h2>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li>访问 Halo 后台：http://111.231.19.162:8090/console</li>
            <li>使用管理员账号登录（用户名：admin）</li>
            <li>在"文章"菜单中创建课程内容</li>
            <li>设置分类（如：基础篇、进阶篇）</li>
            <li>发布后即可在此页面看到</li>
          </ol>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>首次登录提示：</strong>初始密码是 P@88w0rd，请立即修改！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}