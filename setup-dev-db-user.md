# 创建开发专用数据库账号

如果SSH隧道连接有问题，可以在服务器上创建一个受限的开发账号：

## 在宝塔面板终端执行：

```bash
# 1. 进入PostgreSQL
sudo -u postgres psql

# 2. 创建开发专用用户（只有查询权限）
CREATE USER dev_reader WITH PASSWORD 'Dev2025ReadOnly';

# 3. 授予只读权限
GRANT CONNECT ON DATABASE deepsea TO dev_reader;
\c deepsea
GRANT USAGE ON SCHEMA public TO dev_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dev_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO dev_reader;

# 4. 创建开发写入用户（如果需要）
CREATE USER dev_writer WITH PASSWORD 'Dev2025Write';
GRANT CONNECT ON DATABASE deepsea TO dev_writer;
\c deepsea
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dev_writer;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dev_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO dev_writer;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO dev_writer;

# 5. 退出
\q
```

## 修改PostgreSQL配置允许特定IP

```bash
# 编辑 pg_hba.conf
cd /www/server/pgsql/data
echo "host    deepsea    dev_reader    你的IP地址/32    md5" >> pg_hba.conf
echo "host    deepsea    dev_writer    你的IP地址/32    md5" >> pg_hba.conf

# 重启PostgreSQL
systemctl restart postgresql
```

## 在本地使用

修改 `.env.local`：
```
# 只读账号（推荐）
DATABASE_URL="postgresql://dev_reader:Dev2025ReadOnly@111.231.19.162:5432/deepsea"

# 或读写账号（开发需要时）
DATABASE_URL="postgresql://dev_writer:Dev2025Write@111.231.19.162:5432/deepsea"
```