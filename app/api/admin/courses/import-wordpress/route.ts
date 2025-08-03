import { NextRequest, NextResponse } from 'next/server';
import COS from 'cos-nodejs-sdk-v5';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const cos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权限' }, { status: 403 });
    }

    const { wordpressSlug, lessonId, sectionId } = await request.json();

    if (!wordpressSlug || !lessonId || !sectionId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    console.log('开始导入WordPress内容:', wordpressSlug);

    // 1. 从WordPress获取内容
    // 先尝试从文章中获取
    let wpResponse = await fetch(
      `http://111.231.19.162/index.php?rest_route=/wp/v2/posts&slug=${wordpressSlug}`
    );
    let wpData = await wpResponse.json();

    // 如果文章中没有，尝试从页面获取
    if (!wpData || wpData.length === 0) {
      wpResponse = await fetch(
        `http://111.231.19.162/index.php?rest_route=/wp/v2/pages&slug=${wordpressSlug}`
      );
      wpData = await wpResponse.json();
    }

    if (!wpData || wpData.length === 0) {
      return NextResponse.json({ error: '未找到WordPress内容' }, { status: 404 });
    }

    const post = wpData[0];
    const content = post.content.rendered;
    const title = post.title.rendered;

    // 2. 处理内容中的图片
    const imageRegex = /<img[^>]+src="([^">]+)"/g;
    let processedContent = content;
    const imagePromises = [];
    let match;

    while ((match = imageRegex.exec(content)) !== null) {
      const imageUrl = match[1];
      imagePromises.push(processImageUrl(imageUrl, sectionId, lessonId));
    }

    // 等待所有图片处理完成
    const imageResults = await Promise.all(imagePromises);

    // 替换内容中的图片URL
    imageResults.forEach(({ originalUrl, newUrl }) => {
      if (newUrl) {
        processedContent = processedContent.replace(
          new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          newUrl
        );
      }
    });

    // 3. 创建完整的HTML内容
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 20px auto;
    }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    code {
      background: #f4f4f4;
      padding: 2px 5px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${processedContent}
</body>
</html>`;

    // 4. 上传到COS
    const key = `courses/${sectionId}/${lessonId}/content/main.html`;
    
    await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.COS_PRIVATE_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: key,
        Body: Buffer.from(fullHtml, 'utf-8'),
        ContentType: 'text/html; charset=utf-8',
        ACL: 'private',
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    return NextResponse.json({
      success: true,
      contentKey: key,
      title: title,
      message: 'WordPress内容导入成功'
    });

  } catch (error: any) {
    console.error('WordPress导入错误:', error);
    return NextResponse.json({ 
      error: error.message || '导入失败' 
    }, { status: 500 });
  }
}

// 处理单个图片URL
async function processImageUrl(
  imageUrl: string, 
  sectionId: string, 
  lessonId: string
): Promise<{ originalUrl: string; newUrl: string | null }> {
  try {
    // 如果是相对路径，补全为绝对路径
    if (!imageUrl.startsWith('http')) {
      imageUrl = `http://111.231.19.162${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    // 下载图片
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error('图片下载失败:', imageUrl);
      return { originalUrl: imageUrl, newUrl: null };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const fileName = imageUrl.split('/').pop() || 'image.jpg';
    const key = `courses/${sectionId}/${lessonId}/images/${Date.now()}-${fileName}`;

    // 上传到COS
    await new Promise((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.COS_PRIVATE_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: key,
        Body: buffer,
        ACL: 'private',
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // 返回新的URL（通过我们的API访问）
    return {
      originalUrl: imageUrl,
      newUrl: `/api/protected-content/${sectionId}/${lessonId}/images/${fileName}`
    };
  } catch (error) {
    console.error('处理图片失败:', imageUrl, error);
    return { originalUrl: imageUrl, newUrl: null };
  }
}