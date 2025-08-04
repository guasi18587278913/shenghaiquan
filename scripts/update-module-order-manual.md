# 手动更新模块顺序和文案

## 在 Strapi 管理面板中操作

1. 登录 Strapi: http://localhost:1337/admin

2. 进入 Content Manager → Module

3. 找到第一节课的3个模块，按以下方式修改：

### 模块1：准备工作 - 环境配置
- Order: 改为 **1**
- 保持其他内容不变

### 模块2：课程介绍 - 10分钟快速入门
- Order: 改为 **2**
- 如果有 videoUrl 字段，确保填写了视频链接

### 模块3：动手实践 - 创建你的第一个网站
- Title: 改为 **课后作业 - 创建你的第一个网站**
- Order: 改为 **3**
- 保持其他内容不变

4. 每个模块修改后都要点击 **Save** 按钮

5. 确保所有模块都是 **Published** 状态

## 验证视频显示

确保视频模块（课程介绍）中：
- Type: video
- Video Url: 填写了正确的视频链接（如 Bilibili 嵌入链接）

Bilibili 视频嵌入链接格式：
```
https://player.bilibili.com/player.html?aid=视频AID&bvid=视频BVID&cid=CID&page=1
```

## 刷新页面查看效果

完成后刷新页面：http://localhost:3003/courses/basic