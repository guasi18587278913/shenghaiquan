# 开放PostgreSQL端口配置

## 在宝塔面板操作：

### 1. 检查PostgreSQL是否在运行
```bash
sudo systemctl status postgresql
```

### 2. 检查PostgreSQL监听地址
```bash
# 查看配置文件位置
sudo -u postgres psql -c "SHOW config_file;"

# 编辑配置文件（通常在 /etc/postgresql/*/main/postgresql.conf）
sudo nano /etc/postgresql/*/main/postgresql.conf
```

找到 `listen_addresses` 行，修改为：
```
listen_addresses = '*'
```

### 3. 修改pg_hba.conf允许远程连接
```bash
# 编辑认证配置
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

添加一行：
```
host    all             all             0.0.0.0/0               md5
```

### 4. 重启PostgreSQL
```bash
sudo systemctl restart postgresql
```

### 5. 在宝塔面板开放端口

1. 登录宝塔面板
2. 点击"安全"
3. 点击"放行端口"
4. 添加端口：5432
5. 备注：PostgreSQL

### 6. 检查防火墙（如果有）
```bash
# 如果使用ufw
sudo ufw allow 5432/tcp

# 如果使用firewalld
sudo firewall-cmd --add-port=5432/tcp --permanent
sudo firewall-cmd --reload
```

## 临时解决方案：使用本地SQLite

如果暂时无法开放端口，可以先用本地数据库开发：

### 1. 修改回SQLite配置

创建 `.env.local` 文件：
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. 修改schema.prisma
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

### 3. 创建测试数据
```bash
# 迁移数据库
npx prisma migrate dev

# 导入测试数据
npx prisma db seed
```

## 推荐方案：SSH隧道（最安全）

不开放5432端口，通过SSH隧道连接：

### 在本地终端运行：
```bash
# 创建SSH隧道
ssh -L 5432:localhost:5432 root@111.231.19.162
```

### 修改.env.local：
```
DATABASE_URL="postgresql://guasi:Scys-0418@localhost:5432/deepsea"
```

这样数据库连接会通过SSH加密隧道，更安全。

