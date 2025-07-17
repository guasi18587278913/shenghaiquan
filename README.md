# 深海圈 - 海外AI产品开发学习社区

深海圈是一个专注于海外AI产品开发的在线教育社区，教授使用AI编程工具开发SaaS产品并实现商业变现。

## 🚀 功能特性

### 已完成功能

- **用户认证系统**
  - 手机号注册/登录
  - 会话管理
  - 角色权限（用户、教师、管理员）

- **动态模块**
  - 发布动态（支持多种类型）
  - 动态列表展示
  - 点赞互动
  - 评论系统（支持嵌套回复）

- **课程模块**
  - 课程列表（分类筛选）
  - 课程详情页
  - 章节管理
  - 学习进度跟踪
  - 报名系统

- **内容保护**
  - 禁用复制/选择
  - 禁用右键菜单
  - 水印保护
  - 禁用打印

### 技术栈

- **前端框架**: Next.js 15 (App Router + Turbopack)
- **UI组件**: Tailwind CSS v4 + 自定义组件库
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **ORM**: Prisma
- **认证**: NextAuth.js
- **编程语言**: TypeScript

## 🛠️ 本地开发

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd deep-sea-circle
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件配置数据库等信息
```

4. 初始化数据库
```bash
npx prisma migrate dev
npx prisma db seed
```

5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000 查看网站

### 测试账号

- **管理员**: 13800000000 / admin123
- **教师**: 13900000000 / teacher123  
- **普通用户**: 13700000001 / user123

## 📁 项目结构

```
deep-sea-circle/
├── app/                    # Next.js App Router 页面
│   ├── (auth)/            # 认证相关页面
│   ├── api/               # API 路由
│   ├── courses/           # 课程模块
│   ├── feed/              # 动态模块
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # 基础UI组件
│   └── ...               # 业务组件
├── lib/                   # 工具库
├── prisma/               # 数据库模型
└── public/               # 静态资源
```

## 🚀 部署

### 生产环境配置

1. 修改数据库为 PostgreSQL
2. 配置生产环境变量
3. 构建项目: `npm run build`
4. 启动服务: `npm start`

### 推荐部署平台

- Vercel (前端)
- Railway/Supabase (数据库)
- 阿里云/腾讯云 (国内用户)

## 📝 开发计划

- [ ] 支付系统集成
- [ ] 视频课程播放器
- [ ] 实时消息系统
- [ ] 数据分析后台
- [ ] 移动端适配优化
- [ ] 国际化支持

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License