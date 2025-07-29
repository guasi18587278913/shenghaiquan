// WordPress API 客户端
// 使用兼容的API路径
const WP_API_URL = 'http://111.231.19.162/index.php?rest_route=/wp/v2';

export interface WPPost {
  id: number;
  date: string;
  date_gmt: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  caption: {
    rendered: string;
  };
}

// 获取文章列表
export async function getPosts(params?: {
  page?: number;
  per_page?: number;
  categories?: number[];
  search?: string;
  orderby?: string;
  order?: 'asc' | 'desc';
}): Promise<WPPost[]> {
  const queryParams = new URLSearchParams();
  
  // 添加嵌入参数以获取特色图片和分类信息
  queryParams.append('_embed', '1');
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.categories) queryParams.append('categories', params.categories.join(','));
  if (params?.search) queryParams.append('search', params.search);
  if (params?.orderby) queryParams.append('orderby', params.orderby);
  if (params?.order) queryParams.append('order', params.order);

  const response = await fetch(`${WP_API_URL}/posts?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}

// 获取单篇文章
export async function getPost(idOrSlug: string | number): Promise<WPPost> {
  const isId = typeof idOrSlug === 'number' || /^\d+$/.test(idOrSlug);
  const endpoint = isId ? `posts/${idOrSlug}` : `posts?slug=${idOrSlug}`;
  
  const response = await fetch(`${WP_API_URL}/${endpoint}?_embed=1`);
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }

  const data = await response.json();
  return isId ? data : data[0];
}

// 获取分类列表
export async function getCategories(params?: {
  page?: number;
  per_page?: number;
  parent?: number;
}): Promise<WPCategory[]> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
  if (params?.parent !== undefined) queryParams.append('parent', params.parent.toString());

  const response = await fetch(`${WP_API_URL}/categories?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

// 获取媒体文件
export async function getMedia(id: number): Promise<WPMedia> {
  const response = await fetch(`${WP_API_URL}/media/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch media');
  }

  return response.json();
}

// 搜索文章
export async function searchPosts(query: string): Promise<WPPost[]> {
  return getPosts({ search: query, per_page: 20 });
}

// 获取特定分类的文章
export async function getPostsByCategory(categoryId: number, page = 1): Promise<WPPost[]> {
  return getPosts({ 
    categories: [categoryId], 
    page, 
    per_page: 12,
    orderby: 'date',
    order: 'desc'
  });
}

// 获取最新文章
export async function getRecentPosts(limit = 5): Promise<WPPost[]> {
  return getPosts({ 
    per_page: limit,
    orderby: 'date',
    order: 'desc'
  });
}