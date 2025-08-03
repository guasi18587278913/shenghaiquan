# WordPress 课程版权保护完整方案

## 一、基础保护（立即可用）

### 1. 使用密码保护
- 在发布时选择【密码保护】
- 为不同级别课程设置不同密码
- 付费学员获得密码

### 2. 禁用右键和复制
在 WordPress 后台，【外观】→【主题编辑器】→【functions.php】，添加：

```php
// 禁用右键菜单和文本选择
function disable_copy_paste() {
    ?>
    <script type="text/javascript">
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());
    </script>
    <?php
}
add_action('wp_head', 'disable_copy_paste');
```

## 二、插件保护方案（推荐）

### 1. WP Content Copy Protection
- 搜索安装：WP Content Copy Protection & No Right Click
- 功能：禁止复制、右键、打印、截图快捷键
- 免费且好用

### 2. MemberPress（付费会员系统）
- 创建会员等级
- 限制内容访问
- 集成支付功能

### 3. WP Private Content Plus
- 基于用户角色的内容保护
- 支持部分内容保护

## 三、高级保护措施

### 1. 水印保护
安装插件：Easy Watermark
- 自动给图片加水印
- 支持文字和图片水印

### 2. 防下载保护
```javascript
// 禁止图片下载
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', e => e.preventDefault());
});
```

### 3. 定制短代码保护
在主题的 functions.php 添加：

```php
// 创建受保护内容短代码
function protected_content_shortcode($atts, $content = null) {
    if (is_user_logged_in()) {
        return '<div class="protected-content">' . $content . '</div>';
    } else {
        return '<div class="login-prompt">请登录后查看此内容</div>';
    }
}
add_shortcode('protected', 'protected_content_shortcode');
```

使用方法：
```
[protected]这里是受保护的内容[/protected]
```

## 四、Next.js 端的保护

在您的 Next.js 网站也要加强保护：

```typescript
// 禁用开发者工具
useEffect(() => {
  // 检测开发者工具
  const devtools = {open: false, orientation: null};
  const threshold = 160;
  
  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        alert('请勿尝试查看源代码');
        window.location.href = '/';
      }
    } else {
      devtools.open = false;
    }
  }, 500);
}, []);
```

## 五、法律保护

### 1. 添加版权声明
在每篇文章底部自动添加：

```php
function add_copyright_notice($content) {
    if (is_single()) {
        $copyright = '<div class="copyright-notice">
            <p>© 2024 深海圈. 本文章受版权保护，未经授权禁止转载。</p>
            <p>侵权必究，违者将承担法律责任。</p>
        </div>';
        $content .= $copyright;
    }
    return $content;
}
add_filter('the_content', 'add_copyright_notice');
```

### 2. 记录访问日志
安装 WP Statistics 插件，记录：
- 谁访问了哪些内容
- 访问时间和IP
- 可作为维权证据

## 六、推荐组合方案

**免费方案**：
1. 密码保护 + WP Content Copy Protection
2. 添加水印和版权声明
3. 定期更换密码

**付费方案**：
1. MemberPress 会员系统
2. 自动水印 + 防复制
3. 访问日志记录
4. CDN 防盗链

## 七、重要提醒

1. **分级保护**：
   - 免费预览章节：公开
   - 付费课程：密码保护或会员限制

2. **用户体验平衡**：
   - 不要过度保护影响正常学习
   - 保留打印功能给付费用户

3. **定期备份**：
   - 使用宝塔自动备份
   - 保存原始文档

记住：技术保护只是辅助，最重要的是：
- 持续产出优质内容
- 建立良好的用户关系
- 合理的定价策略