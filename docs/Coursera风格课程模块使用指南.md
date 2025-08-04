# Coursera风格课程模块使用指南

## 概述

我们已经将课程系统改造成Coursera风格，支持一节课程包含多个不同类型的学习模块（视频、阅读、作业、讨论等）。

## 系统架构变化

### 旧结构
```
Lesson (课程)
├── title
├── content (单一内容)
├── videoUrl
└── section
```

### 新结构
```
Lesson (课程)
├── title
├── modules[] (多个学习模块)
│   ├── type (video/reading/assignment/quiz/discussion/resource)
│   ├── content
│   ├── order
│   └── 其他属性...
└── section
```

## 在Strapi中创建课程模块

### 1. 访问Strapi管理面板
- 访问: http://localhost:1337/admin
- 登录管理员账号

### 2. 为现有课程添加模块

1. 进入 Content Manager → Lesson
2. 选择您已创建的课程（如"玩起来！通过AI，10分钟发布你的第一款网站产品！"）
3. 在课程详情页面，找到 "modules" 关联字段
4. 点击 "Add a relation" 添加模块

### 3. 创建不同类型的模块

#### 视频模块 (video)
```json
{
  "title": "课程介绍视频",
  "type": "video",
  "order": 0,
  "videoUrl": "https://1371032577.vod-qcloud.com/td8703cevod/...",
  "duration": "15分钟",
  "content": "<p>本视频将介绍...</p>"
}
```

#### 阅读材料模块 (reading)
```json
{
  "title": "准备工作和环境配置",
  "type": "reading",
  "order": 1,
  "duration": "10分钟阅读",
  "content": "<h2>开始之前</h2><p>在开始学习之前，请确保...</p>"
}
```

#### 编程作业模块 (assignment)
```json
{
  "title": "创建你的第一个AI应用",
  "type": "assignment",
  "order": 2,
  "assignmentDeadline": "2025-08-10T23:59:59",
  "assignmentPoints": 100,
  "content": "<h2>作业要求</h2><p>使用课程中学到的知识...</p>"
}
```

#### 讨论模块 (discussion)
```json
{
  "title": "分享你的作品",
  "type": "discussion",
  "order": 3,
  "content": "<p>完成作业后，欢迎在这里分享你的作品链接...</p>"
}
```

## 模块类型说明

- **video**: 视频教学内容
- **reading**: 文字阅读材料
- **assignment**: 编程作业或实践任务
- **quiz**: 测验（暂未实现）
- **discussion**: 讨论区
- **resource**: 下载资源（如代码模板、PPT等）

## 前端展示

访问课程页面时，系统会自动检测：
1. 如果课程有modules，使用新的Coursera风格界面
2. 如果没有modules，使用旧的展示方式（向后兼容）

## 学习进度跟踪

- 学生可以标记每个模块为"已完成"
- 系统自动计算课程完成百分比
- 进度保存在浏览器本地存储中

## 数据迁移

运行迁移脚本将现有课程数据转换为模块结构：

```bash
cd /Users/liyadong/Documents/GitHub/深海圈网站
node scripts/migrate-lessons-to-modules.js
```

注意：需要设置 `STRAPI_API_TOKEN` 环境变量。

## 常见问题

### Q: 为什么我的课程还是显示旧界面？
A: 检查该课程是否已添加modules。只有包含modules的课程才会使用新界面。

### Q: 如何调整模块顺序？
A: 修改每个模块的 `order` 字段，数字越小越靠前。

### Q: 能否只有视频没有其他模块？
A: 可以，但建议至少添加一个讨论模块增强互动性。

## 下一步计划

1. 实现作业提交和评分系统
2. 添加测验功能
3. 集成讨论区功能
4. 支持资源文件上传和下载