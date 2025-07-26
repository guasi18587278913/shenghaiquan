import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import crypto from 'crypto'

const execAsync = promisify(exec)
const WEBHOOK_SECRET = 'deepsea-deploy-2025'

export async function POST(request: NextRequest) {
  try {
    // 获取请求体
    const payload = await request.text()
    
    // 验证GitHub签名
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
    
    // 解析JSON
    const data = JSON.parse(payload)
    
    // 只处理push到main分支的事件
    if (data.ref !== 'refs/heads/main') {
      return NextResponse.json({ message: 'Not a main branch push' })
    }
    
    // 执行部署脚本
    const { stdout, stderr } = await execAsync('/www/wwwroot/deepsea/deploy-webhook.sh')
    
    console.log('Deployment output:', stdout)
    if (stderr) console.error('Deployment error:', stderr)
    
    return NextResponse.json({ 
      message: 'Deployment triggered',
      output: stdout
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Deployment failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is working' })
}