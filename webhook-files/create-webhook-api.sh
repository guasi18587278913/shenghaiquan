#!/bin/bash

# 创建API目录（如果不存在）
mkdir -p /www/wwwroot/deepsea/app/api/webhook

# 创建route.ts文件
cat > /www/wwwroot/deepsea/app/api/webhook/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import crypto from 'crypto'

const execAsync = promisify(exec)
const WEBHOOK_SECRET = 'deepsea-deploy-2025'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    
    if (signature) {
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(payload)
        .digest('hex')
      
      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    const data = JSON.parse(payload)
    
    if (data.ref !== 'refs/heads/main') {
      return NextResponse.json({ message: 'Not a main branch push' })
    }
    
    const { stdout, stderr } = await execAsync('/www/wwwroot/deepsea/deploy-webhook.sh')
    
    return NextResponse.json({ 
      message: 'Deployment triggered',
      output: stdout
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Deployment failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is working' })
}
EOF

# 重启应用
pm2 restart deepsea

echo "Webhook API创建完成！"
echo "请访问测试: http://111.231.19.162:3000/api/webhook"