// 课程内容保护工具
import COS from 'cos-nodejs-sdk-v5';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 初始化私有COS
const privateCos = new COS({
  SecretId: process.env.COS_SECRET_ID!,
  SecretKey: process.env.COS_SECRET_KEY!,
});

// 检查用户是否有权限访问课程
export async function checkCourseAccess(userId: string, courseId: string): Promise<boolean> {
  // 检查是否购买/注册了课程
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      status: 'ACTIVE'
    }
  });
  
  return !!enrollment;
}

// 上传私有内容
export async function uploadPrivateContent(
  file: Buffer,
  fileName: string,
  courseId: string
): Promise<string> {
  const key = `courses/${courseId}/${Date.now()}-${fileName}`;
  
  await privateCos.putObject({
    Bucket: process.env.COS_PRIVATE_BUCKET!,
    Region: process.env.COS_REGION!,
    Key: key,
    Body: file,
    ACL: 'private', // 私有权限，重要！
  });
  
  return key; // 返回存储路径，不是URL
}

// 获取临时访问URL（30分钟有效）
export async function getProtectedContentUrl(
  contentKey: string,
  userId: string,
  courseId: string
): Promise<string | null> {
  // 验证权限
  const hasAccess = await checkCourseAccess(userId, courseId);
  if (!hasAccess) {
    return null;
  }
  
  // 生成临时URL
  const tempUrl = privateCos.getObjectUrl({
    Bucket: process.env.COS_PRIVATE_BUCKET!,
    Region: process.env.COS_REGION!,
    Key: contentKey,
    Sign: true,
    Expires: 1800, // 30分钟
  });
  
  return tempUrl;
}

// 流式传输保护内容（更安全）
export async function streamProtectedContent(
  contentKey: string,
  userId: string,
  courseId: string
): Promise<NodeJS.ReadableStream | null> {
  const hasAccess = await checkCourseAccess(userId, courseId);
  if (!hasAccess) {
    return null;
  }
  
  const stream = privateCos.getObjectStream({
    Bucket: process.env.COS_PRIVATE_BUCKET!,
    Region: process.env.COS_REGION!,
    Key: contentKey,
  });
  
  return stream;
}