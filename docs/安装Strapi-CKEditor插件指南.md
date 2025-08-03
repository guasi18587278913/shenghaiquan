# Strapi CKEditor 插件安装指南

## 概述
本指南将帮助你在Strapi中安装CKEditor插件，以支持富文本编辑器中的图片上传和更多格式功能。

## 安装步骤

### 1. 停止Strapi服务
在终端中按 `Ctrl+C` 停止当前运行的Strapi服务。

### 2. 安装CKEditor插件
在你的Strapi项目目录（deepsea-cms）中运行以下命令：

```bash
npm install @ckeditor/strapi-plugin-ckeditor
```

### 3. 创建插件配置文件
在Strapi项目的 `config` 目录下创建 `plugins.js` 文件（如果不存在）：

```javascript
module.exports = {
  ckeditor: {
    enabled: true,
    config: {
      editor: {
        toolbar: {
          items: [
            'heading',
            '|',
            'bold',
            'italic', 
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'outdent',
            'indent',
            '|',
            'uploadImage',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            'undo',
            'redo'
          ]
        },
        image: {
          toolbar: [
            'imageTextAlternative',
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side'
          ]
        }
      }
    }
  }
};
```

### 4. 重新构建Strapi
安装插件后需要重新构建：

```bash
npm run build
```

### 5. 启动Strapi
构建完成后，重新启动Strapi：

```bash
npm run develop
```

## 使用CKEditor

### 更新现有字段
1. 进入 Content-Type Builder
2. 选择需要更新的内容类型（如 Lesson）
3. 点击 content 字段的编辑按钮
4. 将字段类型从 "Rich text (Blocks)" 改为 "Rich text (CKEditor)"
5. 保存更改

### 创建新字段
创建新的富文本字段时，选择 "Rich text (CKEditor)" 类型。

## CKEditor 功能特性

- **图片上传**：支持直接上传、拖拽、粘贴图片
- **格式化**：标题、粗体、斜体、链接等
- **列表**：有序列表、无序列表
- **缩进**：支持内容缩进
- **引用**：块引用功能
- **表格**：插入和编辑表格
- **媒体嵌入**：支持嵌入视频等媒体

## 常见问题

### 1. 安装失败
如果安装失败，尝试：
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm install @ckeditor/strapi-plugin-ckeditor
```

### 2. 插件不显示
确保：
- 已经运行 `npm run build`
- 配置文件路径正确：`config/plugins.js`
- 插件配置中 `enabled: true`

### 3. 图片上传失败
检查：
- Media Library 权限设置
- 文件大小限制
- 支持的图片格式

## 备选方案

如果CKEditor不适用，可以考虑：

### 方案A：使用Markdown
在现有的Rich text字段中使用Markdown语法：
```markdown
![图片描述](图片URL)
```

### 方案B：添加独立的图片字段
在Content-Type Builder中为每个课程添加：
- `featuredImage` - 单个媒体字段（封面图）
- `contentImages` - 多个媒体字段（内容配图）

### 方案C：使用其他编辑器插件
- TinyMCE
- Quill
- Editor.js

## 注意事项

1. **性能影响**：CKEditor是一个功能丰富的编辑器，可能会稍微增加页面加载时间
2. **存储格式**：CKEditor保存的是HTML格式，在前端显示时需要正确处理
3. **安全性**：确保在前端正确清理HTML内容，防止XSS攻击
4. **版本兼容**：确保插件版本与你的Strapi版本兼容

## 相关链接

- [CKEditor官方文档](https://ckeditor.com/docs/)
- [Strapi插件市场](https://market.strapi.io/)
- [Strapi官方文档](https://docs.strapi.io/)