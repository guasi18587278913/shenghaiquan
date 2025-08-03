# 解决 WordPress "此响应不是合法的 JSON 响应" 错误

## 快速解决方法

### 方法一：修改固定链接（最常见有效）
1. WordPress 后台 → 设置 → 固定链接
2. 先选择"朴素"，保存
3. 再改回"文章名"，保存
4. 重试发布

### 方法二：在宝塔面板检查
1. 登录宝塔面板
2. 找到网站设置
3. 添加以下伪静态规则：

```nginx
location / {
    try_files $uri $uri/ /index.php?$args;
}

# 确保 REST API 正常工作
location ~ ^/wp-json/ {
    rewrite ^/wp-json/(.*?)$ /?rest_route=/$1 last;
}
```

### 方法三：修改 .htaccess（如果是 Apache）
在网站根目录的 .htaccess 文件添加：

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

### 方法四：插件冲突检查
1. 暂时停用所有插件
2. 尝试发布文章
3. 如果成功，逐个启用插件找出冲突插件

### 方法五：增加 PHP 内存限制
在宝塔面板：
1. 软件商店 → PHP设置
2. 配置修改 → memory_limit = 256M
3. 保存并重启 PHP

## 临时解决方案

如果急需发布，可以：

### 使用经典编辑器
1. 安装插件：Classic Editor
2. 使用经典编辑器发布（避开区块编辑器的 JSON 问题）

### 直接在数据库创建
通过宝塔的 phpMyAdmin 直接插入文章（不推荐）

## 长期解决

### 完整检查清单：
- [ ] 固定链接设置正确
- [ ] 伪静态规则配置
- [ ] PHP 版本兼容（建议 7.4 或 8.0）
- [ ] 插件都是最新版本
- [ ] WordPress 是最新版本
- [ ] 服务器有足够内存

## 如果都不行

在 wp-config.php 添加调试模式：

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

然后查看 wp-content/debug.log 的错误信息。

---

**最可能的原因**：伪静态规则没有正确配置。请先尝试方法一和方法二。