const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAnnouncement() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.log('❌ 用法: node scripts/create-announcement.js "标题" "内容"')
    console.log('示例: node scripts/create-announcement.js "平台升级通知" "深海圈平台已完成升级..."')
    return
  }
  
  const [title, content] = args
  
  try {
    // 获取管理员账号（刘小排）
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (!admin) {
      console.error('❌ 未找到管理员账号，请先创建管理员')
      return
    }
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        type: 'ANNOUNCEMENT',
        authorId: admin.id,
        isPinned: true, // 公告默认置顶
        tags: ['公告', '官方']
      }
    })
    
    console.log('✅ 公告发布成功!')
    console.log(`   标题: ${post.title}`)
    console.log(`   发布时间: ${post.createdAt}`)
    console.log(`   ID: ${post.id}`)
    
  } catch (error) {
    console.error('❌ 发布失败:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createAnnouncement()