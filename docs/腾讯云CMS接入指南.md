# 腾讯云CMS接入指南

## 一、腾讯云CMS介绍

腾讯云提供了两种CMS相关服务：

### 1. **腾讯云开发 CloudBase CMS**（推荐）
- 基于云开发的内容管理系统
- 可视化管理界面
- 自动生成API
- 完美支持Next.js

### 2. **腾讯云TCB CMS**
- 更轻量的解决方案
- 适合简单内容管理

## 二、开通CloudBase CMS（5分钟）

### 1. 登录腾讯云控制台
访问：https://console.cloud.tencent.com/tcb

### 2. 创建云开发环境
- 点击"新建环境"
- 环境名称：`deepsea-cms`
- 选择"按量计费"（有免费额度）
- 地域：选择和你服务器相同的地域

### 3. 安装CMS扩展
- 进入环境 → 扩展应用
- 搜索"CMS内容管理系统"
- 点击安装
- 等待部署完成（约3分钟）

## 三、配置课程内容模型

### 1. 访问CMS管理界面
安装完成后，会得到管理地址：
```
https://你的环境ID.service.tcloudbase.com/cms
```

### 2. 创建内容模型

#### Course（课程）模型
```json
{
  "displayName": "课程",
  "collectionName": "courses",
  "fields": [
    {
      "displayName": "课程标题",
      "name": "title",
      "type": "String",
      "required": true
    },
    {
      "displayName": "课程描述",
      "name": "description",
      "type": "Text"
    },
    {
      "displayName": "课程封面",
      "name": "cover",
      "type": "Image"
    },
    {
      "displayName": "URL标识",
      "name": "slug",
      "type": "String",
      "unique": true
    },
    {
      "displayName": "是否发布",
      "name": "isPublished",
      "type": "Boolean",
      "defaultValue": false
    }
  ]
}
```

#### Section（章节）模型
```json
{
  "displayName": "章节",
  "collectionName": "sections",
  "fields": [
    {
      "displayName": "章节标题",
      "name": "title",
      "type": "String",
      "required": true
    },
    {
      "displayName": "所属课程",
      "name": "courseId",
      "type": "Connect",
      "connectResource": "courses"
    },
    {
      "displayName": "排序",
      "name": "order",
      "type": "Number",
      "defaultValue": 0
    },
    {
      "displayName": "URL标识",
      "name": "slug",
      "type": "String"
    }
  ]
}
```

#### Lesson（课时）模型
```json
{
  "displayName": "课时",
  "collectionName": "lessons",
  "fields": [
    {
      "displayName": "课时标题",
      "name": "title",
      "type": "String",
      "required": true
    },
    {
      "displayName": "课时内容",
      "name": "content",
      "type": "RichText",
      "supportImageUpload": true
    },
    {
      "displayName": "视频地址",
      "name": "videoUrl",
      "type": "String",
      "description": "腾讯云VOD的视频ID"
    },
    {
      "displayName": "所属章节",
      "name": "sectionId",
      "type": "Connect",
      "connectResource": "sections"
    },
    {
      "displayName": "是否免费",
      "name": "isFree",
      "type": "Boolean",
      "defaultValue": false
    },
    {
      "displayName": "排序",
      "name": "order",
      "type": "Number"
    }
  ]
}
```

## 四、在Next.js中集成

### 1. 安装CloudBase SDK
```bash
npm install @cloudbase/js-sdk
```

### 2. 初始化CloudBase
创建 `lib/cloudbase.ts`：
```typescript
import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: process.env.NEXT_PUBLIC_TCB_ENV_ID!, // 你的环境ID
});

// 匿名登录
const auth = app.auth();
await auth.anonymousAuthProvider().signIn();

// 数据库实例
export const db = app.database();
```

### 3. 环境变量配置
在 `.env.local` 添加：
```
NEXT_PUBLIC_TCB_ENV_ID=你的环境ID
```

