#!/bin/bash

# 超简单一键部署脚本
# 使用方法：
# 1. 将此脚本上传到服务器
# 2. chmod +x quick-deploy.sh
# 3. ./quick-deploy.sh

echo "======================================"
echo "深海圈网站一键部署脚本"
echo "======================================"

# 配置变量
SERVER_IP="111.231.19.162"
DB_PASSWORD="DeepSea@2024"
JWT_SECRET="deepsea-jwt-secret-2024"

# 更新系统
echo "1. 更新系统..."
sudo apt-get update

# 安装必要软件
echo "2. 安装 Node.js, PostgreSQL, Nginx..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib nginx git
sudo npm install -g pm2

# 创建数据库
echo "3. 创建数据库..."
sudo -u postgres psql <<EOF
CREATE DATABASE deepseacircle;
CREATE USER deepseauser WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE deepseacircle TO deepseauser;
\q
EOF

# 克隆项目
echo "4. 克隆项目..."
cd /home/ubuntu
git clone https://github.com/your-username/深海圈网站.git deepseacircle

# 部署 Strapi
echo "5. 部署 Strapi CMS..."
cd /home/ubuntu/deepseacircle/deepsea-cms
npm install

# 创建 Strapi 环境配置
cat > .env <<EOF
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS=toBeModified1,toBeModified2
API_TOKEN_SALT=tobemodified
ADMIN_JWT_SECRET=$JWT_SECRET
JWT_SECRET=$JWT_SECRET
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=deepseacircle
DATABASE_USERNAME=deepseauser
DATABASE_PASSWORD=$DB_PASSWORD
EOF

# 构建并启动 Strapi
NODE_ENV=production npm run build
pm2 start npm --name "strapi" -- start

# 部署 Next.js
echo "6. 部署 Next.js..."
cd /home/ubuntu/deepseacircle
npm install

# 创建 Next.js 环境配置
cat > .env.local <<EOF
NEXT_PUBLIC_STRAPI_URL=http://$SERVER_IP:1337
DATABASE_URL=postgresql://deepseauser:$DB_PASSWORD@localhost:5432/deepseacircle
EOF

# 构建并启动 Next.js
npm run build
pm2 start npm --name "nextjs" -- start

# 配置 Nginx
echo "7. 配置 Nginx..."
sudo tee /etc/nginx/sites-available/default <<EOF
server {
    listen 80;
    server_name $SERVER_IP;

    # Next.js 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Strapi 管理面板
    location /admin {
        proxy_pass http://localhost:1337/admin;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Server \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$http_host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
    }

    # Strapi API
    location /api {
        proxy_pass http://localhost:1337/api;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Server \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$http_host;
    }

    # Strapi 上传文件
    location /uploads {
        proxy_pass http://localhost:1337/uploads;
    }
}
EOF

# 重启 Nginx
sudo systemctl restart nginx

# 设置 PM2 开机自启
pm2 save
pm2 startup

# 迁移数据
echo "8. 准备迁移数据..."
echo "请手动执行以下步骤："
echo "1. 导出本地 Strapi 数据库"
echo "2. 导入到服务器数据库"
echo "3. 同步 uploads 文件夹"

echo ""
echo "======================================"
echo "部署完成！"
echo "======================================"
echo "前端访问: http://$SERVER_IP"
echo "Strapi 管理: http://$SERVER_IP/admin"
echo ""
echo "查看运行状态: pm2 status"
echo "查看日志: pm2 logs"
echo "======================================"