# 手动创建基础篇课程步骤

请在 Strapi 管理面板中手动创建以下课程和模块：

## 1. 进入 Strapi 管理面板
访问: http://localhost:1337/admin

## 2. 创建基础篇剩余的9节课程

在 Content Manager → Lesson 中创建以下课程：

### 第1课（已创建）
✅ 已经创建完成

### 第2课
- Title: 怎么做「AI 产品」?
- Slug: how-to-make-ai-product
- Order: 2
- Section: 基础篇
- Description: 基础篇第2课

### 第3课
- Title: 如何使用 Cursor 打磨产品?
- Slug: how-to-use-cursor
- Order: 3
- Section: 基础篇
- Description: 基础篇第3课

### 第4课
- Title: 如何使用 GitHub 管理源代码?
- Slug: how-to-use-github
- Order: 4
- Section: 基础篇
- Description: 基础篇第4课

### 第5课
- Title: 如何正式发布你的网站产品?
- Slug: how-to-publish-website
- Order: 5
- Section: 基础篇
- Description: 基础篇第5课

### 第6课
- Title: 如何分析用户行为?
- Slug: how-to-analyze-user-behavior
- Order: 6
- Section: 基础篇
- Description: 基础篇第6课

### 第7课
- Title: 如何让产品变得高端大气上档次?
- Slug: how-to-make-product-premium
- Order: 7
- Section: 基础篇
- Description: 基础篇第7课

### 第8课
- Title: 如何借助开源软件加快开发过程?
- Slug: how-to-use-opensource
- Order: 8
- Section: 基础篇
- Description: 基础篇第8课

### 第9课
- Title: 如何冷启动?
- Slug: how-to-cold-start
- Order: 9
- Section: 基础篇
- Description: 基础篇第9课

### 第10课
- Title: 如何让 AI发挥最大的潜力?
- Slug: how-to-maximize-ai-potential
- Order: 10
- Section: 基础篇
- Description: 基础篇第10课

## 4. 为每个课程创建3个模块

在 Content Manager → Module 中，为每个课程创建以下3个模块：

### 每个课程都需要创建：
1. **课前准备**
   - Title: 课前准备
   - Type: reading
   - Order: 1
   - Lesson: [选择对应的课程]
   - Duration: 10分钟
   - Content: 课前准备内容即将上线...

2. **课程内容**
   - Title: 课程内容
   - Type: video
   - Order: 2
   - Lesson: [选择对应的课程]
   - Duration: 15分钟
   - Content: 课程内容即将上线...

3. **课后作业**
   - Title: 课后作业
   - Type: assignment
   - Order: 3
   - Lesson: [选择对应的课程]
   - Duration: 10分钟
   - Content: 课后作业内容即将上线...

## 5. 发布所有内容
创建完成后，确保所有 Lesson 和 Module 都点击了 "Publish" 按钮。