#!/bin/bash

# 快速部署 Strapi 到服务器的脚本

echo "=== 开始部署 Strapi CMS ==="

# 1. 安装必要软件
echo "1. 安装 Node.js 和 PostgreSQL..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get update
sudo apt-get install -y nodejs postgresql postgresql-contrib nginx git

# 2. 安装 PM2
echo "2. 安装 PM2..."
sudo npm install -g pm2

# 3. 创建数据库
echo "3. 创建数据库..."
sudo -u postgres psql <<EOF
CREATE DATABASE deepseacircle_production;
CREATE USER deepseauser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE deepseacircle_production TO deepseauser;
EOF

# 4. 克隆项目
echo "4. 克隆项目..."
cd /var/www
sudo git clone https://github.com/your-username/深海圈网站.git deepseacircle
sudo chown -R $USER:$USER /var/www/deepseacircle

# 5. 配置 Strapi
echo "5. 配置 Strapi..."
cd /var/www/deepseacircle/deepsea-cms
npm install

# 创建生产环境配置
cat > .env.production <<EOF
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys-here
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret

# 数据库配置
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=deepseacircle_production
DATABASE_USERNAME=deepseauser
DATABASE_PASSWORD=your_secure_password
DATABASE_SSL=false
EOF

# 6. 构建 Strapi
echo "6. 构建 Strapi..."
NODE_ENV=production npm run build

# 7. PM2 配置
echo "7. 创建 PM2 配置..."
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: 'strapi-cms',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/deepseacircle/deepsea-cms',
      env: {
        NODE_ENV: 'production',
        PORT: 1337
      }
    }
  ]
};
EOF

# 8. 启动 Strapi
echo "8. 启动 Strapi..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 9. 配置 Nginx
echo "9. 配置 Nginx..."
sudo tee /etc/nginx/sites-available/strapi-cms <<EOF
server {
    listen 80;
    server_name cms.deepseacircle.com;

    location / {
        proxy_pass http://localhost:1337;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Server \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Host \$http_host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_pass_request_headers on;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/strapi-cms /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "=== Strapi 部署完成！==="
echo "访问: http://your-server-ip:1337/admin"