'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPost, WPPost } from '@/lib/wordpress-api';
import { ArrowLeft, Clock, Tag, User } from 'lucide-react';

export default function WordPressCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      loadPost(params.slug as string);
    }
  }, [params.slug]);

  const loadPost = async (slug: string) => {
    setLoading(true);
    try {
      const postData = await getPost(slug);
      setPost(postData);
    } catch (error) {
      console.error('加载文章失败:', error);
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
      {/* 返回按钮 */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回课程列表
        </button>
      </div>

      {/* 文章内容 */}
      <article className="max-w-4xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 特色图片 */}
          {post._embedded?.['wp:featuredmedia']?.[0] && (
            <div className="h-64 md:h-96 overflow-hidden">
              <img
                src={post._embedded['wp:featuredmedia'][0].source_url}
                alt={post._embedded['wp:featuredmedia'][0].alt_text || post.title.rendered}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* 标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title.rendered}
            </h1>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(post.date)}
              </span>

              {/* 分类 */}
              {post._embedded?.['wp:term']?.[0] && (
                <span className="flex items-center gap-1">
                  {post._embedded['wp:term'][0].map((cat) => cat.name).join(', ')}
                </span>
              )}
            </div>

            {/* 标签 */}
            {post._embedded?.['wp:term']?.[1] && post._embedded['wp:term'][1].length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post._embedded['wp:term'][1].map((tag) => (
                  <span 
                    key={tag.id}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* 文章内容 */}
            <div 
              className="prose prose-lg max-w-none wp-content"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
          </div>
        </div>

        {/* 相关操作 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            学习建议
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li>• 建议按照章节顺序学习</li>
            <li>• 遇到不懂的概念可以查阅相关资料</li>
            <li>• 完成学习后可以进行实践练习</li>
            <li>• 欢迎在评论区分享学习心得</li>
          </ul>
        </div>
      </article>

      {/* 添加 WordPress 内容样式 */}
      <style jsx global>{`
        .wp-content {
          line-height: 1.8;
        }
        
        .wp-content h1,
        .wp-content h2,
        .wp-content h3,
        .wp-content h4,
        .wp-content h5,
        .wp-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        
        .wp-content p {
          margin-bottom: 1.5rem;
        }
        
        .wp-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem auto;
          display: block;
        }
        
        .wp-content ul,
        .wp-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }
        
        .wp-content li {
          margin-bottom: 0.5rem;
        }
        
        .wp-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #4b5563;
        }
        
        .wp-content pre {
          background-color: #f3f4f6;
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 2rem 0;
        }
        
        .wp-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        
        .wp-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .wp-content a:hover {
          color: #2563eb;
        }
        
        .wp-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2rem 0;
        }
        
        .wp-content table th,
        .wp-content table td {
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          text-align: left;
        }
        
        .wp-content table th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        
        .wp-content iframe {
          max-width: 100%;
          margin: 2rem auto;
          display: block;
        }
      `}</style>
    </div>
  );
}