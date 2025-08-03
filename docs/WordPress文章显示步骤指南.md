# WordPress 文章显示在网页上的步骤指南

## 第一步：测试 WordPress API 是否正常

1. 在浏览器访问：
   ```
   http://111.231.19.162/wp-json/wp/v2/posts
   ```

2. 应该看到 JSON 格式的文章数据，包含您刚发布的"这套课程有什么不同?"

## 第二步：在本地运行您的网站

1. 打开终端（在您的电脑上，不是服务器）

2. 进入项目目录：
   ```bash
   cd /Users/liyadong/Documents/GitHub/深海圈网站
   ```

3. 安装依赖（如果还没安装）：
   ```bash
   npm install
   ```

4. 运行开发服务器：
   ```bash
   npm run dev
   ```

5. 打开浏览器访问：
   ```
   http://localhost:3000/courses/wp
   ```

## 第三步：查看课程页面

您应该能看到：
- 课程列表页面
- 您刚发布的文章"这套课程有什么不同?"
- 点击可以查看详情

## 第四步：如果看不到文章

### 检查 1：API 地址
确认 `/lib/wordpress-api.ts` 文件中的地址正确：
```typescript
const WP_API_URL = 'http://111.231.19.162/wp-json/wp/v2';
```

### 检查 2：跨域问题
如果控制台报错 CORS，在 WordPress 添加跨域支持：

1. 在宝塔文件管理器找到 WordPress 目录
2. 编辑 `wp-content/themes/您的主题/functions.php`
3. 添加以下代码：

```php
// 允许跨域访问
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
        return $value;
    });
});
```

## 第五步：部署到线上

当本地测试没问题后：

1. 提交代码到 GitHub：
   ```bash
   git add .
   git commit -m "添加WordPress课程页面"
   git push origin main
   ```

2. 在服务器上更新：
   ```bash
   cd /var/www/deepseacircle
   git pull
   npm install
   npm run build
   pm2 restart deepseacircle
   ```

3. 访问线上地址：
   ```
   https://deepseacircle.com/courses/wp
   ```

## 工作原理图解

```
WordPress (内容管理)
    ↓ 
发布文章
    ↓
REST API 提供数据
    ↓
Next.js 获取数据
    ↓
显示在网页上
```

## 常见问题

### Q: 为什么本地能看到，线上看不到？
A: 检查：
1. 服务器防火墙是否允许 API 访问
2. 是否已经部署最新代码
3. API 地址是否正确

### Q: 文章更新了但网页没变化？
A: Next.js 可能有缓存，可以：
1. 刷新页面（Ctrl+F5）
2. 重启 Next.js 服务

### Q: 想要实时预览怎么办？
A: 可以安装 WordPress 预览插件，或直接在 WordPress 后台查看

## 下一步

1. **美化样式**：调整课程卡片的设计
2. **添加分类**：在 WordPress 创建课程分类
3. **上传图片**：给文章添加特色图片作为封面
4. **SEO优化**：添加文章描述和关键词

---

现在您已经完成了基础连接！WordPress 负责内容，Next.js 负责展示，完美配合！