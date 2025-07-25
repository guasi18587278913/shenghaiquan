const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// 课程章节结构
const courseStructure = {
  title: "深海圈AI产品出海实战课程",
  description: "从零到一，使用AI编程打造你的产品，实现商业变现的全流程教学",
  category: "START_HERE",
  level: "BEGINNER",
  chapters: [
    // 基础篇
    {
      section: "基础篇",
      title: "玩起来！通过AI，10分钟发布你的第一款网站产品",
      order: 1,
      duration: 600, // 10分钟
      topics: [
        "课前准备",
        "准备产品idea",
        "构思完整的Prompt",
        "使用Bolt.new实现"
      ]
    },
    {
      section: "基础篇",
      title: "深入Cursor：打造你的AI编程利器",
      order: 2,
      duration: 1800, // 30分钟
      topics: [
        "Cursor基础设置",
        "AI编程核心技巧",
        "实战项目练习"
      ]
    },
    {
      section: "基础篇",
      title: "发布上线：让全世界看到你的产品",
      order: 3,
      duration: 1200, // 20分钟
      topics: [
        "部署到Vercel",
        "自定义域名",
        "性能优化"
      ]
    },
    // 认知篇
    {
      section: "认知篇",
      title: "海外软件生意的商业模式",
      order: 4,
      duration: 3600, // 60分钟
      topics: [
        "什么是Micro SaaS",
        "选择目标市场",
        "定价策略"
      ]
    },
    {
      section: "认知篇",
      title: "AI时代的产品思维",
      order: 5,
      duration: 2400, // 40分钟
      topics: [
        "AI产品的特点",
        "用户需求分析",
        "竞品研究方法"
      ]
    },
    // 内功篇
    {
      section: "内功篇",
      title: "前端技术栈深度解析",
      order: 6,
      duration: 7200, // 120分钟
      topics: [
        "NextJS核心概念",
        "TypeScript最佳实践",
        "TailwindCSS设计系统"
      ]
    },
    {
      section: "内功篇",
      title: "后端与数据库设计",
      order: 7,
      duration: 5400, // 90分钟
      topics: [
        "API设计原则",
        "数据库架构",
        "性能优化策略"
      ]
    },
    // 进阶篇
    {
      section: "进阶篇",
      title: "从MVP到完整产品",
      order: 8,
      duration: 4800, // 80分钟
      topics: [
        "用户体系搭建",
        "支付系统集成",
        "数据分析与监控"
      ]
    },
    {
      section: "进阶篇",
      title: "增长与变现策略",
      order: 9,
      duration: 3600, // 60分钟
      topics: [
        "SEO优化技巧",
        "内容营销",
        "社交媒体推广",
        "付费广告投放"
      ]
    },
    {
      section: "进阶篇",
      title: "规模化与自动化",
      order: 10,
      duration: 3000, // 50分钟
      topics: [
        "自动化运营",
        "团队协作",
        "产品矩阵策略"
      ]
    }
  ]
}

async function importCourse() {
  console.log('🚀 开始导入深海圈课程...')
  
  try {
    // 检查是否已存在同名课程
    const existingCourse = await prisma.course.findFirst({
      where: { title: courseStructure.title }
    })
    
    if (existingCourse) {
      console.log('⚠️  课程已存在，正在更新...')
      // 删除旧的章节
      await prisma.chapter.deleteMany({
        where: { courseId: existingCourse.id }
      })
      
      // 更新课程信息
      const course = await prisma.course.update({
        where: { id: existingCourse.id },
        data: {
          description: courseStructure.description,
          category: courseStructure.category,
          level: courseStructure.level,
          isPublished: true
        }
      })
      
      await createChapters(course.id)
    } else {
      // 创建新课程
      const course = await prisma.course.create({
        data: {
          title: courseStructure.title,
          description: courseStructure.description,
          category: courseStructure.category,
          level: courseStructure.level,
          isPaid: true,
          price: 399,
          isPublished: true,
          order: 1
        }
      })
      
      console.log('✅ 课程创建成功')
      await createChapters(course.id)
    }
    
    console.log('🎉 深海圈课程导入完成！')
    
  } catch (error) {
    console.error('❌ 导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function createChapters(courseId) {
  console.log('📚 正在创建章节...')
  
  for (const chapter of courseStructure.chapters) {
    // 生成章节内容（这里使用示例内容，实际应该从文档中提取）
    const content = generateChapterContent(chapter)
    
    await prisma.chapter.create({
      data: {
        courseId,
        title: `【${chapter.section}】${chapter.title}`,
        description: `本章节包含：${chapter.topics.join('、')}`,
        content,
        order: chapter.order,
        duration: chapter.duration,
        isLocked: chapter.order !== 1, // 第一章解锁，其他章节锁定
        unlockType: 'SEQUENTIAL',
        videoUrl: null // 暂时没有视频
      }
    })
    
    console.log(`  ✅ 章节 ${chapter.order}: ${chapter.title}`)
  }
}

function generateChapterContent(chapter) {
  // 生成Markdown格式的章节内容
  return `# ${chapter.title}

## 学习目标

本章节将带你学习${chapter.section}的核心内容，预计学习时长：${Math.floor(chapter.duration / 60)}分钟。

## 本章要点

${chapter.topics.map((topic, index) => `${index + 1}. ${topic}`).join('\n')}

## 详细内容

### ${chapter.topics[0]}

在开始之前，我们需要做好以下准备工作...

[此处应包含实际的课程内容，需要从原始文档中提取]

### ${chapter.topics[1]}

接下来，让我们深入了解...

[此处应包含实际的课程内容，需要从原始文档中提取]

## 本章小结

通过本章的学习，你应该已经掌握了：
${chapter.topics.map(topic => `- ${topic}`).join('\n')}

## 课后作业

1. 按照本章内容，完成一个实战项目
2. 在群里分享你的学习心得
3. 准备进入下一章的学习

## 常见问题

**Q: 遇到问题怎么办？**
A: 可以在课程群里提问，或者查看课程文档中的FAQ部分。

**Q: 需要准备什么工具？**
A: 请参考课前准备部分，确保所有工具都已安装配置好。
`
}

// 运行导入
importCourse()