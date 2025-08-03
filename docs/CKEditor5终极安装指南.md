# CKEditor 5 终极安装指南 - Strapi 5

## 前言
本指南将帮助你在 Strapi 5 中安装一个真正的富文本编辑器，支持在编辑器内直接插入图片、表格等富媒体内容。

## 安装前准备

### 1. 确认当前状态
- 确保你在 Strapi 项目目录：`deepsea-cms`
- 确保 Strapi 服务已停止（如果正在运行，按 Ctrl+C 停止）

## 安装步骤

### 步骤 1：停止 Strapi 服务
```bash
# 如果 Strapi 正在运行，按 Ctrl+C 停止
# 确认已停止后继续下一步
```

### 步骤 2：清理之前的安装（如果有）
```bash
# 进入项目目录
cd /Users/liyadong/Documents/GitHub/深海圈网站/deepsea-cms

# 卸载旧的 CKEditor 插件（如果存在）
npm uninstall @ckeditor/strapi-plugin-ckeditor

# 删除旧的配置文件
rm -f config/plugins.js

# 清理缓存和构建文件
rm -rf .cache
rm -rf build
```

### 步骤 3：安装社区版 CKEditor 5 插件
```bash
# 安装 Strapi 5 兼容的 CKEditor 插件
# 注意：包名开头是 @_sh 不是 @ckeditor
npm install @_sh/strapi-plugin-ckeditor
```

等待安装完成，应该看到类似 "added xxx packages" 的成功信息。

### 步骤 4：创建配置文件
配置文件已经为你创建好了：`config/plugins.ts`

如果需要确认文件内容，运行：
```bash
cat config/plugins.ts
```

### 步骤 5：重新构建 Strapi
```bash
# 这一步很重要！必须重新构建才能使插件生效
npm run build
```

这个过程可能需要几分钟，会看到：
- ✔ Compiling TS
- ✔ Building build context
- ✔ Building admin panel

等待直到返回命令提示符。

### 步骤 6：启动 Strapi
```bash
npm run develop
```

等待启动完成，看到：
```
[info] Strapi started successfully
http://localhost:1337
```

## 使用新的 CKEditor

### 1. 修改 Lesson 的 content 字段

1. 在浏览器打开：http://localhost:1337/admin
2. 进入 **Content-Type Builder**
3. 选择 **Lesson**
4. 找到 **content** 字段，点击垃圾桶图标删除它
5. 点击 **"Add another field"**
6. 在字段类型选择中，你应该能看到新的选项：
   - **"CKEditor 5"** 或 **"Rich text (CKEditor)"**
   - 选择这个新选项
7. 配置字段：
   - Name: `content`
   - 其他保持默认
8. 点击 **Finish**
9. 点击 **Save** 保存内容类型

### 2. 测试编辑器

1. 进入 **Content Manager**
2. 选择 **Lesson**
3. 编辑或创建一个课程
4. 在 content 字段中，你现在应该看到一个功能完整的编辑器：
   - 工具栏有上传图片按钮
   - 可以直接粘贴图片
   - 支持表格、媒体嵌入等

## 故障排查

### 如果看不到 CKEditor 选项

1. 确认插件是否安装成功：
```bash
# 检查 package.json
cat package.json | grep ckeditor

# 应该看到：
# "@_sh/strapi-plugin-ckeditor": "版本号"
```

2. 确认是否正确构建：
```bash
# 重新清理并构建
rm -rf .cache build node_modules/.cache
npm run build --clean
npm run develop
```

3. 检查日志是否有错误：
- 查看终端输出
- 查看浏览器控制台

### 如果构建失败

1. 清理所有缓存：
```bash
rm -rf .cache build .strapi node_modules/.cache
```

2. 重新安装依赖：
```bash
npm install
```

3. 再次构建：
```bash
npm run build
```

### 如果插件加载失败

检查 TypeScript 配置：
```bash
# 确保配置文件是 .ts 后缀
ls config/plugins.ts
```

## 备用方案

如果 @_sh/strapi-plugin-ckeditor 不工作，可以尝试其他编辑器：

### 安装 TinyMCE（备选）
```bash
npm install strapi-plugin-tinymce
```

然后修改 config/plugins.ts：
```typescript
export default {
  tinymce: {
    enabled: true,
    config: {
      editor: {
        menubar: false,
        plugins: 'lists link image table',
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image'
      }
    }
  }
}
```

## 完成标志

安装成功后，你应该能够：
1. ✅ 在 Content-Type Builder 中看到新的编辑器选项
2. ✅ 在编辑器中直接上传图片
3. ✅ 在同一个编辑器中混合文字和图片
4. ✅ 使用表格、列表等富文本功能

## 注意事项

1. **不要跳过构建步骤**：`npm run build` 是必须的
2. **确保使用正确的包名**：是 `@_sh/strapi-plugin-ckeditor` 不是 `@ckeditor/strapi-plugin-ckeditor`
3. **配置文件必须是 TypeScript**：使用 `plugins.ts` 而不是 `plugins.js`
4. **每次修改配置后都要重新构建**

现在，请从步骤 1 开始，按顺序执行每个命令！