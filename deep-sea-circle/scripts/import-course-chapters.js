const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// 基于我们已知的课程结构，导入实际内容
const mainChapters = [
  {
    section: "基础篇",
    chapters: [
      { 
        title: "玩起来！通过AI，10分钟发布你的第一款网站产品",
        searchPatterns: ["一、玩起来", "10 分钟发布"]
      },
      { 
        title: "怎么做「AI 产品」？",
        searchPatterns: ["二、怎么做", "AI 产品"]
      },
      { 
        title: "如何使用 Cursor 打磨产品？",
        searchPatterns: ["三、如何使用 Cursor"]
      },
      { 
        title: "如何使用 GitHub 管理源代码？",
        searchPatterns: ["四、如何使用 GitHub"]
      },
      { 
        title: "如何正式发布你的网站产品？",
        searchPatterns: ["五、如何正式发布"]
      },
      { 
        title: "如何分析用户行为？",
        searchPatterns: ["六、如何分析用户行为"]
      },
      { 
        title: "如何让产品变得高端大气上档次？",
        searchPatterns: ["七、如何让产品变得"]
      },
      { 
        title: "如何借助开源软件加快开发过程？",
        searchPatterns: ["八、如何借助开源"]
      },
      { 
        title: "如何冷启动？",
        searchPatterns: ["九、如何冷启动"]
      },
      { 
        title: "如何让 AI 发挥最大的潜力？",
        searchPatterns: ["十、如何让 AI 发挥"]
      },
      { 
        title: "我们还缺哪些内容？",
        searchPatterns: ["十一、我们还缺"]
      }
    ]
  },
  {
    section: "认知篇",
    chapters: []
  },
  {
    section: "内功篇", 
    chapters: [
      { 
        title: "Cursor",
        searchPatterns: ["一、Cursor"]
      },
      { 
        title: "Terminal（终端）",
        searchPatterns: ["二、Terminal"]
      },
      { 
        title: "HTML",
        searchPatterns: ["三、HTML"]
      },
      { 
        title: "CSS",
        searchPatterns: ["四、CSS"]
      },
      { 
        title: "Javascript/TypeScript",
        searchPatterns: ["五、Javascript"]
      },
      { 
        title: "Tailwind CSS",
        searchPatterns: ["六、Tailwind CSS"]
      },
      { 
        title: "Next.JS（非常重要）",
        searchPatterns: ["七、Next.JS"]
      },
      { 
        title: "shadcn/ui",
        searchPatterns: ["八、shadcn/ui"]
      },
      { 
        title: "数据库",
        searchPatterns: ["九、数据库"]
      },
      { 
        title: "Supabase",
        searchPatterns: ["十、Supabase"]
      },
      { 
        title: "内功篇小测验",
        searchPatterns: ["十一、内功篇小测验"]
      }
    ]
  },
  {
    section: "进阶篇",
    chapters: [
      { 
        title: "如何让用户登录？",
        searchPatterns: ["一、如何让用户登录"]
      },
      { 
        title: "如何让用户订阅支付？",
        searchPatterns: ["二、如何让用户订阅支付"]
      },
      { 
        title: "如何进一步加快开发过程？",
        searchPatterns: ["三、如何进一步加快开发过程"]
      },
      { 
        title: "如何利用低代码平台",
        searchPatterns: ["四、如何利用低代码平台"]
      },
      { 
        title: "如何将应用部署到自己的服务器？",
        searchPatterns: ["五、如何将应用部署"]
      },
      { 
        title: "如何挖掘需求、获得源源不断的产品 idea",
        searchPatterns: ["六、如何挖掘需求"]
      },
      { 
        title: "如何获取健康且持续的流量？",
        searchPatterns: ["七、如何获取健康"]
      },
      { 
        title: "Idea to Business的完整流程",
        searchPatterns: ["八、Idea to Business"]
      },
      { 
        title: "产品设计流程",
        searchPatterns: ["九、产品设计流程"]
      }
    ]
  }
]

