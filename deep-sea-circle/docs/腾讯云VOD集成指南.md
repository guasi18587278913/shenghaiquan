# 腾讯云VOD集成指南

## 1. 开通腾讯云VOD服务

1. 访问 [腾讯云VOD控制台](https://console.cloud.tencent.com/vod)
2. 开通VOD服务（标准版 1TB 499元/月）
3. 获取以下密钥：
   - SecretId
   - SecretKey
   - AppId

## 2. 安装SDK

```bash
npm install vod-node-sdk
```

## 3. 配置环境变量

在 `.env.local` 文件中添加：

```env
# 腾讯云VOD配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
TENCENT_VOD_APP_ID=your_app_id
```

## 4. 视频上传API

创建 `/app/api/video/upload/route.ts`：

```typescript
import { NextRequest, NextResponse } from "next/server"
import VodUploadClient from "vod-node-sdk"

export async function POST(request: NextRequest) {
  // 初始化VOD客户端
  const client = new VodUploadClient(
    process.env.TENCENT_SECRET_ID!,
    process.env.TENCENT_SECRET_KEY!
  )
  
  // 处理视频上传逻辑
  // ...
}
```

## 5. 视频播放器集成

使用腾讯云播放器SDK：

```typescript
// 安装播放器
npm install tcplayer

// 在页面中使用
import TCPlayer from 'tcplayer'

const player = new TCPlayer('player-container', {
  fileID: 'xxxxx',
  appID: 'xxxxx',
  // 防盗链配置
  psign: 'xxxxx'
})
```

## 6. 防盗链配置

1. 在VOD控制台配置域名防盗链
2. 设置Referer防盗链白名单
3. 启用Key防盗链

## 7. 视频加密

1. 使用HLS加密方案
2. 配置DRM保护（可选）
3. 设置播放密钥

## 8. 成本优化建议

- 使用转码模板，避免重复转码
- 设置合理的存储策略
- 监控流量使用情况
- 使用CDN加速