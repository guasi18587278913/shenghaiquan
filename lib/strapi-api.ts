// Strapi API 客户端
const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

// Strapi 数据类型定义
export interface StrapiSection {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiLesson {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  order: number;
  videoUrl?: string;
  duration?: string;
  content: string;
  section?: StrapiSection;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiSubLesson {
  id: number;
  documentId: string;
  title: string;
  order: number;
  content: string;
  lesson?: StrapiLesson;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

// API 响应类型
interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// 获取所有章节
export async function getSections(): Promise<StrapiSection[]> {
  try {
    const response = await fetch(`${STRAPI_API_URL}/api/courses?sort=order`);
    if (!response.ok) {
      throw new Error('Failed to fetch sections');
    }
    const result: StrapiResponse<StrapiSection[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching sections:', error);
    return [];
  }
}

// 获取单个章节
export async function getSection(slug: string): Promise<StrapiSection | null> {
  try {
    const response = await fetch(
      `${STRAPI_API_URL}/api/courses?filters[slug][$eq]=${slug}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch section');
    }
    const result: StrapiResponse<StrapiSection[]> = await response.json();
    return result.data[0] || null;
  } catch (error) {
    console.error('Error fetching section:', error);
    return null;
  }
}

// 获取章节下的所有课程
export async function getSectionLessons(sectionId: number): Promise<StrapiLesson[]> {
  try {
    const response = await fetch(
      `${STRAPI_API_URL}/api/lessons?filters[section][id][$eq]=${sectionId}&sort=order&populate=section`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    const result: StrapiResponse<StrapiLesson[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
}

// 获取单个课程
export async function getLesson(slug: string): Promise<StrapiLesson | null> {
  try {
    const response = await fetch(
      `${STRAPI_API_URL}/api/lessons?filters[slug][$eq]=${slug}&populate=section`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch lesson');
    }
    const result: StrapiResponse<StrapiLesson[]> = await response.json();
    return result.data[0] || null;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
}

// 获取课程下的所有子课程
export async function getLessonSubLessons(lessonId: number): Promise<StrapiSubLesson[]> {
  try {
    const response = await fetch(
      `${STRAPI_API_URL}/api/sub-lessons?filters[lesson][id][$eq]=${lessonId}&sort=order&populate=lesson`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch sublessons');
    }
    const result: StrapiResponse<StrapiSubLesson[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching sublessons:', error);
    return [];
  }
}

// 获取所有课程（用于课程列表页）
export async function getAllLessons(): Promise<StrapiLesson[]> {
  try {
    const response = await fetch(
      `${STRAPI_API_URL}/api/lessons?sort=order&populate=section`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch all lessons');
    }
    const result: StrapiResponse<StrapiLesson[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching all lessons:', error);
    return [];
  }
}