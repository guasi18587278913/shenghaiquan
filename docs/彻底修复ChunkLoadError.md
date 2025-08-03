# 彻底修复 ChunkLoadError

## 1. 停止当前运行的服务
按 `Ctrl+C` 停止当前的 npm run dev

## 2. 彻底清理所有缓存和构建文件
```bash
# 清理 Next.js 构建
rm -rf .next

# 清理 Node 模块缓存
rm -rf node_modules/.cache

# 清理 Next.js 静态文件缓存
rm -rf .next/static
rm -rf .next/cache

# 清理浏览器缓存（重要！）
# 在浏览器中按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+F5 (Windows)
```

## 3. 清理浏览器缓存（在浏览器中操作）
1. 打开 Chrome 开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

或者：
1. 打开新的隐身/无痕窗口
2. 访问 http://localhost:3000

## 4. 重新启动开发服务器
```bash
# 使用开发模式启动，禁用优化
NODE_ENV=development npm run dev
```

## 5. 如果还有问题，尝试以下命令
```bash
# 方案 A：清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
npm run dev

# 方案 B：使用 turbo 模式（如果支持）
npm run dev -- --turbo

# 方案 C：禁用 SWC 编译器
NEXT_DISABLE_SWC=true npm run dev
```

## 6. 验证修复
1. 等待编译完成（可能需要 1-2 分钟）
2. 访问 http://localhost:3000/map
3. 打开开发者工具查看是否还有错误

## 常见问题解决

### 如果提示端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀掉进程（替换 PID 为实际进程号）
kill -9 PID

# 或使用其他端口
npm run dev -- --port 3001
```

### 如果还是有 ChunkLoadError
```bash
# 创建一个全新的构建
rm -rf .next
mkdir .next
echo '{"version": 3}' > .next/BUILD_ID
npm run dev
```

## 注意事项
- 首次启动可能需要较长时间编译
- 确保没有防火墙或代理影响 webpack 的热更新
- 如果使用 VPN，尝试关闭后再试