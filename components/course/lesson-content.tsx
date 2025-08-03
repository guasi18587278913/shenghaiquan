'use client';

import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface LessonContentProps {
  lesson: {
    type: string;
    content?: string;
    videoUrl?: string;
    wordpressSlug?: string;
  };
}

export default function LessonContent({ lesson }: LessonContentProps) {
  const [wordpressContent, setWordpressContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lesson.type === 'wordpress' && lesson.wordpressSlug) {
      fetchWordpressContent(lesson.wordpressSlug);
    }
  }, [lesson]);

  const fetchWordpressContent = async (slug: string) => {
    setLoading(true);
    try {
      // 先尝试从文章中获取
      let response = await fetch(`http://111.231.19.162/index.php?rest_route=/wp/v2/posts&slug=${slug}`);
      let data = await response.json();
      
      // 如果文章中没有找到，尝试从页面中获取
      if (!data || data.length === 0) {
        response = await fetch(`http://111.231.19.162/index.php?rest_route=/wp/v2/pages&slug=${slug}`);
        data = await response.json();
      }
      
      if (data && data.length > 0) {
        setWordpressContent(data[0].content.rendered);
      } else {
        console.log('No content found for slug:', slug);
        setWordpressContent('<p>未找到相关内容，请检查课程配置。</p>');
      }
    } catch (error) {
      console.error('Failed to fetch WordPress content:', error);
      setWordpressContent('<p>加载内容失败，请稍后重试。</p>');
    } finally {
      setLoading(false);
    }
  };

  // 视频课程
  if (lesson.type === 'video' && lesson.videoUrl) {
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full"
          src={lesson.videoUrl}
        >
          您的浏览器不支持视频播放
        </video>
      </div>
    );
  }

  // WordPress 文章
  if (lesson.type === 'wordpress') {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">加载内容中...</span>
        </div>
      );
    }

    if (wordpressContent) {
      return (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: wordpressContent }} />
        </div>
      );
    }
  }

  // 普通文章
  if (lesson.type === 'article' && lesson.content) {
    return (
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
      </div>
    );
  }

  // 无内容
  return (
    <div className="text-center py-12 text-gray-500">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <p>该课时暂无内容</p>
    </div>
  );
}