async function importCourseChapters() {
  console.log('🚀 开始导入深海圈课程章节内容...')
  
  try {
    // 读取课程文件
    const coursePath = path.join(__dirname, '../../深海圈教程')
    const content = fs.readFileSync(coursePath, 'utf-8')
    const lines = content.split('\n')
    
    // 查找或创建课程
    let course = await prisma.course.findFirst({
      where: { title: "深海圈AI产品出海实战课程" }
    })
    
    if (!course) {
      console.log('❌ 未找到课程，请先运行 import-deep-sea-course.js')
      return
    }
    
    // 删除现有章节
    await prisma.chapter.deleteMany({
      where: { courseId: course.id }
    })
    
    let globalOrder = 0
    
    // 按照预定义的章节结构提取内容
    for (const section of mainChapters) {
      console.log(`\n📚 处理${section.section}...`)
      
      for (const chapter of section.chapters) {
        globalOrder++
        
        // 查找章节内容
        const chapterContent = extractChapterContent(lines, chapter.searchPatterns)
        
        if (chapterContent) {
          // 创建章节
          await prisma.chapter.create({
            data: {
              courseId: course.id,
              title: `【${section.section}】${chapter.title}`,
              description: `${section.section}第${globalOrder}章`,
              content: chapterContent,
              order: globalOrder,
              duration: estimateDuration(chapterContent),
              isLocked: globalOrder > 1,
              unlockType: 'SEQUENTIAL',
              videoUrl: null
            }
          })
          
          console.log(`  ✅ ${chapter.title} (${chapterContent.length} 字符)`)
        } else {
          console.log(`  ⚠️  ${chapter.title} (未找到内容)`)
        }
      }
    }
    
    console.log('\n🎉 课程章节导入完成！')
    
  } catch (error) {
    console.error('❌ 导入失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 提取章节内容
function extractChapterContent(lines, searchPatterns) {
  let startIndex = -1
  let chapterTitle = ''
  
  // 查找章节开始位置
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    for (const pattern of searchPatterns) {
      if (line.includes(pattern)) {
        startIndex = i
        chapterTitle = line
        break
      }
    }
    
    if (startIndex !== -1) break
  }
  
  if (startIndex === -1) return null
  
  // 收集章节内容直到下一个主章节
  const contentLines = [chapterTitle]
  
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // 检查是否到达下一个主章节
    if (/^[一二三四五六七八九十]+[、]/.test(line) && 
        !line.includes('.') && 
        line.includes('、')) {
      // 检查是否是另一个主章节（不是子章节）
      const isMainChapter = mainChapters.some(section => 
        section.chapters.some(ch => 
          ch.searchPatterns.some(pattern => line.includes(pattern))
        )
      )
      
      if (isMainChapter && i > startIndex + 10) {
        break
      }
    }
    
    contentLines.push(lines[i])
  }
  
  // 清理和格式化内容
  let content = contentLines.join('\n')
  
  // 转换为Markdown格式
  content = formatToMarkdown(content)
  
  return content
}

// 格式化为Markdown
function formatToMarkdown(content) {
  // 基础清理
  content = content
    .replace(/\n{3,}/g, '\n\n') // 多个空行变成两个
    .replace(/^\s+/gm, '') // 删除行首空格
  
  // 识别并格式化标题
  content = content.replace(/^(\d+\.[\d\.]*)\s+(.+)$/gm, (match, num, title) => {
    const level = num.split('.').length + 1
    return '#'.repeat(Math.min(level, 6)) + ' ' + title
  })
  
  // 识别并格式化列表
  content = content.replace(/^[-•]\s+(.+)$/gm, '- $1')
  
  // 识别代码块
  content = content.replace(/```[\s\S]*?```/g, match => {
    return '\n' + match + '\n'
  })
  
  // 添加段落间距
  const paragraphs = content.split('\n\n')
  content = paragraphs
    .filter(p => p.trim())
    .join('\n\n')
  
  return content
}

// 估算阅读时长（每分钟200字）
function estimateDuration(content) {
  const charCount = content.length
  const minutes = Math.ceil(charCount / 200)
  return minutes * 60 // 返回秒数
}

// 运行导入
importCourseChapters()