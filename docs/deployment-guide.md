# 深海圈网站部署指南

## 架构概览

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   用户浏览器     │────▶│    Next.js      │────▶│   Strapi CMS    │
│                 │     │  (前端应用)      │     │   (内容管理)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │    PostgreSQL   │
                                                 │    (数据库)      │
                                                 └─────────────────┘
```

## 部署方案对比

### 方案1：Vercel + 云服务器（推荐）

**架构**：
- Next.js → Vercel（自动部署）
- Strapi → 阿里云/腾讯云 ECS
- 数据库 → 云数据库 RDS

**优势**：
- Vercel 自动 CI/CD
- 全球 CDN 加速
- 零配置 HTTPS

### 方案2：统一服务器部署

**架构**：
- 所有服务部署在同一台服务器
- 使用 Nginx 反向代理
- PM2 进程管理

## 详细部署步骤

### 第一步：部署 Strapi CMS

1. **准备服务器**
   ```bash
   # 服务器要求
   - Ubuntu 20.04+ 或 CentOS 7+
   - 2核 4GB RAM 起步
   - Node.js 18+
   - PostgreSQL 12+
   ```

2. **安装依赖**
   ```bash
   # 安装 Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # 安装 PostgreSQL
   sudo apt-get install postgresql postgresql-contrib

   # 安装 PM2
   npm install -g pm2
   ```

3. **配置 Strapi**
   ```bash
   # 克隆项目
   git clone https://github.com/your-repo/deepsea-circle.git
   cd deepsea-circle/deepsea-cms

   # 安装依赖
   npm install

   # 配置环境变量
   cp .env.example .env.production
   # 编辑 .env.production 填入数据库信息

   # 构建
   NODE_ENV=production npm run build

   # 使用 PM2 启动
   pm2 start ecosystem.config.js --env production
   ```

4. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name cms.deepseacircle.com;

       location / {
           proxy_pass http://localhost:1337;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 第二步：部署 Next.js

#### 选项 A：使用 Vercel（推荐）

1. **连接 GitHub**
   - 登录 Vercel
   - Import Git Repository
   - 选择你的项目仓库

2. **配置环境变量**
   ```
   NEXT_PUBLIC_STRAPI_URL=https://cms.deepseacircle.com
   其他必要的环境变量...
   ```

3. **自动部署**
   - 每次 push 到 main 分支自动部署

#### 选项 B：自建服务器

1. **构建应用**
   ```bash
   # 本地构建
   npm run build

   # 或在服务器上构建
   git pull
   npm install
   npm run build
   ```

2. **PM2 配置**
   ```javascript
   // ecosystem.config.js
   module.exports = {
     apps: [{
       name: 'deepseacircle-frontend',
       script: 'npm',
       args: 'start',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   }
   ```

3. **Nginx 配置**
   ```nginx
   server {
       listen 80;
       server_name deepseacircle.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### 第三步：数据迁移

1. **导出本地 Strapi 数据**
   ```bash
   # 导出数据库
   pg_dump -U postgres deepseacircle_dev > backup.sql

   # 导出上传文件
   tar -czf uploads.tar.gz deepsea-cms/public/uploads
   ```

2. **导入到生产环境**
   ```bash
   # 导入数据库
   psql -U postgres deepseacircle_production < backup.sql

   # 导入文件
   tar -xzf uploads.tar.gz -C /path/to/production/
   ```

### 第四步：配置 HTTPS

使用 Let's Encrypt 免费证书：
```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d deepseacircle.com -d cms.deepseacircle.com

# 自动续期
sudo certbot renew --dry-run
```

## 环境变量配置

### Next.js (.env.production)
```bash
# API 地址
NEXT_PUBLIC_STRAPI_URL=https://cms.deepseacircle.com
NEXT_PUBLIC_SITE_URL=https://deepseacircle.com

# 认证相关
NEXTAUTH_URL=https://deepseacircle.com
NEXTAUTH_SECRET=your-secret-key

# 其他服务
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Strapi (.env.production)
```bash
# 服务器配置
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

# 数据库配置
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=deepseacircle_production
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password

# 文件上传配置
# 建议使用对象存储（OSS/S3）
```

## 监控和维护

### 1. 日志管理
```bash
# 查看 PM2 日志
pm2 logs

# 查看 Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. 性能监控
- 使用 PM2 监控：`pm2 monit`
- 配置告警通知
- 定期备份数据库

### 3. 更新流程
```bash
# 1. 备份当前版本
pm2 save
pg_dump -U postgres deepseacircle_production > backup_$(date +%Y%m%d).sql

# 2. 更新代码
git pull origin main

# 3. 更新依赖
npm install

# 4. 重新构建
npm run build

# 5. 重启服务
pm2 restart all
```

## 常见问题

### 1. CORS 配置
在 Strapi 的 `config/middlewares.js` 中配置：
```javascript
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      origin: ['https://deepseacircle.com'],
      credentials: true,
    }
  },
  // 其他中间件...
];
```

### 2. 文件上传大小限制
修改 Nginx 配置：
```nginx
client_max_body_size 100M;
```

### 3. 数据库连接池
在生产环境配置合适的连接池大小：
```javascript
// config/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      // ...
      pool: {
        min: 2,
        max: 10,
      },
    },
  },
});
```

## 成本估算

### 基础配置（月）
- 服务器：2核4G ECS ≈ ¥200
- 数据库：RDS PostgreSQL ≈ ¥100
- 域名：≈ ¥50/年
- SSL证书：免费（Let's Encrypt）
- **总计：约 ¥300/月**

### 推荐配置（月）
- 服务器：4核8G ECS ≈ ¥400
- 数据库：RDS 高可用版 ≈ ¥300
- CDN：≈ ¥100
- 对象存储：≈ ¥50
- **总计：约 ¥850/月**

## 部署检查清单

- [ ] 服务器环境准备完成
- [ ] 数据库创建并配置
- [ ] Strapi CMS 部署成功
- [ ] Next.js 前端部署成功
- [ ] HTTPS 证书配置
- [ ] 环境变量正确配置
- [ ] CORS 设置正确
- [ ] 文件上传功能正常
- [ ] 备份策略制定
- [ ] 监控告警配置
- [ ] 性能测试通过
- [ ] 安全检查完成