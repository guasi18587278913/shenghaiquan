#!/bin/bash

# 快速部署 Next.js 到服务器的脚本

echo "=== 开始部署 Next.js 前端 ==="

# 1. 进入项目目录
cd /var/www/deepseacircle

# 2. 安装依赖
echo "1. 安装依赖..."
npm install

# 3. 创建生产环境配置
echo "2. 创建环境配置..."
cat > .env.production <<EOF
# Strapi API 地址（改为你的服务器IP或域名）
NEXT_PUBLIC_STRAPI_URL=http://111.231.19.162:1337
NEXT_PUBLIC_SITE_URL=http://111.231.19.162

# 数据库（如果需要）
DATABASE_URL=postgresql://deepseauser:your_secure_password@localhost:5432/deepseacircle_production

# NextAuth（如果使用）
NEXTAUTH_URL=http://111.231.19.162
NEXTAUTH_SECRET=your-nextauth-secret-key
EOF

# 4. 构建项目
echo "3. 构建项目..."
npm run build

# 5. PM2 配置
echo "4. 创建 PM2 配置..."
cat > ecosystem.nextjs.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'nextjs-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/deepseacircle',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF

# 6. 启动 Next.js
echo "5. 启动 Next.js..."
pm2 start ecosystem.nextjs.config.js
pm2 save

# 7. 配置 Nginx
echo "6. 配置 Nginx..."
sudo tee /etc/nginx/sites-available/nextjs-frontend <<EOF
server {
    listen 80;
    server_name deepseacircle.com www.deepseacircle.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/nextjs-frontend /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "=== Next.js 部署完成！==="
echo "访问: http://your-server-ip"