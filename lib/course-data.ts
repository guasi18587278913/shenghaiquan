// 课程数据配置
// 这里定义静态的课程结构，包括 WordPress 文章链接

export interface Lesson {
  id: string;
  title: string;
  slug: string;  // 用于URL的slug
  type: 'video' | 'article' | 'wordpress' | 'quiz';
  content?: string;
  videoUrl?: string;
  videoFileId?: string;  // 腾讯云VOD文件ID
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
        title: '这套课程有什么不同？',
        slug: 'intro',
        type: 'article',
        content: '第 1 个不同：通过 AI 做软件产品生意，我是一个尝过结果的人。\n\n过去两年市场上出现过很多种 AI 课程，江湖传言说"做 AI 产品的没赚钱，做 AI 课程的赚钱了"。在一定程度上是真的，因为大部分人还没有能力使用 AI 做出产品并靠产品赚到钱。\n\n我和他们不同，我的产品长期出现在各类"AIGC 出海产品排行榜"Top 100 里，偶尔还有 Top 50 和 Top 30。 我想，仅凭这一点，我就已经击败了 99.9%的同行了吧。\n\n也许你想了解我拿到的结果是什么规模？ 我先展示一个最近的案例吧。\n\n在 2025 年 1 月 17 日上线。我上线了一款新产品 —— Raphael 这是一款典型的 MicroSaaS https://raphael.app',
        duration: '10分钟',
        order: 1,
        isFree: true,
        isNew: true,
        updatedAt: '2025-01-29'
      },
      {
        id: 'preface-2',
        title: '你要学什么？',
        slug: 'what-to-learn',
        type: 'article',
        content: '在这个课程中，你将学习如何：\n1. 使用 AI 工具快速开发产品\n2. 找到真实的用户需求\n3. 快速验证产品想法\n4. 将产品推向市场并获得收入',
        duration: '5分钟',
        order: 2,
        isFree: true
      },
      {
        id: 'preface-3',
        title: '学习方法',
        slug: 'learning-method',
        type: 'article',
        content: '本课程采用实战驱动的学习方法：\n1. 边学边做，每个章节都有实战项目\n2. 从简单到复杂，循序渐进\n3. 注重实际应用，而非理论知识\n4. 提供完整的项目案例和源代码',
        duration: '5分钟',
        order: 3,
        isFree: true
      },
      {
        id: 'preface-4',
        title: '课前准备',
        slug: 'preparation',
        type: 'article',
        content: '开始学习前，你需要准备：\n1. 一台能上网的电脑（Windows/Mac/Linux都可以）\n2. 注册必要的账号（GitHub、OpenAI等）\n3. 保持好奇心和学习热情\n4. 每天至少30分钟的学习时间',
        duration: '5分钟',
        order: 4,
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
      // 章节一：玩起来！
      {
        id: 'basic-1-1',
        title: '一、玩起来！ - 认识 Cursor',
        slug: 'play-with-cursor',
        type: 'video',
        content: `# 认识 Cursor - AI 编程助手

Cursor 是一个革命性的 AI 编程工具，它将彻底改变你的编程方式。

## 什么是 Cursor？

Cursor 是一个基于 AI 的代码编辑器，它可以：
- 理解你的意图，自动生成代码
- 智能补全和重构代码
- 解释复杂的代码逻辑
- 帮助调试和优化性能

## 为什么选择 Cursor？

1. **零基础友好**：即使你不会编程，也能快速上手
2. **提升效率**：将开发速度提升 10 倍
3. **学习助手**：边做边学，快速掌握编程技能
4. **实时反馈**：AI 会指出代码问题并提供改进建议

## 安装和配置

### 下载安装
1. 访问 https://cursor.sh
2. 下载对应系统的安装包
3. 安装并启动 Cursor

### 初始配置
1. 登录账号（支持 GitHub 登录）
2. 选择 AI 模型（推荐 GPT-4）
3. 配置快捷键（可选）

准备好了吗？让我们开始神奇的 AI 编程之旅！`,
        videoUrl: 'https://example.com/cursor-intro.mp4',
        duration: '15分钟',
        order: 1,
        isFree: true
      },
      {
        id: 'basic-1-2',
        title: '让 AI 帮你写第一个程序',
        slug: 'first-ai-program',
        type: 'video',
        content: `# 让 AI 帮你写第一个程序

今天我们要创建一个简单但实用的程序：待办事项管理器。

## 创建项目

1. 打开 Cursor
2. 创建新文件夹 "todo-app"
3. 新建文件 index.html

## 与 AI 对话

在 Cursor 中按 Cmd+K（Mac）或 Ctrl+K（Windows），输入：

\`\`\`
创建一个美观的待办事项应用，要求：
1. 可以添加新任务
2. 可以标记完成
3. 可以删除任务
4. 使用现代化的设计
5. 数据保存在本地
\`\`\`

## AI 生成的代码

Cursor 会为你生成完整的 HTML、CSS 和 JavaScript 代码。

## 运行和测试

1. 在浏览器中打开 index.html
2. 测试各项功能
3. 根据需要让 AI 调整

恭喜！你已经用 AI 创建了第一个应用！`,
        videoUrl: 'https://example.com/first-program.mp4',
        duration: '20分钟',
        order: 2,
        isFree: true
      },
      {
        id: 'basic-1-3',
        title: '10分钟做个 Chrome 插件',
        slug: 'chrome-extension',
        type: 'video',
        content: `# 10分钟做个 Chrome 插件

Chrome 插件是入门 AI 产品开发的绝佳选择。

## 为什么从插件开始？

1. **门槛低**：不需要服务器，纯前端即可
2. **分发容易**：Chrome 商店覆盖全球用户
3. **变现简单**：可以直接收费或订阅
4. **需求明确**：解决具体的浏览器使用痛点

## 实战：网页护眼插件

让我们创建一个保护视力的插件。

### 功能设计
- 一键开启护眼模式
- 自定义护眼颜色
- 定时提醒休息
- 记住用户设置

### 让 AI 生成代码

\`\`\`
创建一个 Chrome 插件，功能如下：
1. 点击图标开启护眼模式（降低亮度，增加暖色调）
2. 可以调节护眼程度
3. 支持定时提醒休息
4. manifest.json 使用 v3 版本
\`\`\`

### 测试插件

1. 打开 Chrome 扩展管理
2. 开启开发者模式
3. 加载已解压的扩展
4. 测试各项功能

恭喜！你的第一个 Chrome 插件完成了！`,
        videoUrl: 'https://example.com/chrome-extension.mp4',
        duration: '25分钟',
        order: 3,
        isFree: false
      },
      {
        id: 'basic-1-4',
        title: '把网站发布到互联网',
        slug: 'deploy-website',
        type: 'video',
        content: `# 把网站发布到互联网

创建了应用后，下一步是让全世界都能访问它。

## 选择部署平台

### Vercel（推荐）
- 免费额度充足
- 部署简单快速
- 自动 HTTPS
- 全球 CDN 加速

### 其他选择
- Netlify
- GitHub Pages
- Cloudflare Pages

## 部署步骤

### 1. 注册 Vercel
访问 vercel.com，使用 GitHub 账号登录

### 2. 连接 GitHub
1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 一键部署

### 3. 自定义域名
1. 购买域名（Namecheap、Cloudflare）
2. 在 Vercel 中添加域名
3. 配置 DNS 解析

## 部署优化

- 启用缓存
- 压缩资源
- 图片优化
- 错误监控

恭喜！你的应用已经上线了！`,
        videoUrl: 'https://example.com/deploy-website.mp4',
        duration: '18分钟',
        order: 4,
        isFree: false
      },
      // 章节二：10分钟速成 Next.js
      {
        id: 'basic-2-1',
        title: '二、10分钟速成 Next.js - 认识 Next.js',
        slug: 'nextjs-intro',
        type: 'article',
        content: `# 认识 Next.js

Next.js 是构建现代 Web 应用的最佳框架之一。

## 为什么选择 Next.js？

1. **全栈框架**：前后端一体化开发
2. **性能优越**：自动优化，加载速度快
3. **SEO 友好**：服务端渲染，利于搜索引擎
4. **部署简单**：Vercel 一键部署
5. **生态丰富**：大量现成的组件和模板

## Next.js 能做什么？

- SaaS 应用
- 电商网站
- 博客系统
- 企业官网
- Web 应用

## 核心概念

### 1. 页面路由
文件即路由，简单直观

### 2. API 路由
内置后端 API 支持

### 3. 静态生成
构建时生成 HTML，性能最佳

### 4. 服务端渲染
请求时生成 HTML，数据实时

准备好了吗？让我们开始 Next.js 之旅！`,
        duration: '10分钟',
        order: 5,
        isFree: false
      },
      {
        id: 'basic-2-2',
        title: 'Cursor + Next.js 快速开发',
        slug: 'cursor-nextjs',
        type: 'video',
        content: `# Cursor + Next.js 快速开发

将 Cursor 的 AI 能力与 Next.js 结合，开发效率翻倍。

## 创建 Next.js 项目

在 Cursor 终端中运行：
\`\`\`bash
npx create-next-app@latest my-app
cd my-app
npm run dev
\`\`\`

## AI 驱动开发流程

### 1. 描述需求
告诉 Cursor 你想要什么功能

### 2. 生成代码
AI 会生成完整的组件和页面

### 3. 实时预览
边改边看，快速迭代

### 4. 优化调整
让 AI 帮你优化性能和体验

## 实战案例

创建一个产品展示页面：
1. 响应式设计
2. 动画效果
3. 数据获取
4. SEO 优化

让 AI 来帮你实现这一切！`,
        videoUrl: 'https://example.com/cursor-nextjs.mp4',
        duration: '22分钟',
        order: 6,
        isFree: false
      },
      {
        id: 'basic-2-3',
        title: '部署你的 Next.js 应用',
        slug: 'deploy-nextjs',
        type: 'video',
        content: `# 部署 Next.js 应用

将你的 Next.js 应用部署到生产环境。

## Vercel 部署（推荐）

### 优势
- Next.js 官方平台
- 零配置部署
- 自动 CI/CD
- 免费 SSL
- 全球 CDN

### 部署步骤
1. 推送代码到 GitHub
2. 连接 Vercel
3. 一键部署
4. 自定义域名

## 其他部署选项

### Netlify
- 静态站点优选
- 构建快速
- 插件丰富

### Railway
- 支持数据库
- 容器化部署
- 按需付费

### 自建服务器
- 完全控制
- 成本可控
- 需要运维

## 部署检查清单

- [ ] 环境变量配置
- [ ] 数据库连接
- [ ] 错误处理
- [ ] 性能优化
- [ ] 安全设置

你的应用现在已经上线了！`,
        videoUrl: 'https://example.com/deploy-nextjs.mp4',
        duration: '15分钟',
        order: 7,
        isFree: false
      }
    ]
  },
  cognition: {
    id: 'cognition',
    slug: 'cognition',
    title: '认知篇',
    description: '建立正确的AI产品思维',
    lessons: [
      {
        id: 'cognition-1',
        title: '什么样的产品能赚钱？',
        slug: 'profitable-products',
        type: 'article',
        content: `# 什么样的产品能赚钱？

不是所有产品都能赚钱，选对方向比努力更重要。

## 赚钱产品的特征

### 1. 解决真实痛点
- 用户愿意付费解决的问题
- 现有解决方案不够好
- 痛点足够强烈和普遍

### 2. 目标用户明确
- 知道谁是你的用户
- 用户有付费能力
- 能够触达这些用户

### 3. 商业模式清晰
- 订阅制（SaaS）
- 一次性购买
- 使用量计费
- 增值服务

## 成功案例分析

### RemoveBG - 抠图工具
- 痛点：设计师需要快速抠图
- 解决：AI 一键抠图
- 收费：按次数收费
- 月收入：$50万+

### Jasper AI - AI 写作
- 痛点：内容创作效率低
- 解决：AI 辅助写作
- 收费：订阅制
- 估值：$15亿

## 如何验证产品想法

1. **搜索验证**：Google 搜索量
2. **竞品分析**：是否有人在做
3. **用户访谈**：直接问潜在用户
4. **MVP 测试**：快速验证

记住：先验证，再开发！`,
        duration: '20分钟',
        order: 1,
        isFree: false
      },
      {
        id: 'cognition-2',
        title: '如何找到好的产品 idea',
        slug: 'find-product-ideas',
        type: 'video',
        content: `# 如何找到好的产品 idea

好的 idea 不是凭空想出来的，而是有方法可循。

## Idea 来源

### 1. 自身痛点
- 你遇到的问题
- 工作中的不便
- 生活中的需求

### 2. 社区观察
- Reddit 讨论
- Twitter 抱怨
- Facebook 群组
- 论坛求助帖

### 3. 趋势跟踪
- Product Hunt
- Hacker News
- Google Trends
- TikTok 热门

### 4. 技术驱动
- 新 API 发布
- AI 模型更新
- 新平台机会

## 实战方法

### Reddit 挖掘法
1. 搜索 "I wish" "I need"
2. 查看高赞评论
3. 分析痛点频率
4. 评估解决难度

### 竞品改进法
1. 找到现有产品
2. 查看差评
3. 分析不满原因
4. 做得更好

### 跨界组合法
1. A 领域的解决方案
2. 应用到 B 领域
3. 适配和优化

## 筛选标准

- 技术可行性
- 市场需求量
- 竞争程度
- 变现可能

开始收集你的 idea 吧！`,
        videoUrl: 'https://example.com/find-ideas.mp4',
        duration: '25分钟',
        order: 2,
        isFree: false
      },
      {
        id: 'cognition-3',
        title: '快速验证 MVP',
        slug: 'validate-mvp',
        type: 'video',
        content: `# 快速验证 MVP

不要花几个月做没人要的产品。

## 什么是 MVP？

Minimum Viable Product - 最小可行产品
- 核心功能
- 快速上线
- 验证需求
- 迭代改进

## MVP 验证流程

### 1. Landing Page 测试
- 制作落地页
- 说明产品价值
- 收集邮箱
- 分析转化率

### 2. Figma 原型测试
- 设计界面
- 制作可点击原型
- 用户测试
- 收集反馈

### 3. 无代码 MVP
- Bubble / Webflow
- Zapier 自动化
- Airtable 数据库
- Stripe 支付

### 4. 手动服务
- 人工提供服务
- 验证付费意愿
- 了解真实需求
- 再开发自动化

## 衡量指标

- 注册转化率
- 付费转化率
- 用户留存
- 推荐意愿

## 案例：Dropbox

- 没有开发产品
- 只做了视频演示
- 收集 75000 邮箱
- 验证需求后开发

记住：卖出去再做！`,
        videoUrl: 'https://example.com/validate-mvp.mp4',
        duration: '30分钟',
        order: 3,
        isFree: false
      }
    ]
  },
  skills: {
    id: 'skills',
    slug: 'skills',
    title: '内功篇',
    description: '提升技术内功',
    lessons: [
      {
        id: 'skills-1',
        title: '必备的编程基础',
        slug: 'programming-basics',
        type: 'article',
        content: `# 必备的编程基础

虽然 AI 能帮你写代码，但基础知识让你事半功倍。

## 需要掌握的基础

### 1. HTML/CSS 基础
- 网页结构
- 样式设计
- 响应式布局
- Flexbox/Grid

### 2. JavaScript 核心
- 变量和数据类型
- 函数和作用域
- 异步编程
- DOM 操作

### 3. 版本控制
- Git 基本操作
- GitHub 使用
- 分支管理
- 协作流程

### 4. 开发工具
- VS Code/Cursor
- 浏览器开发者工具
- 终端命令
- 包管理器

## 学习建议

### 实践驱动
- 不要死记硬背
- 边做项目边学
- 遇到问题再查
- AI 辅助理解

### 循序渐进
1. 先跑通 Hello World
2. 修改现有代码
3. 添加新功能
4. 独立完成项目

## 推荐资源

- MDN Web Docs
- FreeCodeCamp
- JavaScript.info
- YouTube 教程

记住：编程是技能，需要练习！`,
        duration: '25分钟',
        order: 1,
        isFree: false
      },
      {
        id: 'skills-2',
        title: '数据库设计基础',
        slug: 'database-design',
        type: 'video',
        content: `# 数据库设计基础

每个应用都需要存储数据，掌握数据库设计很重要。

## 数据库类型

### 关系型数据库
- PostgreSQL（推荐）
- MySQL
- SQLite

### NoSQL 数据库
- MongoDB
- Firebase
- Redis

## 设计原则

### 1. 数据结构
- 表和字段
- 主键设计
- 关系建立
- 索引优化

### 2. 范式设计
- 避免冗余
- 保证一致性
- 提高效率

### 3. 实战技巧
- 用户表设计
- 订单表设计
- 关联查询
- 性能优化

## Prisma ORM

### 为什么用 Prisma
- 类型安全
- 自动补全
- 迁移管理
- 多数据库支持

### 基本使用
\`\`\`prisma
model User {
  id        String   @id
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}
\`\`\`

掌握数据库，应用才完整！`,
        videoUrl: 'https://example.com/database-design.mp4',
        duration: '30分钟',
        order: 2,
        isFree: false
      },
      {
        id: 'skills-3',
        title: 'API 设计和集成',
        slug: 'api-design',
        type: 'video',
        content: `# API 设计和集成

现代应用离不开 API，学会设计和使用 API 至关重要。

## RESTful API

### 设计原则
- 资源导向
- HTTP 方法
- 状态码
- 数据格式

### 实例
\`\`\`
GET    /api/users      # 获取用户列表
POST   /api/users      # 创建用户
GET    /api/users/:id  # 获取单个用户
PUT    /api/users/:id  # 更新用户
DELETE /api/users/:id  # 删除用户
\`\`\`

## 第三方 API 集成

### 常用 API
- OpenAI API
- Stripe 支付
- SendGrid 邮件
- Twilio 短信

### 集成要点
- API Key 管理
- 请求限制
- 错误处理
- 数据验证

## Next.js API Routes

### 创建 API
\`\`\`javascript
// app/api/hello/route.js
export async function GET(request) {
  return Response.json({ message: 'Hello API' })
}
\`\`\`

### 数据库操作
- Prisma 集成
- 事务处理
- 错误处理
- 认证授权

掌握 API，连接一切！`,
        videoUrl: 'https://example.com/api-design.mp4',
        duration: '35分钟',
        order: 3,
        isFree: false
      }
    ]
  },
  advanced: {
    id: 'advanced',
    slug: 'advanced',
    title: '进阶篇',
    description: '从MVP到规模化',
    lessons: [
      {
        id: 'advanced-1',
        title: '产品规模化策略',
        slug: 'scaling-strategies',
        type: 'article',
        content: `# 产品规模化策略

从 MVP 到成熟产品，需要系统的规划和执行。

## 技术层面

### 1. 性能优化
- 代码优化
- 数据库优化
- 缓存策略
- CDN 加速

### 2. 架构升级
- 微服务拆分
- 负载均衡
- 容器化部署
- 监控告警

### 3. 安全加固
- 数据加密
- 权限控制
- 漏洞扫描
- 备份策略

## 业务层面

### 1. 用户增长
- SEO 优化
- 内容营销
- 社交媒体
- 付费广告

### 2. 产品迭代
- 用户反馈
- A/B 测试
- 功能优先级
- 版本管理

### 3. 团队建设
- 招聘计划
- 流程规范
- 文档管理
- 知识共享

## 案例分析

### Notion 的成长
- 从笔记工具到协作平台
- 社区驱动增长
- 模板生态系统
- 企业版策略

持续改进，稳步成长！`,
        duration: '30分钟',
        order: 1,
        isFree: false
      },
      {
        id: 'advanced-2',
        title: '海外市场运营',
        slug: 'overseas-marketing',
        type: 'video',
        content: `# 海外市场运营

掌握海外市场的运营技巧，让产品走向全球。

## 市场选择

### 目标市场
- 美国（最大市场）
- 欧洲（付费意愿高）
- 日本（质量要求高）
- 东南亚（增长快）

### 本地化策略
- 语言翻译
- 文化适配
- 支付方式
- 法律合规

## 营销渠道

### 1. 内容营销
- 博客 SEO
- YouTube 视频
- 播客访谈
- 社交媒体

### 2. 社区运营
- Reddit 参与
- Discord 社群
- Facebook 群组
- Slack 社区

### 3. 产品发布
- Product Hunt
- Hacker News
- AppSumo
- 垂直社区

## 增长技巧

### 冷启动
- 种子用户
- KOL 合作
- 限时优惠
- 推荐奖励

### 病毒传播
- 分享机制
- 推荐系统
- 社交功能
- 品牌故事

走向世界，成就梦想！`,
        videoUrl: 'https://example.com/overseas-marketing.mp4',
        duration: '40分钟',
        order: 2,
        isFree: false
      },
      {
        id: 'advanced-3',
        title: '商业化和变现',
        slug: 'monetization',
        type: 'video',
        content: `# 商业化和变现

好产品需要好的商业模式才能持续发展。

## 定价策略

### 1. 定价模型
- 免费增值
- 订阅制
- 一次性付费
- 使用量计费

### 2. 价格设置
- 竞品分析
- 价值定位
- 心理定价
- A/B 测试

### 3. 优惠策略
- 早鸟价格
- 批量折扣
- 年付优惠
- 推荐返利

## 支付集成

### Stripe（推荐）
- 全球支付
- 订阅管理
- 发票系统
- 税务处理

### 其他选择
- PayPal
- Paddle
- LemonSqueezy
- Gumroad

## 收入优化

### 1. 提高转化
- 优化定价页
- 简化支付流程
- 提供试用
- 退款保证

### 2. 增加 LTV
- 升级引导
- 附加服务
- 续费提醒
- 客户成功

### 3. 降低流失
- 用户调研
- 功能改进
- 客服支持
- 社区建设

让产品创造价值！`,
        videoUrl: 'https://example.com/monetization.mp4',
        duration: '45分钟',
        order: 3,
        isFree: false
      }
    ]
  },
  qa: {
    id: 'qa',
    slug: 'qa',
    title: '问答',
    description: '常见问题解答',
    lessons: [
      {
        id: 'qa-1',
        title: '学习相关问题',
        slug: 'learning-questions',
        type: 'article',
        content: `# 学习相关问题

## Q: 我完全不会编程，能学会吗？

A: 当然可以！本课程专为零基础设计：
- AI 会帮你写代码
- 从简单项目开始
- 详细的步骤指导
- 遇到问题随时问

## Q: 需要多长时间能做出产品？

A: 根据投入时间不同：
- 每天 2 小时：1 个月出 MVP
- 每天 1 小时：2-3 个月
- 周末学习：3-4 个月

## Q: 英语不好怎么办？

A: 不用担心：
- 课程全中文
- AI 支持中文
- 翻译工具辅助
- 慢慢就熟悉了

## Q: Mac 还是 Windows？

A: 都可以：
- 课程兼容两个系统
- 推荐 Mac（开发体验好）
- Windows 也完全没问题
- 工具都支持跨平台

## Q: 要准备什么？

A: 很简单：
- 一台电脑
- 稳定网络
- 学习热情
- 每天一点时间`,
        duration: '15分钟',
        order: 1,
        isFree: true
      },
      {
        id: 'qa-2',
        title: '技术相关问题',
        slug: 'technical-questions',
        type: 'article',
        content: `# 技术相关问题

## Q: AI 能替代程序员吗？

A: 不能，但能大幅提升效率：
- AI 是工具，需要人来驾驭
- 理解需求还是要靠人
- 创意和决策无法替代
- 学会用 AI 的人更有竞争力

## Q: Cursor 要付费吗？

A: 有免费版：
- 免费版够初学使用
- Pro 版 $20/月（推荐）
- 相比收益很划算
- 可以先免费体验

## Q: 为什么选 Next.js？

A: 最适合做 SaaS：
- 全栈框架，前后端一体
- 部署简单，Vercel 免费
- 性能优秀，SEO 友好
- 生态完善，资料多

## Q: 数据库怎么选？

A: 推荐方案：
- PostgreSQL + Prisma
- Supabase（免费额度）
- PlanetScale（MySQL）
- 先用免费的练手

## Q: API 调用很贵吗？

A: 可以控制成本：
- 开始时用量很小
- 优化调用频率
- 使用缓存
- 成本可以转嫁给用户`,
        duration: '20分钟',
        order: 2,
        isFree: true
      },
      {
        id: 'qa-3',
        title: '商业相关问题',
        slug: 'business-questions',
        type: 'article',
        content: `# 商业相关问题

## Q: 真的能赚到钱吗？

A: 看执行力：
- 选对产品方向
- 坚持优化迭代
- 学员案例：月入 $500-50000
- 关键是开始行动

## Q: 竞争激烈怎么办？

A: 竞争是好事：
- 说明市场需求存在
- 可以差异化竞争
- 小而美也能赚钱
- 执行力比想法重要

## Q: 如何收款？

A: 推荐 Stripe：
- 支持全球付款
- 接入简单
- 费率合理（2.9%+$0.3）
- 提现到国内银行

## Q: 需要注册公司吗？

A: 循序渐进：
- 开始不需要
- 月收入 $1000 后考虑
- 可以注册海外公司
- 有专门服务商

## Q: 如何推广？

A: 多渠道尝试：
- Product Hunt 发布
- SEO 长期投入
- 社交媒体运营
- 内容营销
- 口碑传播`,
        duration: '25分钟',
        order: 3,
        isFree: true
      },
      {
        id: 'qa-4',
        title: '出海相关问题',
        slug: 'overseas-questions',
        type: 'article',
        content: `# 出海相关问题

## Q: 为什么要做海外市场？

A: 优势明显：
- 付费意愿高
- 市场规模大
- 竞争相对公平
- 汇率优势

## Q: 语言障碍怎么解决？

A: 工具帮助：
- DeepL 翻译
- ChatGPT 润色
- Grammarly 检查
- 慢慢提升

## Q: 文化差异怎么办？

A: 学习适应：
- 研究目标用户
- 参考竞品
- 收集反馈
- 持续优化

## Q: 时差问题？

A: 可以解决：
- 异步沟通为主
- 自动化客服
- 设置工作时间
- 招聘当地支持

## Q: 法律合规？

A: 基本要求：
- 隐私政策
- 服务条款  
- GDPR 合规
- 税务问题（后期考虑）

记住：先做起来，边做边学！`,
        duration: '20分钟',
        order: 4,
        isFree: true
      }
    ]
  }
};

