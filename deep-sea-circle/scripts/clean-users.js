const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanUsers() {
  console.log('🧹 开始清理用户数据...')
  
  try {
    // 获取管理员用户
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true }
    })
    
    console.log(`\n📊 找到 ${admins.length} 个管理员用户：`)
    admins.forEach(admin => console.log(`   - ${admin.name}`))
    
    // 获取要删除的普通用户
    const usersToDelete = await prisma.user.findMany({
      where: { 
        role: { in: ['USER', 'ASSISTANT', 'TEACHER'] }
      },
      select: { id: true }
    })
    
    const userIds = usersToDelete.map(u => u.id)
    console.log(`\n🗑️  准备删除 ${userIds.length} 个非管理员用户...`)
    
    // 使用事务删除所有相关数据
    await prisma.$transaction(async (tx) => {
      // 删除所有关联数据
      console.log('   删除书签...')
      await tx.bookmark.deleteMany({ where: { userId: { in: userIds } } })
      
      console.log('   删除点赞...')
      await tx.like.deleteMany({ where: { userId: { in: userIds } } })
      
      console.log('   删除评论...')
      await tx.comment.deleteMany({ where: { userId: { in: userIds } } })
      
      console.log('   删除帖子...')
      await tx.post.deleteMany({ where: { userId: { in: userIds } } })
      
      console.log('   删除活动参与记录...')
      await tx.eventParticipant.deleteMany({ where: { userId: { in: userIds } } })
      
      console.log('   删除课程报名记录...')
      await tx.enrollment.deleteMany({ where: { userId: { in: userIds } } })
      
      console.log('   删除学习进度...')
      await tx.progress.deleteMany({ where: { userId: { in: userIds } } })
      
      console.log('   删除消息...')
      await tx.message.deleteMany({ 
        where: { 
          OR: [
            { senderId: { in: userIds } },
            { receiverId: { in: userIds } }
          ]
        } 
      })
      
      console.log('   删除通知...')
      await tx.notification.deleteMany({ where: { userId: { in: userIds } } })
      
      console.log('   删除关注关系...')
      await tx.follow.deleteMany({ 
        where: { 
          OR: [
            { followerId: { in: userIds } },
            { followingId: { in: userIds } }
          ]
        } 
      })
      
      console.log('   删除用户...')
      await tx.user.deleteMany({ where: { id: { in: userIds } } })
    })
    
    // 显示最终结果
    const finalCount = await prisma.user.count()
    console.log('\n✅ 清理完成！')
    console.log(`📊 当前数据库中剩余 ${finalCount} 个用户（应该只有管理员）`)
    
  } catch (error) {
    console.error('❌ 清理失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanUsers()