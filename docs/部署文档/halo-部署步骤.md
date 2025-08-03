# Halo 部署清晰操作指引

## 第6步：创建配置文件

### 操作方法：
1. **一次性复制整个代码块**（从下面的 ===开始=== 到 ===结束=== 之间的所有内容）
2. 粘贴到终端
3. 按回车执行

===开始===
```bash
cat > docker-compose.yml << 'EOF'
version: "3"

services:
  halo:
    image: halohub/halo:2.19
    container_name: halo
    restart: on-failure:3
    depends_on:
      halodb:
        condition: service_healthy
    networks:
      halo_network:
    volumes:
      - ./:/root/.halo2
    ports:
      - "8090:8090"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8090/actuator/health/readiness"]
      interval: 30s
      timeout: 5s
      retries: 5
      start_period: 30s
    command:
      - --spring.r2dbc.url=r2dbc:pool:postgresql://halodb/halo
      - --spring.r2dbc.username=halo
      - --spring.r2dbc.password=openpostgresql
      - --spring.sql.init.platform=postgresql
      - --halo.external-url=http://111.231.19.162:8090
      - --halo.security.initializer.superadminusername=admin
      - --halo.security.initializer.superadminpassword=P@88w0rd

  halodb:
    image: postgres:15
    container_name: halodb
    restart: on-failure:3
    networks:
      halo_network:
    volumes:
      - ./db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "halo"]
      interval: 10s
      timeout: 5s
      retries: 5
    environment:
      - POSTGRES_PASSWORD=openpostgresql
      - POSTGRES_USER=halo
      - POSTGRES_DB=halo

networks:
  halo_network:
EOF
```
===结束===

### 执行后的预期结果：
- 终端会自动回到命令提示符：`[root@VM-12-17-opencloudos ~/halo]#`
- 这表示文件创建成功

## 第7步：检查文件是否创建成功

复制并执行：
```bash
ls -la docker-compose.yml
```

应该看到类似输出：
```
-rw-r--r-- 1 root root 1234 Jul 28 22:30 docker-compose.yml
```

## 第8步：安装 docker-compose（如果需要）

如果执行下一步时提示 "docker-compose: command not found"，先安装它：

```bash
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

## 第9步：启动 Halo

复制并执行：
```bash
docker-compose up -d
```

这会：
1. 下载 Halo 镜像（约 200MB）
2. 下载 PostgreSQL 镜像（约 150MB）
3. 启动两个容器

预计需要 3-5 分钟

## 第10步：检查状态

复制并执行：
```bash
docker ps
```

应该看到两个运行中的容器：
- halo
- halodb

## 完成！

访问地址：http://111.231.19.162:8090
- 用户名：admin
- 密码：P@88w0rd

---

### 常见问题：

**Q: 粘贴后没反应？**
A: 确保复制了完整的代码块，包括最后的 EOF

**Q: 提示 docker-compose not found？**
A: 执行第8步安装 docker-compose

**Q: 容器启动失败？**
A: 运行 `docker-compose logs` 查看错误信息