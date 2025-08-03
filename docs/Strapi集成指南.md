# Strapi CMS 集成指南

## 为什么选择 Strapi？

- ✅ 100%开源免费，部署在你自己的服务器
- ✅ 可视化界面，像WordPress一样简单
- ✅ 支持中文界面
- ✅ 完美支持富文本、图片、视频
- ✅ 自动生成API，可以直接在Next.js中调用

## 一、安装 Strapi（10分钟）

### 1. 在项目根目录创建CMS文件夹
```bash
# 在你的项目根目录执行
mkdir cms
cd cms
```

### 2. 安装Strapi
```bash
npx create-strapi-app@latest . --quickstart
```

安装过程中会询问：
- 选择安装类型：选 `Quickstart (recommended)`
- 会自动启动，默认地址：http://localhost:1337

### 3. 创建管理员账号
首次访问会要求创建管理员：
- 用户名：admin
- 密码：设置一个安全密码
- 邮箱：你的邮箱

## 二、配置课程内容模型（5分钟）

### 1. 进入Content-Type Builder
点击左侧菜单的 "Content-Type Builder"

### 2. 创建 Course（课程）类型
点击 "Create new collection type"：
- Display name: `Course`
- 字段：
  - `title` (Text) - 课程标题
  - `description` (Text) - 课程描述
  - `slug` (UID) - URL标识
  - `cover` (Media) - 封面图片
  - `isPublished` (Boolean) - 是否发布

### 3. 创建 Section（章节）类型
- Display name: `Section`
- 字段：
  - `title` (Text) - 章节标题
  - `slug` (UID) - URL标识
  - `description` (Text) - 章节描述
  - `order` (Number) - 排序
  - `course` (Relation) - 关联到Course（多对一）

### 4. 创建 Lesson（课时）类型
- Display name: `Lesson`
- 字段：
  - `title` (Text) - 课时标题
  - `content` (Rich text) - 课时内容（支持图文混排）
  - `videoUrl` (Text) - 视频地址
  - `duration` (Number) - 时长（分钟）
  - `isFree` (Boolean) - 是否免费
  - `order` (Number) - 排序
  - `section` (Relation) - 关联到Section（多对一）

### 5. 设置权限
1. 进入 Settings → Roles → Public
2. 勾选以下权限：
   - Course: find, findOne
   - Section: find, findOne
   - Lesson: find, findOne（仅免费课时）

## 三、在Next.js中集成（15分钟）

### 1. 安装Strapi SDK
```bash
npm install @strapi/sdk-client
```

### 2. 创建Strapi客户端
创建 `lib/strapi.ts`：
```typescript
export const strapi = {
  async find(contentType: string, params?: any) {
    const url = new URL(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/${contentType}`);
    if (params) {
      Object.keys(params).forEach(key => 
        url.searchParams.append(key, params[key])
      );
    }
    const res = await fetch(url.toString());
    return res.json();
  },
  
  async findOne(contentType: string, id: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/${contentType}/${id}?populate=*`
    );
    return res.json();
  }
};
```

### 3. 环境变量配置
在 `.env.local` 添加：
```
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

### 4. 创建课程列表页面
修改 `app/courses/page.tsx`：
```typescript
import { strapi } from '@/lib/strapi';

export default async function CoursesPage() {
  const { data: courses } = await strapi.find('courses', {
    populate: 'sections.lessons,cover'
  });

  return (
    <div className="grid grid-cols-3 gap-6">
      {courses.map((course: any) => (
        <div key={course.id} className="bg-white rounded-lg shadow">
          <img 
            src={`http://localhost:1337${course.attributes.cover.data.attributes.url}`}
            alt={course.attributes.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="p-6">
            <h3 className="text-xl font-bold">{course.attributes.title}</h3>
            <p className="text-gray-600">{course.attributes.description}</p>
            <a 
              href={`/courses/${course.attributes.slug}`}
              className="text-blue-600 hover:text-blue-700"
            >
              开始学习 →
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 四、在Strapi中添加内容

### 1. 进入Content Manager
点击左侧的 "Content Manager"

### 2. 添加课程
1. 点击 Course → Create new entry
2. 填写：
   - Title: AI编程实战
   - Description: 从零开始学习AI编程
   - Slug: ai-programming
   - 上传封面图片
   - isPublished: true
3. 点击 Save → Publish

### 3. 添加章节
1. 点击 Section → Create new entry
2. 填写内容并关联到课程
3. 保存并发布

### 4. 添加课时
1. 点击 Lesson → Create new entry
2. 在Rich text编辑器中：
   - 直接粘贴飞书文档内容
   - 支持拖拽上传图片
   - 支持嵌入视频
3. 保存并发布

## 五、部署到服务器

### 1. 部署Strapi
```bash
# 在服务器上
cd /var/www/
git clone 你的项目
cd 你的项目/cms
npm install
npm run build
pm2 start npm --name strapi -- start
```

### 2. 配置Nginx
```nginx
server {
    listen 80;
    server_name cms.你的域名.com;
    
    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 更新环境变量
在生产环境 `.env.production`：
```
NEXT_PUBLIC_STRAPI_URL=http://cms.你的域名.com
```

## 六、高级功能

### 1. 视频上传
Strapi支持直接上传视频，或集成腾讯云COS：
- 安装插件：`npm install strapi-provider-upload-tencent-cloud`
- 在Settings → Media Library配置

### 2. 用户权限
- 可以设置不同角色（免费用户、付费用户）
- 控制课时访问权限

### 3. Webhook
- 内容更新时自动触发Next.js重新构建
- 实现实时更新

## 快速体验

如果你想先体验一下，可以：
1. 使用Strapi官方演示：https://demo.strapi.io
2. 账号：john@strapi.io
3. 密码：John1234

---

整个集成过程大约30分钟就能完成。Strapi会让你的内容管理变得非常简单，就像使用WordPress一样！