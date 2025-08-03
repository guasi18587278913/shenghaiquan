# 配置API代理说明

## 使用步骤

### 1. 先提交代码到GitHub
```bash
git add .
git commit -m "添加数据库API代理功能"
git push origin main
```

### 2. 等待服务器自动部署（1-2分钟）

### 3. 在服务器上配置环境变量

在宝塔面板终端执行：
```bash
cd /www/wwwroot/deepsea
echo "DB_PROXY_KEY=your-secure-key-2025" >> .env
pm2 restart deepsea
```

### 4. 测试API代理是否工作

在本地浏览器访问：
http://111.231.19.162:3000/api/db-proxy

应该看到健康检查的响应。

### 5. 使用代理模式

现在你的本地开发环境会通过HTTP API访问服务器数据库，不需要开放5432端口。

## 工作原理

1. 本地代码通过HTTP请求访问服务器的 `/api/db-proxy`
2. 服务器验证API密钥后执行数据库查询
3. 返回查询结果给本地

## 安全说明

- API代理只在开发环境使用
- 需要API密钥认证
- 建议定期更换密钥

## 如果不想用代理

将 `.env.local` 中的 `USE_DB_PROXY` 改为 `false`，就会使用本地数据库。