const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCourseData() {
  try {
    // 查找课程
    const course = await prisma.course.findFirst({
      where: { title: '深海圈AI产品出海实战课程' }
    })
    
    if (!course) {
      console.log('❌ 未找到课程')
      return
    }
    
    // 获取所有章节
    const chapters = await prisma.chapter.findMany({
      where: { courseId: course.id },
      orderBy: { order: 'asc' }
    })
    
    console.log('📚 数据库中的课程信息：')
    console.log('================================')
    console.log(`课程名称: ${course.title}`)
    console.log(`课程描述: ${course.description}`)
    console.log(`章节总数: ${chapters.length}`)
    console.log(`存储位置: SQLite数据库 (prisma/deep-sea-circle.db)`)
    
    console.log('\n📖 章节列表：')
    console.log('--------------------------------')
    
    let totalChars = 0
    chapters.forEach(chapter => {
      console.log(`${chapter.order}. ${chapter.title}`)
      console.log(`   - 内容长度: ${chapter.content.length} 字符`)
      console.log(`   - 预计阅读: ${Math.ceil(chapter.duration / 60)} 分钟`)
      console.log(`   - 锁定状态: ${chapter.isLocked ? '🔒 锁定' : '🔓 解锁'}`)
      totalChars += chapter.content.length
    })
    
    console.log('\n📊 统计信息：')
    console.log('--------------------------------')
    console.log(`总字符数: ${totalChars.toLocaleString()} 字符`)
    console.log(`平均每章: ${Math.round(totalChars / chapters.length).toLocaleString()} 字符`)
    
    // 检查数据库文件大小
    const fs = require('fs')
    const dbPath = './prisma/deep-sea-circle.db'
    const stats = fs.statSync(dbPath)
    const dbSizeMB = (stats.size / 1024 / 1024).toFixed(2)
    console.log(`数据库大小: ${dbSizeMB} MB`)
    
  } catch (error) {
    console.error('❌ 错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCourseData()