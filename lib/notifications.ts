import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

// 发送通知的辅助函数
export async function sendNotification({
  userId,
  type,
  title,
  content,
  link
}: {
  userId: string
  type: NotificationType
  title: string
  content: string
  link?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        link
      }
    })
    
    return notification
  } catch (error) {
    console.error('发送通知失败:', error)
    throw error
  }
}

// 发送评论通知
export async function sendCommentNotification(
  postAuthorId: string,
  commenterName: string,
  postTitle: string,
  postId: string
) {
  return sendNotification({
    userId: postAuthorId,
    type: 'COMMENT',
    title: '收到新评论',
    content: `${commenterName} 评论了你的帖子「${postTitle}」`,
    link: `/feed/${postId}`
  })
}

// 发送关注通知
export async function sendFollowNotification(
  followedUserId: string,
  followerName: string,
  followerId: string
) {
  return sendNotification({
    userId: followedUserId,
    type: 'FOLLOW',
    title: '新的关注者',
    content: `${followerName} 关注了你`,
    link: `/profile/${followerId}`
  })
}

// 发送课程通知
export async function sendCourseNotification(
  userId: string,
  courseName: string,
  message: string,
  courseId: string
) {
  return sendNotification({
    userId,
    type: 'COURSE',
    title: '课程更新',
    content: `${courseName}: ${message}`,
    link: `/courses/${courseId}`
  })
}

// 发送系统通知
export async function sendSystemNotification(
  userId: string,
  title: string,
  content: string,
  link?: string
) {
  return sendNotification({
    userId,
    type: 'SYSTEM',
    title,
    content,
    link
  })
}

// 批量发送系统通知
export async function sendBulkSystemNotification(
  userIds: string[],
  title: string,
  content: string,
  link?: string
) {
  const notifications = userIds.map(userId => ({
    userId,
    type: 'SYSTEM' as NotificationType,
    title,
    content,
    link
  }))

  try {
    const result = await prisma.notification.createMany({
      data: notifications
    })
    
    return result
  } catch (error) {
    console.error('批量发送通知失败:', error)
    throw error
  }
}