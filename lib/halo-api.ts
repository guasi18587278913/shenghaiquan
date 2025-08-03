import axios from 'axios';

// Halo API 配置
const HALO_BASE_URL = process.env.NEXT_PUBLIC_HALO_URL || 'http://111.231.19.162:8090';
const HALO_API_URL = `${HALO_BASE_URL}/apis`;

// 创建 axios 实例
const haloClient = axios.create({
  baseURL: HALO_API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export interface HaloPost {
  metadata: {
    name: string;
    creationTimestamp: string;
  };
  spec: {
    title: string;
    slug: string;
    excerpt?: string;
    cover?: string;
    categories?: string[];
    tags?: string[];
    visible: string;
    priority: number;
    excerpt?: string;
  };
  status?: {
    permalink: string;
  };
}

export interface HaloCategory {
  metadata: {
    name: string;
  };
  spec: {
    displayName: string;
    slug: string;
    description?: string;
    cover?: string;
    priority: number;
  };
}

export const haloService = {
  // 获取文章列表
  async getPosts(params?: {
    page?: number;
    size?: number;
    categoryName?: string;
    keyword?: string;
  }) {
    try {
      const { data } = await haloClient.get('/content.halo.run/v1alpha1/posts', {
        params: {
          page: params?.page || 1,
          size: params?.size || 10,
          sort: 'metadata.creationTimestamp,desc',
          ...params
        }
      });
      return data;
    } catch (error) {
      console.error('获取文章列表失败:', error);
      return { items: [], total: 0 };
    }
  },

  // 获取单篇文章
  async getPost(nameOrSlug: string) {
    try {
      // 先尝试通过 name 获取
      const { data } = await haloClient.get(`/content.halo.run/v1alpha1/posts/${nameOrSlug}`);
      return data;
    } catch (error) {
      // 如果失败，尝试通过 slug 查找
      const posts = await this.getPosts({ keyword: nameOrSlug });
      return posts.items.find((post: HaloPost) => post.spec.slug === nameOrSlug);
    }
  },

  // 获取文章内容
  async getPostContent(name: string) {
    try {
      const { data } = await haloClient.get(
        `/content.halo.run/v1alpha1/posts/${name}/head-content`
      );
      return data;
    } catch (error) {
      console.error('获取文章内容失败:', error);
      return null;
    }
  },

  // 获取分类列表
  async getCategories() {
    try {
      const { data } = await haloClient.get('/content.halo.run/v1alpha1/categories');
      return data;
    } catch (error) {
      console.error('获取分类失败:', error);
      return { items: [] };
    }
  },

  // 获取标签列表
  async getTags() {
    try {
      const { data } = await haloClient.get('/content.halo.run/v1alpha1/tags');
      return data;
    } catch (error) {
      console.error('获取标签失败:', error);
      return { items: [] };
    }
  }
};