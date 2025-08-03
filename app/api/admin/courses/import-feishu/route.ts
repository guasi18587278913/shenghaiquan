import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { FeishuAPI, extractDocumentId } from '@/lib/feishu-api';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

// 初始化飞书API（这里需要配置你的App ID和Secret）
const feishuAPI = new FeishuAPI({
  appId: process.env.FEISHU_APP_ID || '',
  appSecret: process.env.FEISHU_APP_SECRET || '',
});

export async function POST(request: NextRequest) {
  try {
    // 检查用户权限
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { documentUrl } = await request.json();

    // 从URL提取文档ID
    const documentId = extractDocumentId(documentUrl);
    if (!documentId) {
      return NextResponse.json({ error: '无效的飞书文档URL' }, { status: 400 });
    }

    // 获取文档内容
    const blocks = await feishuAPI.getDocumentBlocks(documentId);
    
    // 解析为Markdown
    const { content, images } = feishuAPI.parseBlocksToMarkdown(blocks.items || []);

    // 处理图片上传
    const processedContent = await processImagesInContent(content, images);

    return NextResponse.json({
      success: true,
      content: processedContent,
      documentId,
    });
  } catch (error) {
    console.error('导入飞书文档失败:', error);
    return NextResponse.json(
      { error: '导入失败: ' + (error instanceof Error ? error.message : '未知错误') },
      { status: 500 }
    );
  }
}

// 处理内容中的图片
async function processImagesInContent(content: string, imageTokens: string[]): Promise<string> {
  let processedContent = content;

  for (let i = 0; i < imageTokens.length; i++) {
    const token = imageTokens[i];
    const placeholder = `image_${i}`;

    try {
      // 下载图片
      const imageBuffer = await feishuAPI.downloadImage(token);
      
      // 生成文件名
      const fileName = `feishu_${crypto.randomBytes(8).toString('hex')}.jpg`;
      
      // 这里应该上传到腾讯云COS，暂时先保存到本地
      const uploadPath = join(process.cwd(), 'public', 'uploads', fileName);
      await writeFile(uploadPath, imageBuffer);
      
      const imageUrl = `/uploads/${fileName}`;
      
      // 替换占位符
      processedContent = processedContent.replace(
        `![图片](${placeholder})`,
        `![图片](${imageUrl})`
      );
    } catch (error) {
      console.error(`处理图片 ${token} 失败:`, error);
      // 如果图片处理失败，保留占位符
    }
  }

  return processedContent;
}