// 课程数据配置
// 这里定义静态的课程结构，包括 WordPress 文章链接

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'wordpress' | 'quiz';
  content?: string;
  videoUrl?: string;
  wordpressSlug?: string;  // WordPress 文章的 slug
  duration?: string;
  order: number;
  isFree?: boolean;
  isNew?: boolean;
  updatedAt?: string;
}

export interface Section {
  id: string;
  slug: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

// 课程数据
export const courseSections: Record<string, Section> = {
  preface: {
    id: 'preface',
    slug: 'preface',
    title: '前言',
    description: '了解课程核心理念',
    lessons: [
      {
        id: 'preface-1',
        title: '这套课程有什么不同?',
        type: 'wordpress',
        wordpressSlug: '%e8%bf%99%e5%a5%97%e8%af%be%e7%a8%8b%e6%9c%89%e4%bb%80%e4%b9%88%e4%b8%8d%e5%90%8c%ef%bc%9f',
        duration: '10分钟',
        order: 1,
        isFree: true,
        isNew: true,
        updatedAt: '2025-01-29'
      },
      {
        id: 'preface-2',
        title: '学习路径介绍',
        type: 'article',
        content: '本课程将带你从零开始...',
        duration: '5分钟',
        order: 2,
        isFree: true
      },
      {
        id: 'preface-3',
        title: '开发环境准备',
        type: 'video',
        videoUrl: 'https://example.com/video1.mp4',
        duration: '15分钟',
        order: 3,
        isFree: true
      }
    ]
  },
  basic: {
    id: 'basic',
    slug: 'basic',
    title: '基础篇',
    description: '10分钟搞定产品雏形',
    lessons: [
      {
        id: 'basic-1',
        title: '认识 Cursor',
        type: 'article',
        content: 'Cursor 是一个 AI 编程工具...',
        duration: '8分钟',
        order: 1,
        isFree: true
      },
      {
        id: 'basic-2',
        title: '第一个 AI 应用',
        type: 'video',
        videoUrl: 'https://example.com/video2.mp4',
        duration: '20分钟',
        order: 2,
        isFree: false
      }
    ]
  },
  // 可以继续添加其他章节...
};

// 获取章节数据
export function getSection(sectionSlug: string): Section | null {
  return courseSections[sectionSlug] || null;
}

// 获取课时数据
export function getLesson(sectionSlug: string, lessonOrder: number): Lesson | null {
  const section = getSection(sectionSlug);
  if (!section) return null;
  
  return section.lessons.find(lesson => lesson.order === lessonOrder) || null;
}

// 获取用户的课程进度（示例）
export async function getUserProgress(userId: string, sectionSlug: string) {
  // 这里应该从数据库获取真实的用户进度
  // 现在返回模拟数据
  return {
    completedLessons: ['preface-1'],
    currentLesson: 'preface-2',
    progress: 33
  };
}