const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// 解析CSV的函数
function parseCSV(content) {
  // 移除BOM字符
  content = content.replace(/^\uFEFF/, '')
  
  const lines = content.split('\n')
  if (lines.length < 2) return []
  
  // 获取表头
  const headers = lines[0].split(',').map(h => h.trim())
  
  // 解析数据行
  const data = []
  let currentRow = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    
    // 如果行以数字开头，认为是新行
    if (/^\d+,/.test(line)) {
      if (currentRow.length > 0) {
        // 处理上一行
        const values = currentRow.join('\n').split(',')
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }
      currentRow = [line]
    } else {
      // 继续当前行
      if (currentRow.length > 0) {
        currentRow.push(line)
      }
    }
  }
  
  // 处理最后一行
  if (currentRow.length > 0) {
    const values = currentRow.join('\n').split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    data.push(row)
  }
  
  return data
}

async function compareBioData() {
  console.log('🔍 对比CSV和数据库中的bio数据...\n')
  
  try {
    // 1. 获取数据库中bio为空或"无"的用户
    const problemUsers = await prisma.user.findMany({
      where: {
        OR: [
          { bio: null },
          { bio: '' },
          { bio: '无' }
        ],
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        bio: true
      }
    })
    
    console.log(`📊 数据库中bio有问题的用户: ${problemUsers.length} 个`)
    
    // 2. 读取CSV文件
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const students = parseCSV(csvContent)
    
    // 3. 创建CSV数据的索引，方便查找
    const csvIndex = new Map()
    students.forEach(student => {
      const name = student['星球昵称']?.trim() || student['微信昵称']?.trim()
      const phone = student['手机号']?.toString().trim()
      const studentId = student['星球编号']?.toString().trim()
      const bio = student['自我介绍']?.trim()
      
      if (name) {
        // 使用多个键来索引，提高匹配率
        csvIndex.set(name, { ...student, parsedBio: bio })
        
        // 也用手机号索引
        if (phone && phone !== '无') {
          csvIndex.set(phone, { ...student, parsedBio: bio })
        }
        
        // 用学号索引
        if (studentId) {
          csvIndex.set(`S${studentId}`, { ...student, parsedBio: bio })
        }
      }
    })
    
    // 4. 对比数据
    const mismatches = []
    let csvHasContent = 0
    let csvAlsoEmpty = 0
    let notFoundInCsv = 0
    
    problemUsers.forEach(user => {
      // 尝试多种方式匹配CSV数据
      let csvData = csvIndex.get(user.name) || 
                    csvIndex.get(user.phone) ||
                    null
      
      if (csvData) {
        const csvBio = csvData.parsedBio || ''
        
        if (csvBio && csvBio !== '无' && csvBio !== '暂无') {
          // CSV有内容但数据库没有
          csvHasContent++
          mismatches.push({
            name: user.name,
            phone: user.phone,
            dbBio: user.bio || '[空]',
            csvBio: csvBio.substring(0, 100) + (csvBio.length > 100 ? '...' : ''),
            issue: 'CSV有内容但数据库为空或"无"'
          })
        } else {
          // CSV也是空的
          csvAlsoEmpty++
        }
      } else {
        // 在CSV中找不到
        notFoundInCsv++
      }
    })
    
    // 5. 显示结果
    console.log(`\n📊 对比结果:`)
    console.log(`  - CSV中有内容但数据库为空: ${csvHasContent} 个`)
    console.log(`  - CSV中也为空: ${csvAlsoEmpty} 个`)
    console.log(`  - 在CSV中找不到对应记录: ${notFoundInCsv} 个`)
    
    // 6. 显示前10个需要修复的例子
    if (mismatches.length > 0) {
      console.log(`\n🔧 需要修复的用户示例 (前10个):`)
      mismatches.slice(0, 10).forEach((m, i) => {
        console.log(`\n${i + 1}. ${m.name} (${m.phone})`)
        console.log(`   数据库bio: "${m.dbBio}"`)
        console.log(`   CSV bio: "${m.csvBio}"`)
      })
      
      // 7. 保存完整的不匹配列表
      const reportPath = path.join(process.cwd(), 'bio-mismatch-report.json')
      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        totalProblems: problemUsers.length,
        csvHasContent: csvHasContent,
        csvAlsoEmpty: csvAlsoEmpty,
        notFoundInCsv: notFoundInCsv,
        mismatches: mismatches
      }, null, 2))
      
      console.log(`\n📄 详细的不匹配报告已保存到: ${reportPath}`)
    }
    
    // 8. 检查一些特殊案例
    console.log(`\n🔍 检查特殊案例:`)
    
    // 查找CSV中bio最长的几个记录
    const longBios = students
      .filter(s => s['自我介绍'] && s['自我介绍'].length > 200)
      .sort((a, b) => b['自我介绍'].length - a['自我介绍'].length)
      .slice(0, 3)
    
    console.log(`\nCSV中bio最长的用户:`)
    longBios.forEach((s, i) => {
      const name = s['星球昵称'] || s['微信昵称']
      console.log(`${i + 1}. ${name}: ${s['自我介绍'].length} 字符`)
    })
    
  } catch (error) {
    console.error('对比失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

compareBioData()