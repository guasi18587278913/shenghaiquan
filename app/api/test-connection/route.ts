import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? '已配置' : '未配置',
  };

  // 测试数据库连接
  try {
    const userCount = await prisma.user.count();
    results.database = {
      status: '连接成功',
      userCount,
    };
  } catch (error) {
    results.database = {
      status: '连接失败',
      error: error instanceof Error ? error.message : '未知错误',
    };
  }

  // 测试WordPress API
  try {
    const response = await fetch('http://111.231.19.162/index.php?rest_route=/wp/v2/posts&per_page=1');
    const data = await response.json();
    results.wordpress = {
      status: response.ok ? '连接成功' : '连接失败',
      statusCode: response.status,
      hasData: Array.isArray(data) && data.length > 0,
    };
  } catch (error) {
    results.wordpress = {
      status: '连接失败',
      error: error instanceof Error ? error.message : '未知错误',
    };
  }

  // 检查静态课程数据
  try {
    const { courseSections } = await import('@/lib/course-data');
    results.courseData = {
      status: '加载成功',
      sections: Object.keys(courseSections),
      sectionCount: Object.keys(courseSections).length,
    };
  } catch (error) {
    results.courseData = {
      status: '加载失败',
      error: error instanceof Error ? error.message : '未知错误',
    };
  }

  return NextResponse.json(results, { status: 200 });
}