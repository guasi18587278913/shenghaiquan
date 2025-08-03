# Strapi 5 CKEditor 5 完整安装方案

## 重要说明
Strapi 5 的 Rich text (Blocks) 是通过组合不同的内容块（文本块、媒体块等）来实现图文混排，而不是在一个编辑器内直接插入图片。如果你需要传统的富文本编辑器体验，需要安装第三方插件。

## 方案一：使用社区版 CKEditor 5 插件（推荐）

### 1. 清理之前的安装
```bash
# 停止 Strapi
Ctrl + C

# 卸载旧插件
npm uninstall @ckeditor/strapi-plugin-ckeditor

# 删除旧配置
rm -f config/plugins.js

# 清理缓存
rm -rf .cache
rm -rf build
```

### 2. 安装 Strapi 5 兼容的 CKEditor 插件
```bash
# 安装社区版插件
npm install @_sh/strapi-plugin-ckeditor
```

### 3. 创建新的配置文件
创建 `config/plugins.ts` 文件（注意是 .ts 不是 .js）：

```typescript
export default {
  ckeditor: {
    enabled: true,
    config: {
      defaultConfig: {
        toolbar: [
          'heading',
          '|',
          'bold',
          'italic',
          'link',
          'bulletedList',
          'numberedList',
          '|',
          'indent',
          'outdent',
          '|',
          'blockQuote',
          'uploadImage',
          'insertTable',
          'mediaEmbed',
          '|',
          'undo',
          'redo'
        ],
        language: 'zh-cn',
        image: {
          toolbar: [
            'imageTextAlternative',
            'imageStyle:full',
            'imageStyle:side',
            'linkImage'
          ]
        }
      }
    }
  }
}
```

### 4. 重新构建和启动
```bash
# 重新构建
npm run build

# 启动开发服务器
npm run develop
```

### 5. 在 Content-Type Builder 中使用
1. 删除现有的 content 字段
2. 添加新字段时，应该能看到 "CKEditor 5" 选项
3. 如果没有看到，检查插件是否正确安装

## 方案二：使用 TinyMCE 插件（备选）

如果 CKEditor 5 仍有问题，可以尝试 TinyMCE：

```bash
# 安装 TinyMCE 插件
npm install strapi-plugin-tinymce

# 配置文件 config/plugins.ts
export default {
  tinymce: {
    enabled: true,
    config: {
      editor: {
        menubar: false,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
          'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
          'fullscreen', 'insertdatetime', 'media', 'table', 'help'
        ],
        toolbar: 'undo redo | formatselect | bold italic | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | image media | help'
      }
    }
  }
}
```

## 方案三：继续使用 Blocks 编辑器

如果决定使用内置的 Blocks 编辑器，使用方法是：

1. 在 Content Manager 中编辑内容时
2. 点击 "+" 添加 Rich text 块（文本）
3. 再点击 "+" 添加 Media 块（图片）
4. 继续交替添加文本和图片块
5. 每个块都是独立的，可以拖拽排序

优点：
- 结构化内容，前端渲染更灵活
- 无需额外插件
- 原生支持

缺点：
- 不是传统的富文本编辑体验
- 需要分块添加内容

## 故障排查

### 如果插件安装后看不到新的字段类型：

1. 确保正确构建：
```bash
npm run build --clean
```

2. 检查插件是否启用：
```bash
# 查看 node_modules 中是否有插件
ls node_modules/@_sh/strapi-plugin-ckeditor
```

3. 查看 Strapi 日志是否有错误信息

4. 尝试清理所有缓存：
```bash
rm -rf .cache build .strapi
npm run build
npm run develop
```

## 选择建议

- **如果你需要传统富文本编辑器体验**：使用方案一（CKEditor 5）
- **如果你愿意适应新的编辑方式**：使用 Strapi 5 内置的 Blocks 编辑器
- **如果都不行**：考虑在前端自定义编辑器，Strapi 只存储 HTML 或 Markdown