'use client';

import { useState, useEffect } from 'react';
import { getPosts, getCategories, WPPost, WPCategory } from '@/lib/wordpress-api';
import Link from 'next/link';
import { Clock, BookOpen, ChevronRight, Tag } from 'lucide-react';

export default function WordPressCoursesPage() {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [categories, setCategories] = useState<WPCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 加载分类
      if (categories.length === 0) {
        const categoriesData = await getCategories({ per_page: 100 });
        setCategories(categoriesData);
      }

      // 加载文章
      const postsData = await getPosts({
        categories: selectedCategory ? [selectedCategory] : undefined,
        per_page: 20,
        orderby: 'date',
        order: 'desc'
      });
      setPosts(postsData);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
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
            探索海洋的奥秘，学习专业知识
          </p>
        </div>

        {/* 分类筛选 */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                全部课程
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className="ml-1 text-sm opacity-80">({category.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 课程列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* 课程封面 */}
              {post._embedded?.['wp:featuredmedia']?.[0] && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={post._embedded['wp:featuredmedia'][0].source_url}
                    alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* 课程信息 */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {post.title.rendered}
                </h3>
                
                {post.excerpt.rendered && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {stripHtml(post.excerpt.rendered)}
                  </p>
                )}

                {/* 标签 */}
                {post._embedded?.['wp:term']?.[1] && post._embedded['wp:term'][1].length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post._embedded['wp:term'][1].slice(0, 3).map((tag) => (
                      <span 
                        key={tag.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded"
                      >
                        <Tag className="w-3 h-3" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* 元信息 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    免费
                  </span>
                </div>

                {/* 查看按钮 */}
                <Link
                  href={`/courses/wp/${post.slug}`}
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
              请先在 WordPress 后台添加文章作为课程
            </p>
          </div>
        )}

        {/* 使用提示 */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            如何在 WordPress 中创建课程？
          </h2>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li>登录 WordPress 后台：http://111.231.19.162/wp-admin</li>
            <li>点击左侧菜单的【文章】→【写文章】</li>
            <li>填写课程标题和内容（支持图文并茂）</li>
            <li>设置特色图片（作为课程封面）</li>
            <li>选择或创建分类（如：基础课程、进阶课程）</li>
            <li>添加标签（如：海洋生物、深海探索）</li>
            <li>点击【发布】即可在这里看到</li>
          </ol>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>提示：</strong>您可以安装一些 WordPress 插件来增强功能，如：
              <br />• Elementor - 可视化页面编辑器
              <br />• WP Rocket - 提升网站速度
              <br />• Yoast SEO - 优化搜索引擎排名
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}