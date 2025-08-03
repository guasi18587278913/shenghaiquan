# Strapi 集成当前状态

## 已完成的工作

### 1. Strapi 安装和配置
- ✅ 成功安装 Strapi 5
- ✅ 配置了 TypeScript 支持
- ✅ 安装了 CKEditor 5 插件（支持富文本编辑）

### 2. 内容模型创建
- ✅ Course (章节) - 对应原系统的 Section
- ✅ Lesson (课程) - 包含富文本内容
- ✅ SubLesson (子课程) - 课程的子单元
- ✅ 建立了内容类型之间的关联关系

### 3. 测试内容
- ✅ 创建了"前言"章节
- ✅ 创建了两个测试课程，包含富文本和图片

### 4. API 集成
- ✅ 配置了公开 API 访问权限
- ✅ 创建了 Strapi API 客户端（lib/strapi-api.ts）
- ✅ 创建了测试页面验证连接

## 当前问题

### PostgreSQL 连接
- 尝试连接远程 PostgreSQL 数据库遇到网络问题
- 可能原因：
  1. 防火墙限制
  2. 数据库配置不允许远程连接
  3. 网络连接问题

## 解决方案

### 方案 A：继续使用 SQLite（推荐）
**优点：**
- 立即可用，无需额外配置
- 适合内容管理场景
- 可以定期导出数据同步到主数据库

**实施步骤：**
1. 恢复 SQLite 配置
2. 完成内容创建
3. 通过 API 同步数据到主站

### 方案 B：使用 SSH 隧道
**需要：**
- 服务器 SSH 访问权限
- 配置 SSH 密钥认证

### 方案 C：配置数据库远程访问
**需要：**
- 修改 PostgreSQL 配置允许远程连接
- 开放防火墙端口

## 推荐的下一步

1. **先使用 SQLite 完成内容创建**
   - 这样可以立即开始工作
   - 不影响内容编辑体验

2. **通过 API 同步方式集成**
   - 主站通过 Strapi API 获取内容
   - 保持系统解耦
   - 更灵活的部署方式

3. **后续优化**
   - 可以考虑将 Strapi 部署到云服务器
   - 或设置定时同步任务

## 快速恢复 SQLite

如需恢复使用 SQLite，编辑 `.env` 文件：

```env
DATABASE_CLIENT=sqlite
# DATABASE_HOST=111.231.19.162
# DATABASE_PORT=5432
# DATABASE_NAME=deepsea
# DATABASE_USERNAME=guasi
# DATABASE_PASSWORD=Scys-0418
DATABASE_SSL=false
DATABASE_FILENAME=.tmp/data.db
```

然后重启 Strapi：
```bash
npm run develop
```