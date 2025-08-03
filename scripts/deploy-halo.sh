#!/bin/bash

echo "=== Halo 2.0 一键部署脚本 ==="
echo "部署到: 111.231.19.162"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查是否安装了 Docker
echo -e "${YELLOW}1. 检查 Docker 安装状态...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Docker 未安装，正在安装..."
    curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✓ Docker 安装完成${NC}"
else
    echo -e "${GREEN}✓ Docker 已安装${NC}"
fi

# 创建 Halo 工作目录
echo -e "\n${YELLOW}2. 创建工作目录...${NC}"
mkdir -p ~/halo
cd ~/halo
echo -e "${GREEN}✓ 工作目录创建完成${NC}"

# 下载 docker-compose.yml
echo -e "\n${YELLOW}3. 创建 docker-compose 配置...${NC}"
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

echo -e "${GREEN}✓ 配置文件创建完成${NC}"

# 启动 Halo
echo -e "\n${YELLOW}4. 启动 Halo...${NC}"
docker-compose up -d

# 等待启动
echo -e "\n${YELLOW}5. 等待 Halo 启动（约30秒）...${NC}"
sleep 30

# 检查状态
if curl -f http://localhost:8090/actuator/health &> /dev/null; then
    echo -e "${GREEN}✓ Halo 启动成功！${NC}"
    echo -e "\n${GREEN}=== 部署完成 ===${NC}"
    echo -e "访问地址: http://111.231.19.162:8090"
    echo -e "管理员账号: admin"
    echo -e "管理员密码: P@88w0rd"
    echo -e "\n${YELLOW}请立即登录后台修改密码！${NC}"
else
    echo -e "\n❌ Halo 启动失败，请检查日志："
    docker-compose logs
fi