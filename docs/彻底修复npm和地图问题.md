# 彻底修复 npm 和地图问题

## 步骤 1：清理 npm 缓存和锁文件
```bash
# 清理 npm 缓存
npm cache clean --force

# 删除 package-lock.json（可能损坏）
rm -f package-lock.json

# 删除 node_modules（如果需要）
rm -rf node_modules
```

## 步骤 2：先创建 mock 的 useIM（避免 tim-js-sdk 阻塞）
```bash
mv hooks/useIM.ts hooks/useIM.ts.backup 2>/dev/null || true

cat > hooks/useIM.ts << 'EOF'
export default function useIM() {
  return {
    isReady: false,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    sendMessage: () => Promise.resolve(),
    onMessageReceived: () => {},
    onConversationUpdate: () => {},
    getConversationList: () => Promise.resolve([]),
    getMessageList: () => Promise.resolve([]),
  }
}
EOF
```

## 步骤 3：重新安装依赖
```bash
# 使用 npm 重新安装（会生成新的 package-lock.json）
npm install

# 单独安装 echarts（地图必需）
npm install echarts@5.4.3 --save
npm install echarts-for-react@3.0.2 --save
```

## 步骤 4：如果 echarts 安装成功，恢复地图中国数据
```bash
# 下载中国地图 GeoJSON 数据
curl -o public/china.json https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json
```

## 步骤 5：创建地图加载脚本
```bash
cat > app/map/loadChinaJson.ts << 'EOF'
export async function loadChinaJson() {
  try {
    const response = await fetch('/china.json')
    if (!response.ok) {
      // 如果本地文件不存在，使用备用数据
      console.warn('使用备用地图数据')
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('加载地图数据失败:', error)
    return null
  }
}
EOF
```

## 步骤 6：更新 ChinaMap.tsx 以处理地图数据加载失败
```bash
# 备份原文件
cp app/map/ChinaMap.tsx app/map/ChinaMap.tsx.original

# 在文件开头添加 loadChinaJson 导入
# 手动编辑或使用以下命令
```

## 步骤 7：重启开发服务器
```bash
# 停止当前服务（如果在运行）
# Ctrl+C

# 重新启动
npm run dev
```

## 步骤 8：验证修复
1. 访问 http://localhost:3000/map
2. 检查控制台是否有错误
3. 地图应该正常显示

## 备用方案：如果 npm install 仍然失败

### 使用 yarn（如果已安装）
```bash
# 安装 yarn（如果没有）
npm install -g yarn

# 使用 yarn 安装
yarn install
yarn add echarts echarts-for-react
```

### 或使用 pnpm
```bash
# 安装 pnpm
npm install -g pnpm

# 使用 pnpm 安装
pnpm install
pnpm add echarts echarts-for-react
```

## 一键执行脚本（复制全部）
```bash
# 停止所有 node 进程
pkill -f "node.*next"

# 清理和修复
npm cache clean --force
rm -f package-lock.json
mv hooks/useIM.ts hooks/useIM.ts.backup 2>/dev/null || true
echo 'export default function useIM() {
  return {
    isReady: false,
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    sendMessage: () => Promise.resolve(),
    onMessageReceived: () => {},
    onConversationUpdate: () => {},
    getConversationList: () => Promise.resolve([]),
    getMessageList: () => Promise.resolve([]),
  }
}' > hooks/useIM.ts

# 重新安装
npm install
npm install echarts@5.4.3 echarts-for-react@3.0.2 --save

# 启动
npm run dev
```