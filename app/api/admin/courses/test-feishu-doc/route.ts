import { NextRequest, NextResponse } from 'next/server';
import { FeishuAPI, extractDocumentId } from '@/lib/feishu-api';

export async function POST(request: NextRequest) {
  try {
    const { documentUrl } = await request.json();
    
    const documentId = extractDocumentId(documentUrl);
    if (!documentId) {
      return NextResponse.json({
        success: false,
        error: '无效的文档URL'
      });
    }

    const appId = process.env.FEISHU_APP_ID;
    const appSecret = process.env.FEISHU_APP_SECRET;

    if (!appId || !appSecret) {
      return NextResponse.json({
        success: false,
        error: '环境变量未配置'
      });
    }

    const feishuAPI = new FeishuAPI({ appId, appSecret });
    
    try {
      // 尝试获取文档块
      const blocks = await feishuAPI.getDocumentBlocks(documentId);
      
      // 统计图片数量
      const imageBlocks = blocks.items?.filter((block: any) => block.block_type === 17) || [];
      
      return NextResponse.json({
        success: true,
        blockCount: blocks.items?.length || 0,
        hasImages: imageBlocks.length > 0,
        imageCount: imageBlocks.length,
        documentId,
      });
    } catch (apiError: any) {
      // 提供更详细的错误信息
      let errorMessage = '访问文档失败';
      let errorDetail = '';
      
      if (apiError.response?.data) {
        const { code, msg } = apiError.response.data;
        errorMessage = msg || errorMessage;
        errorDetail = `错误代码: ${code}`;
        
        // 根据错误代码提供解决建议
        switch (code) {
          case 99991663:
            errorDetail += ' - 文档不存在或无权限访问。请确保文档对应用可见。';
            break;
          case 99991661:
            errorDetail += ' - 应用权限不足。请检查是否添加了文档读取权限。';
            break;
          case 99991400:
            errorDetail += ' - 请求参数错误。';
            break;
          default:
            errorDetail += ` - ${msg}`;
        }
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        errorDetail,
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '测试失败',
    });
  }
}