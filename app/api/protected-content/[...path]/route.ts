// 受保护内容访问API
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getProtectedContentUrl, checkCourseAccess } from '@/lib/content-protection';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 解析路径：/api/protected-content/courseId/contentKey
    const [courseId, ...contentPathParts] = params.path;
    const contentKey = contentPathParts.join('/');

    if (!courseId || !contentKey) {
      return NextResponse.json({ error: '无效的请求路径' }, { status: 400 });
    }

    // 检查用户权限
    const hasAccess = await checkCourseAccess(session.user.id, courseId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: '您没有权限访问此内容，请先购买课程' }, 
        { status: 403 }
      );
    }

    // 生成临时访问URL并重定向
    const tempUrl = await getProtectedContentUrl(
      `courses/${courseId}/${contentKey}`,
      session.user.id,
      courseId
    );

    if (!tempUrl) {
      return NextResponse.json({ error: '获取内容失败' }, { status: 500 });
    }

    // 重定向到临时URL
    return NextResponse.redirect(tempUrl);
    
  } catch (error) {
    console.error('Protected content error:', error);
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    );
  }
}