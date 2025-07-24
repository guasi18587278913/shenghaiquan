const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')

/**
 * 课程导入脚本
 * 
 * 使用方法：
 * 1. 准备课程数据文件（JSON格式）
 * 2. 运行: node scripts/import-courses.js <课程数据文件>
 * 
 * 数据格式示例：
 * {
 *   "title": "课程标题",
 *   "description": "课程描述",
 *   "category": "BASIC",
 *   "level": "BEGINNER",
 *   "chapters": [
 *     {
 *       "title": "章节标题",
 *       "content": "Markdown格式的文字内容",
 *       "videoUrl": "视频URL或视频ID",
 *       "duration": 1200
 *     }
 *   ]
 * }
 */

// 视频URL处理函数
function processVideoUrl(url) {
  if (!url) return null
  
  // 如果是相对路径，转换为完整URL
  if (url.startsWith('/')) {
    // 这里可以配置您的视频服务器地址
    return `https://your-video-server.com${url}`
  }
  
  // 如果是B站视频ID
  if (url.match(/^BV[\w]+$/)) {
    return `bilibili:${url}`
  }
  
  // 如果是YouTube ID
  if (url.match(/^[\w-]{11}$/)) {
    return `youtube:${url}`
  }
  
  return url
}

// 导入单个课程
async function importCourse(courseData) {
  console.log(`\n📚 导入课程: ${courseData.title}`)
  
  try {
    // 创建课程
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        description: courseData.description || '',
        category: courseData.category || 'BASIC',
        level: courseData.level || 'BEGINNER',
        cover: courseData.cover || null,
        isPaid: courseData.isPaid || false,
        price: courseData.price || 0,
        isPublished: false, // 默认不发布，需要手动发布
        order: courseData.order || 0
      }
    })
    
    console.log(`✅ 课程创建成功: ${course.id}`)
    
    // 导入章节
    if (courseData.chapters && courseData.chapters.length > 0) {
      console.log(`📖 开始导入 ${courseData.chapters.length} 个章节...`)
      
      for (let i = 0; i < courseData.chapters.length; i++) {
        const chapterData = courseData.chapters[i]
        
        try {
          const chapter = await prisma.chapter.create({
            data: {
              courseId: course.id,
              title: chapterData.title,
              description: chapterData.description || '',
              content: chapterData.content || '',
              videoUrl: processVideoUrl(chapterData.videoUrl),
              duration: chapterData.duration || null,
              order: chapterData.order || i,
              isLocked: chapterData.isLocked !== false // 默认锁定
            }
          })
          
          console.log(`   ✅ 章节 ${i + 1}: ${chapter.title}`)
        } catch (error) {
          console.error(`   ❌ 章节导入失败: ${chapterData.title}`)
          console.error(`      ${error.message}`)
        }
      }
    }
    
    return course
    
  } catch (error) {
    console.error(`❌ 课程导入失败: ${error.message}`)
    throw error
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('使用方法: node import-courses.js <课程数据文件>')
    console.log('\n示例:')
    console.log('  node import-courses.js data/courses/ai-course.json')
    console.log('  node import-courses.js data/courses/ (导入目录下所有JSON文件)')
    process.exit(1)
  }
  
  const inputPath = args[0]
  
  try {
    const stats = fs.statSync(inputPath)
    let filesToImport = []
    
    if (stats.isDirectory()) {
      // 如果是目录，导入所有JSON文件
      const files = fs.readdirSync(inputPath)
      filesToImport = files
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(inputPath, f))
    } else if (stats.isFile()) {
      // 如果是文件
      filesToImport = [inputPath]
    }
    
    console.log(`🎯 准备导入 ${filesToImport.length} 个课程文件\n`)
    
    let successCount = 0
    let failCount = 0
    
    for (const file of filesToImport) {
      console.log(`📄 处理文件: ${path.basename(file)}`)
      
      try {
        const content = fs.readFileSync(file, 'utf-8')
        const courseData = JSON.parse(content)
        
        // 支持批量导入（数组）或单个导入
        const courses = Array.isArray(courseData) ? courseData : [courseData]
        
        for (const course of courses) {
          try {
            await importCourse(course)
            successCount++
          } catch (error) {
            failCount++
          }
        }
        
      } catch (error) {
        console.error(`❌ 文件处理失败: ${error.message}`)
        failCount++
      }
    }
    
    // 打印总结
    console.log('\n' + '='.repeat(60))
    console.log('📊 导入完成！')
    console.log('='.repeat(60))
    console.log(`✅ 成功: ${successCount} 个课程`)
    console.log(`❌ 失败: ${failCount} 个课程`)
    
    // 显示课程统计
    const totalCourses = await prisma.course.count()
    const totalChapters = await prisma.chapter.count()
    
    console.log(`\n📈 数据库统计:`)
    console.log(`   课程总数: ${totalCourses}`)
    console.log(`   章节总数: ${totalChapters}`)
    
  } catch (error) {
    console.error('❌ 导入失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 创建示例数据文件
function createSampleData() {
  const sampleCourse = {
    title: "AI产品出海入门课",
    description: "从零开始学习AI产品开发和出海策略",
    category: "START_HERE",
    level: "BEGINNER",
    chapters: [
      {
        title: "第1课：为什么要做AI产品出海",
        description: "了解AI产品出海的机遇与挑战",
        content: `# 为什么要做AI产品出海

## 课程概述

在这节课中，我们将探讨：

1. **全球AI市场机遇**
   - 市场规模与增长趋势
   - 各地区市场特点
   - 用户需求差异

2. **中国团队的优势**
   - 技术积累
   - 成本优势
   - 执行力

3. **成功案例分析**
   - 工具类产品
   - 内容类产品
   - 服务类产品

## 重点内容

### 1. 市场机遇

全球AI市场正在快速增长...

### 2. 挑战与应对

出海面临的主要挑战包括...

### 3. 行动建议

基于当前市场情况，建议...
`,
        videoUrl: "BV1xx411c7mD", // 示例B站视频ID
        duration: 1200 // 20分钟
      },
      {
        title: "第2课：选择目标市场",
        description: "如何选择适合的海外市场",
        content: "# 选择目标市场\n\n内容待补充...",
        videoUrl: null,
        duration: 1500
      }
    ]
  }
  
  const samplePath = 'data/courses/sample-course.json'
  
  // 确保目录存在
  const dir = path.dirname(samplePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  
  fs.writeFileSync(
    samplePath,
    JSON.stringify(sampleCourse, null, 2),
    'utf-8'
  )
  
  console.log(`✅ 已创建示例文件: ${samplePath}`)
  console.log('您可以参考此格式准备课程数据')
}

// 如果带 --sample 参数，创建示例文件
if (process.argv.includes('--sample')) {
  createSampleData()
} else {
  main()
}