### 4. 获取课程数据
```typescript
// app/api/courses/route.ts
import { db } from '@/lib/cloudbase';

export async function GET() {
  try {
    // 获取所有已发布的课程
    const { data } = await db
      .collection('courses')
      .where({
        isPublished: true
      })
      .get();

    return NextResponse.json({ courses: data });
  } catch (error) {
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}
```

### 5. 获取课程详情
```typescript
// app/api/courses/[slug]/route.ts
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // 获取课程
  const { data: courses } = await db
    .collection('courses')
    .where({ slug })
    .get();
    
  if (!courses.length) {
    return NextResponse.json({ error: '课程不存在' }, { status: 404 });
  }
  
  const course = courses[0];
  
  // 获取章节
  const { data: sections } = await db
    .collection('sections')
    .where({ courseId: course._id })
    .orderBy('order', 'asc')
    .get();
    
  // 获取每个章节的课时
  for (const section of sections) {
    const { data: lessons } = await db
      .collection('lessons')
      .where({ sectionId: section._id })
      .orderBy('order', 'asc')
      .get();
    section.lessons = lessons;
  }
  
  return NextResponse.json({
    course,
    sections
  });
}
```

## 五、使用CMS管理内容

### 1. 登录CMS后台
- 访问：https://你的环境ID.service.tcloudbase.com/cms
- 使用腾讯云账号登录

### 2. 添加课程
1. 点击"课程"菜单
2. 点击"新建"
3. 填写信息：
   - 标题：AI编程实战
   - 描述：10分钟搞定你的第一个产品
   - URL标识：ai-programming
   - 上传封面图片
4. 点击"保存"

### 3. 添加章节和课时
- 同样的方式添加章节
- 在课时的富文本编辑器中可以：
  - 直接粘贴飞书文档
  - 拖拽上传图片
  - 插入视频

## 六、高级功能

### 1. 结合腾讯云VOD
在课时中存储VOD的FileId，前端使用腾讯云播放器：
```javascript
// 集成腾讯云播放器
const player = TCPlayer('player-container-id', {
  fileID: lesson.videoUrl, // VOD的FileId
  appID: '你的appID'
});
```

### 2. 权限控制
CloudBase支持自定义安全规则：
```json
{
  "read": "auth.uid != null", // 登录用户可读
  "write": false // 禁止前端写入
}
```

### 3. Webhook通知
内容更新时自动触发构建：
- 在CMS设置Webhook
- 指向你的构建API

## 七、费用说明

CloudBase CMS费用组成：
- **免费额度**：
  - 存储：5GB
  - 下载流量：10GB/月
  - 函数调用：100万次/月
  - 数据库读取：50万次/月

- **超出部分**：
  - 存储：0.07元/GB/月
  - 流量：0.18元/GB
  - 非常便宜！

## 八、快速开始

1. **开通服务**（5分钟）
   - 登录腾讯云控制台
   - 创建CloudBase环境
   - 安装CMS扩展

2. **创建内容模型**（10分钟）
   - 按照上面的JSON创建模型
   - 设置字段类型

3. **集成到Next.js**（15分钟）
   - 安装SDK
   - 配置环境变量
   - 调用API

## 对比其他方案的优势

| 特性 | CloudBase CMS | Strapi | WordPress |
|-----|--------------|---------|-----------|
| 国内访问 | ✅ 完美 | ⚠️ 需配置 | ⚠️ 需优化 |
| 免费额度 | ✅ 很大方 | ✅ 完全免费 | ✅ 开源免费 |
| 中文支持 | ✅ 原生中文 | ⚠️ 部分中文 | ✅ 中文完善 |
| 集成难度 | ✅ 简单 | ⚠️ 中等 | ❌ 复杂 |
| 维护成本 | ✅ 无需维护 | ❌ 需要维护 | ❌ 需要维护 |

---

使用腾讯云CMS是个明智的选择，特别是你已经在用腾讯云服务器。整个接入过程大约30分钟就能完成！