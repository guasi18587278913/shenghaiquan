'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WPPost {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
}

export default function WordPressCoursesPage() {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://111.231.19.162/index.php?rest_route=/wp/v2/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            深海圈课程中心
          </h1>
          <p className="text-xl text-gray-600">
            探索海洋的奥秘，学习专业知识
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 
                  className="text-xl font-semibold text-gray-900 mb-2"
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                />
                
                <div 
                  className="text-gray-600 mb-4 line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                />

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>
                    {new Date(post.date).toLocaleDateString('zh-CN')}
                  </span>
                  <span>免费</span>
                </div>

                <Link
                  href={`/courses/wordpress/${post.slug}`}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  查看课程 →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">暂无课程</p>
          </div>
        )}

        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            如何在 WordPress 中创建课程？
          </h2>
          <ol className="list-decimal list-inside text-blue-800 space-y-2">
            <li>登录 WordPress 后台：http://111.231.19.162/wp-admin</li>
            <li>点击左侧菜单的【文章】→【写文章】</li>
            <li>填写课程标题和内容</li>
            <li>点击【发布】即可在这里看到</li>
          </ol>
        </div>
      </div>
    </div>
  );
}