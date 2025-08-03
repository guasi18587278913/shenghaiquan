# Strapi 连接 PostgreSQL 配置指南

## 配置步骤

### 1. 安装 PostgreSQL 驱动
```bash
cd deepsea-cms
npm install pg
```

### 2. 修改环境变量
编辑 `deepsea-cms/.env` 文件：

```env
# Database
DATABASE_CLIENT=postgres
DATABASE_HOST=111.231.19.162
DATABASE_PORT=5432
DATABASE_NAME=deepsea
DATABASE_USERNAME=guasi
DATABASE_PASSWORD=Scys-0418
DATABASE_SSL=false
```

### 3. 清理并重新构建
```bash
rm -rf .cache build
npm run build
```

### 4. 启动 Strapi
```bash
npm run develop
```

## 注意事项

1. **首次启动**：Strapi 会自动创建所需的数据库表
2. **内容类型**：需要重新创建，因为数据库结构已改变
3. **数据迁移**：之前在 SQLite 中的数据需要重新输入

## 验证连接

启动成功后，访问：
- 管理后台：http://localhost:1337/admin
- API：http://localhost:1337/api/courses

## 故障排查

如果遇到连接问题：
1. 确认数据库服务器允许远程连接
2. 检查防火墙是否开放 5432 端口
3. 验证用户名和密码是否正确
4. 查看 Strapi 启动日志获取详细错误信息