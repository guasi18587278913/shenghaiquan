const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function safeCleanupWithCascade() {
  console.log('🧹 安全清理额外用户（包括关联数据）\n')
  
  try {
    // 读取要删除的用户列表
    const analysis = JSON.parse(fs.readFileSync('extra-users-analysis.json', 'utf-8'))
    const extraUserIds = [
      ...analysis.extra_users.users.map(u => u.id),
      ...analysis.seed_users.users.map(u => u.id)
    ]
    
    console.log(`📋 准备清理 ${extraUserIds.length} 个用户及其关联数据`)
    
    // 1. 先删除关联数据
    console.log('\n🔗 步骤1: 清理关联数据...')
    
    // 删除这些用户的帖子
    const deletedPosts = await prisma.post.deleteMany({
      where: { userId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除帖子: ${deletedPosts.count}个`)
    
    // 删除这些用户的评论
    const deletedComments = await prisma.comment.deleteMany({
      where: { userId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除评论: ${deletedComments.count}个`)
    
    // 删除这些用户的点赞
    const deletedLikes = await prisma.like.deleteMany({
      where: { userId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除点赞: ${deletedLikes.count}个`)
    
    // 删除收藏
    const deletedBookmarks = await prisma.bookmark.deleteMany({
      where: { userId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除收藏: ${deletedBookmarks.count}个`)
    
    // 删除关注关系（作为关注者）
    const deletedFollowing = await prisma.follow.deleteMany({
      where: { followerId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除关注关系(作为关注者): ${deletedFollowing.count}个`)
    
    // 删除关注关系（作为被关注者）
    const deletedFollowers = await prisma.follow.deleteMany({
      where: { followingId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除关注关系(作为被关注者): ${deletedFollowers.count}个`)
    
    // 删除通知
    const deletedNotifications = await prisma.notification.deleteMany({
      where: { userId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除通知: ${deletedNotifications.count}个`)
    
    // 删除课程报名
    const deletedEnrollments = await prisma.enrollment.deleteMany({
      where: { userId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除课程报名: ${deletedEnrollments.count}个`)
    
    // 删除学习进度
    const deletedProgress = await prisma.progress.deleteMany({
      where: { userId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除学习进度: ${deletedProgress.count}个`)
    
    // 删除消息（发送者）
    const deletedMessagesSent = await prisma.message.deleteMany({
      where: { senderId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除发送的消息: ${deletedMessagesSent.count}个`)
    
    // 删除消息（接收者）
    const deletedMessagesReceived = await prisma.message.deleteMany({
      where: { receiverId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除接收的消息: ${deletedMessagesReceived.count}个`)
    
    // 删除活动参与
    const deletedEventParticipants = await prisma.eventParticipant.deleteMany({
      where: { userId: { in: extraUserIds } }
    })
    console.log(`   ✅ 删除活动参与: ${deletedEventParticipants.count}个`)
    
    // 2. 现在删除用户
    console.log('\n👤 步骤2: 删除用户...')
    let deletedUsers = 0
    const errors = []
    
    for (const userId of extraUserIds) {
      try {
        const user = await prisma.user.delete({
          where: { id: userId }
        })
        console.log(`   ✅ 删除用户: ${user.name}`)
        deletedUsers++
      } catch (error) {
        const user = analysis.extra_users.users.find(u => u.id === userId) || 
                    analysis.seed_users.users.find(u => u.id === userId)
        errors.push({ 
          userName: user?.name || userId, 
          error: error.message 
        })
      }
    }
    
    // 3. 验证最终结果
    console.log('\n📊 步骤3: 验证最终数据...')
    const finalCount = await prisma.user.count()
    const csvCount = 904
    
    // 获取城市分布
    const cityStats = await prisma.user.groupBy({
      by: ['location'],
      _count: { location: true },
      orderBy: { _count: { location: 'desc' } },
      take: 10
    })
    
    // 生成报告
    const cleanupReport = {
      timestamp: new Date().toISOString(),
      action: 'cascade_cleanup',
      targetUsers: extraUserIds.length,
      deletedData: {
        posts: deletedPosts.count,
        comments: deletedComments.count,
        likes: deletedLikes.count,
        bookmarks: deletedBookmarks.count,
        following: deletedFollowing.count,
        followers: deletedFollowers.count,
        notifications: deletedNotifications.count,
        enrollments: deletedEnrollments.count,
        progress: deletedProgress.count,
        messagesSent: deletedMessagesSent.count,
        messagesReceived: deletedMessagesReceived.count,
        eventParticipants: deletedEventParticipants.count,
        users: deletedUsers
      },
      finalStats: {
        csvUsers: csvCount,
        dbUsers: finalCount,
        difference: finalCount - csvCount,
        accuracy: ((csvCount / finalCount) * 100).toFixed(2) + '%'
      },
      cityDistribution: cityStats.map(s => ({
        city: s.location,
        count: s._count.location,
        percentage: ((s._count.location / finalCount) * 100).toFixed(1) + '%'
      })),
      errors: errors,
      status: finalCount === csvCount ? 'PERFECT_100%' : 'HAS_DIFFERENCE'
    }
    
    // 保存报告
    fs.writeFileSync(
      'cascade-cleanup-report.json',
      JSON.stringify(cleanupReport, null, 2),
      'utf-8'
    )
    
    // 打印结果
    console.log('\n' + '='.repeat(60))
    console.log('✨ 清理完成！')
    console.log('='.repeat(60))
    
    console.log('\n📈 清理统计:')
    console.log(`   目标用户: ${extraUserIds.length}个`)
    console.log(`   删除用户: ${deletedUsers}个`)
    console.log(`   删除帖子: ${deletedPosts.count}个`)
    console.log(`   删除评论: ${deletedComments.count}个`)
    console.log(`   删除其他数据: ${deletedLikes.count + deletedBookmarks.count + deletedFollowing.count + deletedFollowers.count}个`)
    
    console.log('\n📊 最终数据:')
    console.log(`   CSV用户: ${csvCount}`)
    console.log(`   数据库用户: ${finalCount}`)
    console.log(`   差异: ${finalCount - csvCount}`)
    console.log(`   准确率: ${cleanupReport.finalStats.accuracy}`)
    
    if (finalCount === csvCount) {
      console.log('\n🎉 完美！已实现100%数据准确性！')
      console.log('   ✅ CSV与数据库完全匹配')
      console.log('   ✅ 所有额外数据已清理')
      console.log('   ✅ 系统数据完全准确')
    } else if (finalCount > csvCount) {
      console.log(`\n⚠️  仍有 ${finalCount - csvCount} 个差异`)
      if (errors.length > 0) {
        console.log('\n   删除失败的用户:')
        errors.forEach(e => {
          console.log(`   - ${e.userName}: ${e.error}`)
        })
      }
    }
    
    console.log('\n🏙️  城市分布:')
    cityStats.slice(0, 5).forEach(({ location, _count }) => {
      const percentage = ((_count.location / finalCount) * 100).toFixed(1)
      console.log(`   ${location}: ${_count.location}人 (${percentage}%)`)
    })
    
    console.log('\n📄 详细报告: cascade-cleanup-report.json')
    
  } catch (error) {
    console.error('❌ 清理失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行安全清理
safeCleanupWithCascade()