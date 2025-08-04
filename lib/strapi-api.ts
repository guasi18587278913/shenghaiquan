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
  modules?: StrapiModule[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface StrapiModule {
  id: number;
  documentId: string;
  title: string;
  type: 'video' | 'reading' | 'assignment' | 'quiz' | 'discussion' | 'resource';
  order: number;
  duration?: string;
  content?: string;
  videoUrl?: string;
  assignmentDeadline?: string;
  assignmentPoints?: number;
  quizQuestions?: any;
  resourceFiles?: any;
  lesson?: StrapiLesson;
  isCompleted?: boolean;
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
      `${STRAPI_API_URL}/api/lessons?filters[section][id][$eq]=${sectionId}&sort=order&populate[section]=true&populate[modules]=true`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    const result: StrapiResponse<StrapiLesson[]> = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }
}

// 获取单个课程（包含所有模块）
export async function getLesson(slug: string): Promise<StrapiLesson | null> {
  try {
    // 使用深度populate来获取modules - Strapi v5语法
    const queryString = `filters[slug][$eq]=${slug}&populate[modules]=true&populate[section]=true`;
    
    let response = await fetch(
      `${STRAPI_API_URL}/api/lessons?${queryString}`
    );
    
    if (!response.ok) {
      console.error('Strapi API error:', response.status, response.statusText);
      throw new Error('Failed to fetch lesson');
    }
    
    let result: StrapiResponse<any> = await response.json();
    
    // 如果通过slug没找到，尝试通过title查询（临时方案）
    if (!result.data || result.data.length === 0) {
      console.log('No lesson found with slug:', slug);
      // 尝试获取所有课程看看有什么
      response = await fetch(`${STRAPI_API_URL}/api/lessons?populate=*`);
      if (response.ok) {
        result = await response.json();
        console.log('Available lessons:', result.data?.map((l: any) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          hasModules: l.modules?.length > 0
        })));
      }
    }
    
    // Strapi v5 返回的数据结构调整
    if (result.data && result.data[0]) {
      const lesson = result.data[0];
      return {
        ...lesson,
        ...lesson.attributes,
        modules: lesson.modules || []
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }
}

// 获取课程的所有模块
export async function getLessonModules(lessonId: number): Promise<StrapiModule[]> {
  try {
    const response = await fetch(
      `${STRAPI_API_URL}/api/modules?filters[lesson][id][$eq]=${lessonId}&sort=order`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch modules');
    }
    const result: StrapiResponse<StrapiModule[]> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching modules:', error);
    return [];
  }
}

// 更新模块完成状态
export async function updateModuleCompletion(moduleId: number, isCompleted: boolean): Promise<boolean> {
  try {
    const response = await fetch(
      `${STRAPI_API_URL}/api/modules/${moduleId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { isCompleted }
        })
      }
    );
    return response.ok;
  } catch (error) {
    console.error('Error updating module completion:', error);
    return false;
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