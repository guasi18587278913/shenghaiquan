# Halo CMS 快速部署指南（10分钟搞定）

## 一、在腾讯云服务器部署Halo

### 1. SSH登录服务器
```bash
ssh root@111.231.19.162
```

### 2. 安装Docker（如果没有）
```bash
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

### 3. 一键部署Halo
```bash
# 创建工作目录
mkdir -p ~/halo && cd ~/halo

# 下载配置文件
wget https://dl.halo.run/config/application-template.yaml -O ./application.yaml

# 启动Halo
docker run -d \
  --name halo \
  --restart=always \
  -p 8090:8090 \
  -v ~/.halo2:/root/.halo2 \
  halohub/halo:2.10
```

### 4. 配置Nginx反向代理
```nginx
server {
    listen 80;
    server_name cms.deepseacircle.com;  # 你的域名
    
    location / {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header HOST $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 二、初始化设置（5分钟）

### 1. 访问安装页面
打开：http://你的IP:8090

### 2. 设置管理员账号
- 用户名：admin
- 密码：设置一个强密码
- 邮箱：你的邮箱

### 3. 安装课程插件

进入后台 → 插件 → 应用市场，搜索安装：
- **文章管理增强**
- **分类管理**
- **Markdown编辑器**

## 三、在Next.js中集成

### 1. 安装依赖
```bash
npm install axios
```

### 2. 创建Halo API客户端
```typescript
// lib/halo.ts
import axios from 'axios';

const haloAPI = axios.create({
  baseURL: 'http://你的IP:8090/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

export const haloService = {
  // 获取文章列表
  async getPosts(categoryId?: string) {
    const params = categoryId ? { categoryId } : {};
    const { data } = await haloAPI.get('/content.halo.run/v1alpha1/posts', { params });
    return data;
  },

  // 获取文章详情
  async getPost(name: string) {
    const { data } = await haloAPI.get(`/content.halo.run/v1alpha1/posts/${name}`);
    return data;
  },

  // 获取分类
  async getCategories() {
    const { data } = await haloAPI.get('/content.halo.run/v1alpha1/categories');
    return data;
  }
};
```

### 3. 创建课程展示页面
```typescript
// app/courses/halo/page.tsx
import { haloService } from '@/lib/halo';

export default async function HaloCoursesPage() {
  const posts = await haloService.getPosts();
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {posts.items.map((post: any) => (
        <div key={post.metadata.name} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-2">{post.spec.title}</h3>
          <p className="text-gray-600">{post.spec.excerpt}</p>
          <a href={`/courses/halo/${post.metadata.name}`} className="text-blue-600">
            查看详情 →
          </a>
        </div>
      ))}
    </div>
  );
}
```

## 四、内容管理工作流

### 1. 创建课程分类
在Halo后台创建分类：
- 基础篇
- 进阶篇
- 实战篇

### 2. 发布课程内容
1. 点击"新建文章"
2. 选择分类
3. 粘贴飞书文档内容
4. 上传图片（自动处理）
5. 发布

### 3. 设置访问权限
- 免费课程：设为公开
- 付费课程：设为需要登录

## 五、Halo的优势

### 对比CloudBase
| 功能 | CloudBase | Halo |
|-----|-----------|------|
| 搭建时间 | 2-3天 | 10分钟 |
| 内容编辑 | 需要开发 | 现成的编辑器 |
| 图片上传 | 需要开发 | 自动处理 |
| 插件生态 | 无 | 丰富 |
| 维护成本 | 高 | 低 |

### 成本
- 服务器资源：几乎不占用（~200MB内存）
- 人力成本：极低
- 学习成本：1小时上手

## 六、进阶功能

### 1. 主题定制
```bash
# 下载主题
cd ~/.halo2/themes
git clone https://github.com/halo-dev/theme-earth.git
```

### 2. 备份恢复
```bash
# 备份
docker exec halo cat /root/.halo2/db/halo.mv.db > backup.db

# 恢复
docker cp backup.db halo:/root/.halo2/db/halo.mv.db
```

### 3. 性能优化
- 启用Redis缓存
- 配置CDN
- 开启Gzip压缩

---

**总结**：使用Halo可以让你在10分钟内拥有一个专业的内容管理系统，而且完全适合中国用户使用！