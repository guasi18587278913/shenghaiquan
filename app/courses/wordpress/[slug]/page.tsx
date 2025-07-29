'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  slug: string;
  date: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      // 先尝试通过 slug 获取
      fetch(`http://111.231.19.162/index.php?rest_route=/wp/v2/posts&slug=${params.slug}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setPost(data[0]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error:', err);
          setLoading(false);
        });
    }
  }, [params.slug]);

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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">课程未找到</p>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700"
          >
            返回课程列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          ← 返回课程列表
        </button>
      </div>

      <article className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-8">
          <h1 
            className="text-3xl font-bold text-gray-900 mb-4"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />

          <div className="text-sm text-gray-600 mb-6 pb-6 border-b">
            发布日期：{new Date(post.date).toLocaleDateString('zh-CN')}
          </div>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />
        </div>
      </article>
    </div>
  );
}