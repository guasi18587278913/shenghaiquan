# Strapi 生产环境配置指南

## 为什么需要这些配置？

### 1. 环境配置文件（.env.production）的作用
- **目的**：让 Strapi 知道在生产环境中如何运行
- **解决的问题**：
  - 开发环境和生产环境使用不同的配置
  - 保护敏感信息（密钥、数据库密码等）
  - 确保安全性和性能优化

### 2. 各配置项说明

```env
NODE_ENV=production        # 告诉 Strapi 运行在生产模式（优化性能）
HOST=0.0.0.0              # 允许外部访问（不仅仅是本地）
PORT=1337                 # Strapi 运行端口
APP_KEYS=...              # 用于加密 cookies 和 session
API_TOKEN_SALT=...        # API token 加密盐
ADMIN_JWT_SECRET=...      # 管理员认证密钥
JWT_SECRET=...            # 用户认证密钥
DATABASE_CLIENT=sqlite    # 使用 SQLite 数据库（简单、无需额外配置）
DATABASE_FILENAME=.tmp/data.db  # 数据库文件位置
```

### 3. 为什么要生成随机密钥？
- **安全性**：使用默认密钥会让您的网站容易被攻击
- **唯一性**：每个网站都应该有自己独特的密钥
- **防止数据泄露**：即使代码公开，密钥也是私密的

## 具体操作步骤

### 步骤 1：创建基础配置文件

在服务器上执行：
```bash
cd /var/www/shenghaiquan/deepsea-cms

# 创建生产环境配置文件
cat > .env.production << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS=待替换1,待替换2,待替换3,待替换4
API_TOKEN_SALT=待替换salt
ADMIN_JWT_SECRET=待替换admin
JWT_SECRET=待替换jwt
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
EOF
```

### 步骤 2：生成安全的随机密钥

执行以下命令生成 4 个随机密钥：
```bash
# 生成第一个 APP_KEY
node -e "console.log('APP_KEY1:', require('crypto').randomBytes(16).toString('base64'))"

# 生成第二个 APP_KEY
node -e "console.log('APP_KEY2:', require('crypto').randomBytes(16).toString('base64'))"

# 生成第三个 APP_KEY
node -e "console.log('APP_KEY3:', require('crypto').randomBytes(16).toString('base64'))"

# 生成第四个 APP_KEY
node -e "console.log('APP_KEY4:', require('crypto').randomBytes(16).toString('base64'))"

# 生成 API_TOKEN_SALT
node -e "console.log('API_TOKEN_SALT:', require('crypto').randomBytes(16).toString('base64'))"

# 生成 ADMIN_JWT_SECRET
node -e "console.log('ADMIN_JWT_SECRET:', require('crypto').randomBytes(16).toString('base64'))"

# 生成 JWT_SECRET
node -e "console.log('JWT_SECRET:', require('crypto').randomBytes(16).toString('base64'))"
```

### 步骤 3：更新配置文件

方法一：使用 nano 编辑器（如果可用）
```bash
nano .env.production
```

将生成的密钥替换到对应位置：
- 将 "待替换1,待替换2,待替换3,待替换4" 替换为生成的 4 个 APP_KEY（用逗号分隔）
- 将其他 "待替换xxx" 替换为对应的密钥

保存方法：
- 按 `Ctrl + X`
- 按 `Y` 确认
- 按 `Enter` 保存

方法二：直接创建完整配置文件（推荐）
```bash
# 直接创建完整的配置文件（将下面的密钥替换为您生成的密钥）
cat > .env.production << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS=您的APP_KEY1,您的APP_KEY2,您的APP_KEY3,您的APP_KEY4
API_TOKEN_SALT=您的API_TOKEN_SALT
ADMIN_JWT_SECRET=您的ADMIN_JWT_SECRET
JWT_SECRET=您的JWT_SECRET
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
EOF

# 确认文件内容
cat .env.production
```

示例（使用实际生成的密钥）：
```bash
cat > .env.production << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS=QDAmhUQ7yZjus9LX0iaOng==,33jo/gzmObuf4kJLiCTXiQ==,wtwXHmSjvBaGagdwFQ4SJA==,ZdYBcC25UGVmKrdYZtJW9g==
API_TOKEN_SALT=KHOQ18JyqOqtftSjrGF4OQ==
ADMIN_JWT_SECRET=Y86GfQYlz5rCvQbUmJ9JbQ==
JWT_SECRET=ceHCGu27/3iQq3NnkExxeA==
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
EOF
```

### 步骤 4：构建 Strapi

```bash
# 构建生产版本（这会优化代码）
NODE_ENV=production npm run build
```

这个过程可能需要 2-5 分钟。构建成功后会显示：
- ✔ Compiling TS
- ✔ Building build context
- ✔ Building admin panel

### 步骤 5：创建 PM2 配置文件

```bash
# 创建 PM2 配置（用于管理进程）
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'strapi-cms',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/shenghaiquan/deepsea-cms',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF
```

### 步骤 6：启动 Strapi

```bash
# 使用 PM2 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志（确认启动成功）
pm2 logs strapi-cms --lines 20
```

## 预期结果

成功后您应该看到：
1. PM2 显示 strapi-cms 状态为 "online"
2. 日志显示 "Strapi server is running at http://0.0.0.0:1337"
3. 可以通过 `http://服务器IP:1337/admin` 访问 Strapi 管理面板

### 步骤 6.5：修正配置文件（如果使用了错误的密钥）

如果不小心使用了占位符文本，需要重新创建配置文件：

```bash
# 使用实际生成的密钥重新创建配置文件
cat > .env.production << 'EOF'
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS=QDAmhUQ7yZjus9LX0iaOng==,33jo/gzmObuf4kJLiCTXiQ==,wtwXHmSjvBaGagdwFQ4SJA==,ZdYBcC25UGVmKrdYZtJW9g==
API_TOKEN_SALT=KHOQ18JyqOqtftSjrGF4OQ==
ADMIN_JWT_SECRET=Y86GfQYlz5rCvQbUmJ9JbQ==
JWT_SECRET=ceHCGu27/3iQq3NnkExxeA==
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db
EOF

# 确认文件内容正确
cat .env.production
```

## 常见问题

### Q: 为什么选择 SQLite？
A: 
- 无需额外安装数据库服务
- 对于中小型项目完全够用
- 配置简单，适合快速部署
- 后续可以轻松迁移到 PostgreSQL/MySQL

### Q: 构建失败怎么办？
A: 
1. 检查 Node.js 版本：`node --version`（需要 18.x）
2. 清理缓存重试：`rm -rf node_modules .cache && npm install`
3. 查看详细错误信息

### Q: 如何确认 Strapi 正常运行？
A: 
1. 检查进程：`pm2 status`
2. 查看日志：`pm2 logs strapi-cms`
3. 测试访问：`curl http://localhost:1337/api`

## 下一步

Strapi 启动成功后，我们需要：
1. 部署 Next.js 前端
2. 配置 Nginx 反向代理
3. 迁移本地数据到服务器