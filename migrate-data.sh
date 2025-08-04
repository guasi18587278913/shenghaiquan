#!/bin/bash

# 数据迁移脚本 - 在本地执行

echo "=== 开始数据迁移 ==="

# 1. 导出本地 Strapi 数据
echo "1. 导出本地数据库..."
cd deepsea-cms
pg_dump -h localhost -U postgres deepseacircle_dev > strapi_backup.sql

# 2. 打包上传文件
echo "2. 打包媒体文件..."
tar -czf uploads.tar.gz public/uploads

# 3. 上传到服务器
echo "3. 上传到服务器..."
scp strapi_backup.sql root@111.231.19.162:/tmp/
scp uploads.tar.gz root@111.231.19.162:/tmp/

# 4. 在服务器上导入数据
echo "4. 在服务器上执行导入..."
ssh root@111.231.19.162 << 'EOF'
cd /tmp
# 导入数据库
sudo -u postgres psql deepseacircle < strapi_backup.sql

# 解压上传文件
cd /home/ubuntu/deepseacircle/deepsea-cms
tar -xzf /tmp/uploads.tar.gz

# 重启服务
pm2 restart all

echo "数据迁移完成！"
EOF