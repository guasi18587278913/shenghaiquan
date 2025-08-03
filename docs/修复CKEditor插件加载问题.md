# 修复 CKEditor 插件加载问题

## 问题描述
启动 Strapi 时出现错误：
```
Error: Error loading the plugin ckeditor because ckeditor is not installed
```

## 解决步骤

### 步骤 1：检查插件是否正确安装
```bash
# 确认插件存在
ls node_modules/@_sh/strapi-plugin-ckeditor

# 如果存在，会显示插件目录内容
# 如果不存在，需要重新安装
```

### 步骤 2：删除 TypeScript 配置文件
```bash
rm config/plugins.ts
```

### 步骤 3：创建 JavaScript 配置文件
```bash
cat > config/plugins.js << 'EOF'
module.exports = {
  'strapi-plugin-ckeditor': {
    enabled: true,
  }
};
EOF
```

### 步骤 4：验证配置文件已创建
```bash
# 查看新配置文件内容
cat config/plugins.js
```

应该看到：
```javascript
module.exports = {
  'strapi-plugin-ckeditor': {
    enabled: true,
  }
};
```

### 步骤 5：启动 Strapi
```bash
npm run develop
```

## 如果还是不行，尝试以下方案

### 方案 A：使用完整插件名称
```bash
# 修改配置文件
cat > config/plugins.js << 'EOF'
module.exports = {
  '@_sh/strapi-plugin-ckeditor': {
    enabled: true,
  }
};
EOF

# 重新启动
npm run develop
```

### 方案 B：不使用配置文件
```bash
# 删除配置文件
rm config/plugins.js

# 直接启动（插件会自动加载）
npm run develop
```

### 方案 C：重新安装插件
```bash
# 停止 Strapi（如果正在运行）
# Ctrl + C

# 重新安装
npm uninstall @_sh/strapi-plugin-ckeditor
npm install @_sh/strapi-plugin-ckeditor

# 清理缓存
rm -rf .cache build

# 重新构建
npm run build

# 启动
npm run develop
```

## 验证成功标志

如果插件加载成功：
1. Strapi 正常启动，无错误信息
2. 在 Content-Type Builder 中能看到 CKEditor 字段类型选项
3. 可以正常创建和编辑富文本内容

## 注意事项

1. **插件名称**：配置文件中的插件名可能需要调整：
   - `ckeditor`
   - `strapi-plugin-ckeditor`
   - `@_sh/strapi-plugin-ckeditor`

2. **配置文件格式**：Strapi 5 可能对 TypeScript 配置支持有限，使用 JavaScript 配置更稳定

3. **缓存问题**：如果修改后仍有问题，清理缓存很重要：
   ```bash
   rm -rf .cache build node_modules/.cache
   ```