// 获取章节数据
export function getSection(sectionSlug: string): Section | null {
  return courseSections[sectionSlug] || null;
}

// 通过slug获取课程
export function getCourse(sectionSlug: string, courseSlug: string): Lesson | null {
  const section = getSection(sectionSlug);
  if (!section) return null;
  
  // 直接通过slug查找课程
  const lesson = section.lessons.find(lesson => lesson.slug === courseSlug);
  if (lesson) return lesson;
  
  // 如果没找到，尝试通过基础篇的特殊命名查找
  // 例如: play-with-cursor 对应 basic-1-1 的课程
  const matchingLesson = section.lessons.find(lesson => {
    // 从lesson.title中提取可能的slug
    if (lesson.title.includes('认识 Cursor') && courseSlug === 'play-with-cursor') return true;
    if (lesson.title.includes('第一个程序') && courseSlug === 'first-ai-program') return true;
    if (lesson.title.includes('Chrome 插件') && courseSlug === 'chrome-extension') return true;
    if (lesson.title.includes('发布到互联网') && courseSlug === 'deploy-website') return true;
    if (lesson.title.includes('认识 Next.js') && courseSlug === 'nextjs-intro') return true;
    if (lesson.title.includes('Cursor + Next.js') && courseSlug === 'cursor-nextjs') return true;
    if (lesson.title.includes('部署你的 Next.js') && courseSlug === 'deploy-nextjs') return true;
    return false;
  });
  
  return matchingLesson || null;
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