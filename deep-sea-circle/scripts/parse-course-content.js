const fs = require('fs')
const path = require('path')

// 读取深海圈教程内容
async function parseCourseContent() {
  console.log('📖 开始解析深海圈教程内容...')
  
  try {
    // 读取原始课程文件
    const coursePath = path.join(__dirname, '../../深海圈教程')
    const content = fs.readFileSync(coursePath, 'utf-8')
    
    // 分析内容结构
    const lines = content.split('\n')
    console.log(`总行数: ${lines.length}`)
    
    // 提取主要章节
    const sections = {
      基础篇: [],
      认知篇: [],
      内功篇: [],
      进阶篇: []
    }
    
    let currentSection = null
    let currentChapter = null
    let contentBuffer = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // 检测章节标题
      if (line.includes('基础篇（视频+文字）')) {
        currentSection = '基础篇'
        continue
      } else if (line.includes('认知篇（文字）')) {
        currentSection = '认知篇'
        continue
      } else if (line.includes('内功篇（文字）')) {
        currentSection = '内功篇'
        continue
      } else if (line.includes('进阶篇（文字）')) {
        currentSection = '进阶篇'
        continue
      }
      
      // 检测主要课程标题（中文数字开头，不是子章节）
      if (currentSection && /^[一二三四五六七八九十]+[、]/.test(line) && !line.includes('.')) {
        // 保存之前的章节内容
        if (currentChapter && contentBuffer.length > 0) {
          sections[currentSection].push({
            title: currentChapter,
            content: contentBuffer.join('\n')
          })
        }
        
        currentChapter = line
        contentBuffer = []
      } else if (currentChapter) {
        // 收集章节内容
        contentBuffer.push(line)
      }
    }
    
    // 保存最后一个章节
    if (currentChapter && contentBuffer.length > 0 && currentSection) {
      sections[currentSection].push({
        title: currentChapter,
        content: contentBuffer.join('\n')
      })
    }
    
    // 输出解析结果
    console.log('\n📊 解析结果:')
    let totalChapters = 0
    for (const [section, chapters] of Object.entries(sections)) {
      console.log(`\n${section}: ${chapters.length} 个章节`)
      totalChapters += chapters.length
      chapters.forEach((chapter, index) => {
        console.log(`  ${index + 1}. ${chapter.title}`)
        console.log(`     内容长度: ${chapter.content.length} 字符`)
      })
    }
    console.log(`\n总计: ${totalChapters} 个章节`)
    
    // 保存解析结果为JSON
    const outputPath = path.join(__dirname, '../data/courses/deep-sea-course-parsed.json')
    fs.writeFileSync(outputPath, JSON.stringify(sections, null, 2), 'utf-8')
    console.log(`\n✅ 解析结果已保存到: ${outputPath}`)
    
    // 生成课程导入数据
    generateCourseData(sections)
    
  } catch (error) {
    console.error('❌ 解析失败:', error)
  }
}

// 生成适合导入的课程数据格式
function generateCourseData(sections) {
  const courses = []
  let chapterOrder = 0
  
  // 基础篇课程
  if (sections['基础篇'].length > 0) {
    const basicsChapters = sections['基础篇'].map(chapter => ({
      title: chapter.title,
      content: chapter.content,
      order: ++chapterOrder,
      duration: estimateDuration(chapter.content),
      isLocked: chapterOrder > 1,
      unlockType: 'SEQUENTIAL'
    }))
    
    courses.push({
      title: "深海圈AI产品出海实战 - 基础篇",
      description: "通过AI编程工具，快速实现你的产品idea，零基础也能轻松上手",
      category: "START_HERE",
      level: "BEGINNER",
      chapters: basicsChapters
    })
  }
  
  // 认知篇课程
  if (sections['认知篇'].length > 0) {
    courses.push({
      title: "深海圈AI产品出海实战 - 认知篇",
      description: "深入理解海外软件生意的商业模式和AI时代的产品思维",
      category: "BASIC",
      level: "INTERMEDIATE",
      chapters: sections['认知篇'].map(chapter => ({
        ...chapter,
        order: ++chapterOrder
      }))
    })
  }
  
  // 内功篇课程
  if (sections['内功篇'].length > 0) {
    courses.push({
      title: "深海圈AI产品出海实战 - 内功篇",
      description: "补齐技术内功，深入理解AI生成代码背后的原理",
      category: "BASIC",
      level: "INTERMEDIATE",
      chapters: sections['内功篇'].map(chapter => ({
        ...chapter,
        order: ++chapterOrder
      }))
    })
  }
  
  // 进阶篇课程
  if (sections['进阶篇'].length > 0) {
    courses.push({
      title: "深海圈AI产品出海实战 - 进阶篇",
      description: "从MVP到完整产品，实现商业闭环和规模化增长",
      category: "ADVANCED",
      level: "ADVANCED",
      chapters: sections['进阶篇'].map(chapter => ({
        ...chapter,
        order: ++chapterOrder
      }))
    })
  }
  
  // 保存课程数据
  const outputPath = path.join(__dirname, '../data/courses/deep-sea-courses.json')
  fs.writeFileSync(outputPath, JSON.stringify(courses, null, 2), 'utf-8')
  console.log(`\n✅ 课程数据已生成: ${outputPath}`)
}

// 估算阅读时长（每分钟200字）
function estimateDuration(content) {
  const charCount = content.length
  const minutes = Math.ceil(charCount / 200)
  return minutes * 60 // 返回秒数
}

// 运行解析
parseCourseContent()