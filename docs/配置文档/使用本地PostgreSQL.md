# 使用本地PostgreSQL开发

如果SSH隧道无法连接，可以在本地安装PostgreSQL并同步数据。

## 1. 安装本地PostgreSQL

### Mac:
```bash
# 使用Homebrew安装
brew install postgresql@14
brew services start postgresql@14

# 创建数据库
createdb deepsea_dev
```

### Windows:
- 下载安装：https://www.postgresql.org/download/windows/
- 使用安装向导创建数据库

## 2. 使用Docker（更简单）

```bash
# 启动PostgreSQL容器
docker run -d \
  --name postgres-local \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=deepsea_dev \
  -p 5432:5432 \
  postgres:14

# 等待启动
sleep 5
```

## 3. 同步数据

```bash
# 运行同步脚本
node scripts/sync-database.js
```

## 4. 修改本地配置

编辑 `.env.local`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/deepsea_dev"
```

## 5. 启动开发

```bash
npm run dev
```

## 优点
- 本地速度快
- 不依赖网络
- 可以随意测试

## 缺点
- 数据不是实时的
- 需要定期同步