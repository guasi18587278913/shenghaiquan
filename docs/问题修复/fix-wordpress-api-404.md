# 修复 WordPress REST API 404 错误

## 方法一：修改固定链接（最简单）

1. 登录 WordPress 后台：http://111.231.19.162/wp-admin
2. 进入【设置】→【固定链接】
3. 选择【朴素】，点击【保存更改】
4. 再选择【文章名】，点击【保存更改】
5. 重新测试：http://111.231.19.162/wp-json/wp/v2/posts

## 方法二：在宝塔添加伪静态规则

1. 登录宝塔面板
2. 点击【网站】
3. 找到您的 WordPress 网站，点击【设置】
4. 选择【伪静态】
5. 选择 WordPress 预设规则，或手动添加：

```nginx
location / {
    try_files $uri $uri/ /index.php?$args;
}

# 添加 REST API 支持
rewrite ^/wp-json/(.*?)$ /?rest_route=/$1 last;
```

6. 保存并重启网站

## 方法三：检查 .htaccess 文件

1. 在宝塔文件管理器
2. 进入 WordPress 根目录
3. 查看是否有 .htaccess 文件
4. 如果没有，创建一个，内容如下：

```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

## 方法四：直接测试其他 API 端点

试试这些地址：
```
http://111.231.19.162/?rest_route=/wp/v2/posts
http://111.231.19.162/index.php?rest_route=/wp/v2/posts
http://111.231.19.162/index.php/wp-json/wp/v2/posts
```

如果某个能用，我们就知道是路径问题。

## 方法五：启用调试模式

1. 在宝塔文件管理器编辑 wp-config.php
2. 添加：

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', true);
```

3. 再次访问 API 地址，查看具体错误

## 临时解决方案

如果 API 确实有问题，可以先用这个地址测试您的 Next.js：

在 `/lib/wordpress-api.ts` 中临时修改：
```typescript
// 如果上面某个地址能用，就改成那个
const WP_API_URL = 'http://111.231.19.162/index.php?rest_route=/wp/v2';
```

## 快速测试

在浏览器依次尝试：
1. http://111.231.19.162/?rest_route=/wp/v2/posts
2. http://111.231.19.162/index.php?rest_route=/wp/v2/posts

如果这两个能看到数据，说明 API 正常，只是路径问题！