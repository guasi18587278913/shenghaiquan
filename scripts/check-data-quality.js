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

async function checkDataQuality() {
  console.log('🔍 开始全面检查数据质量...\n')
  
  const report = {
    timestamp: new Date().toISOString(),
    database: {
      totalUsers: 0,
      defaultBioCount: 0,
      emptyBioCount: 0,
      defaultCompanyCount: 0,
      defaultPositionCount: 0,
      emptySkillsCount: 0,
      duplicateBios: {},
      defaultValues: {}
    },
    csv: {
      totalRecords: 0,
      emptyBios: 0,
      defaultBios: 0
    },
    comparison: {
      bioMismatches: [],
      importErrors: []
    },
    issues: []
  }
  
  try {
    // 1. 检查数据库中的默认bio文本
    console.log('📊 检查数据库中的bio字段...')
    const defaultBioText = "专注于AI产品开发和海外业务"
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        bio: true,
        company: true,
        position: true,
        skills: true,
        location: true,
        phone: true,
        createdAt: true,
        role: true
      }
    })
    
    report.database.totalUsers = users.length
    
    // 检查bio字段问题
    const bioStats = {}
    const suspiciousPatterns = [
      "专注于AI产品开发和海外业务",
      "AI产品开发",
      "海外业务",
      "深海圈会员",
      "暂无介绍",
      "这个人很懒",
      "无"
    ]
    
    users.forEach(user => {
      if (!user.bio || user.bio.trim() === '') {
        report.database.emptyBioCount++
      } else if (user.bio.includes(defaultBioText)) {
        report.database.defaultBioCount++
      }
      
      // 检查其他可疑的默认文本
      suspiciousPatterns.forEach(pattern => {
        if (user.bio && user.bio.includes(pattern)) {
          if (!report.database.suspiciousPatterns) {
            report.database.suspiciousPatterns = {}
          }
          report.database.suspiciousPatterns[pattern] = (report.database.suspiciousPatterns[pattern] || 0) + 1
        }
      })
      
      // 统计bio内容的重复
      const bioTrim = user.bio?.trim() || '[空]'
      bioStats[bioTrim] = (bioStats[bioTrim] || 0) + 1
    })
    
    // 找出重复的bio内容
    Object.entries(bioStats).forEach(([bio, count]) => {
      if (count > 2 && bio.length < 100) { // 超过2个用户使用相同的短bio
        report.database.duplicateBios[bio] = count
      }
    })
    
    console.log(`  - 包含默认文本"${defaultBioText}"的用户: ${report.database.defaultBioCount}`)
    console.log(`  - bio为空的用户: ${report.database.emptyBioCount}`)
    console.log(`  - 重复的bio内容: ${Object.keys(report.database.duplicateBios).length} 种`)
    
    if (report.database.suspiciousPatterns) {
      console.log(`  - 可疑的默认文本模式:`)
      Object.entries(report.database.suspiciousPatterns).forEach(([pattern, count]) => {
        if (count > 0) {
          console.log(`    • "${pattern}": ${count} 个用户`)
        }
      })
    }
    
    // 2. 检查其他字段的默认值
    console.log('\n📊 检查其他字段的默认值...')
    const companyStats = {}
    const positionStats = {}
    
    users.forEach(user => {
      // 统计company
      const company = user.company?.trim() || '[空]'
      companyStats[company] = (companyStats[company] || 0) + 1
      
      // 统计position
      const position = user.position?.trim() || '[空]'
      positionStats[position] = (positionStats[position] || 0) + 1
      
      // 检查skills
      if (!user.skills || user.skills === '[]' || user.skills === 'null') {
        report.database.emptySkillsCount++
      }
    })
    
    // 找出可能的默认值
    Object.entries(companyStats).forEach(([company, count]) => {
      if (count > 10 && company.length < 20) {
        report.database.defaultValues[`company: ${company}`] = count
      }
    })
    
    Object.entries(positionStats).forEach(([position, count]) => {
      if (count > 10 && position.length < 20) {
        report.database.defaultValues[`position: ${position}`] = count
      }
    })
    
    console.log(`  - 空skills的用户: ${report.database.emptySkillsCount}`)
    console.log(`  - 发现的默认值模式: ${Object.keys(report.database.defaultValues).length} 个`)
    
    // 3. 读取CSV并对比
    console.log('\n📄 读取CSV文件并对比...')
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf-8')
      const students = parseCSV(csvContent)
      
      report.csv.totalRecords = students.length
      
      // 检查CSV中的bio字段
      students.forEach((student, index) => {
        const csvBio = student['自我介绍']?.trim() || ''
        
        if (!csvBio) {
          report.csv.emptyBios++
        }
        
        // 尝试匹配数据库中的用户
        const name = student['星球昵称']?.trim() || student['微信昵称']?.trim()
        const phone = student['手机号']?.toString().trim()
        const studentId = student['星球编号']?.toString().trim()
        const loginId = phone || (studentId ? `S${studentId}` : null)
        
        if (name && loginId) {
          const dbUser = users.find(u => 
            u.name === name && (u.phone === loginId || u.phone === phone)
          )
          
          if (dbUser) {
            // 对比bio字段
            const dbBio = dbUser.bio?.trim() || ''
            
            // 如果CSV有内容但数据库是默认值，记录不匹配
            if (csvBio && csvBio !== dbBio && dbUser.bio?.includes(defaultBioText)) {
              report.comparison.bioMismatches.push({
                name: name,
                csvBio: csvBio.substring(0, 100) + (csvBio.length > 100 ? '...' : ''),
                dbBio: dbBio.substring(0, 100) + (dbBio.length > 100 ? '...' : ''),
                issue: 'CSV有内容但数据库是默认值'
              })
            }
          } else if (name && csvBio) {
            // CSV中有但数据库中找不到的用户
            report.comparison.importErrors.push({
              name: name,
              phone: phone || '无',
              issue: 'CSV中存在但数据库中未找到'
            })
          }
        }
      })
      
      console.log(`  - CSV总记录数: ${report.csv.totalRecords}`)
      console.log(`  - CSV中bio为空: ${report.csv.emptyBios}`)
      console.log(`  - bio不匹配的记录: ${report.comparison.bioMismatches.length}`)
      console.log(`  - 未导入的记录: ${report.comparison.importErrors.length}`)
    } else {
      report.issues.push('CSV文件不存在')
    }
    
    // 4. 汇总问题
    console.log('\n🚨 数据质量问题汇总:')
    
    if (report.database.defaultBioCount > 0) {
      report.issues.push(`${report.database.defaultBioCount} 个用户使用默认bio文本`)
    }
    
    if (report.database.emptyBioCount > 0) {
      report.issues.push(`${report.database.emptyBioCount} 个用户bio为空`)
    }
    
    if (Object.keys(report.database.duplicateBios).length > 0) {
      report.issues.push(`发现 ${Object.keys(report.database.duplicateBios).length} 种重复的bio内容`)
    }
    
    if (report.database.emptySkillsCount > 0) {
      report.issues.push(`${report.database.emptySkillsCount} 个用户skills为空`)
    }
    
    if (report.comparison.bioMismatches.length > 0) {
      report.issues.push(`${report.comparison.bioMismatches.length} 个用户的bio与CSV不匹配`)
    }
    
    report.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`)
    })
    
    // 5. 生成详细的用户列表
    console.log('\n📋 生成问题用户详细列表...')
    
    report.problemUsers = {
      defaultBio: [],
      emptyBio: [],
      duplicateBio: {}
    }
    
    // 收集使用默认bio的用户
    users.forEach(user => {
      if (user.bio?.includes(defaultBioText)) {
        report.problemUsers.defaultBio.push({
          id: user.id,
          name: user.name,
          phone: user.phone,
          bio: user.bio
        })
      }
      
      if (!user.bio || user.bio.trim() === '') {
        report.problemUsers.emptyBio.push({
          id: user.id,
          name: user.name,
          phone: user.phone
        })
      }
    })
    
    // 按bio内容分组重复的用户
    users.forEach(user => {
      const bioTrim = user.bio?.trim() || '[空]'
      if (report.database.duplicateBios[bioTrim]) {
        if (!report.problemUsers.duplicateBio[bioTrim]) {
          report.problemUsers.duplicateBio[bioTrim] = []
        }
        report.problemUsers.duplicateBio[bioTrim].push({
          id: user.id,
          name: user.name,
          phone: user.phone
        })
      }
    })
    
    // 6. 添加修复建议
    report.recommendations = []
    
    if (report.database.emptyBioCount > 0) {
      report.recommendations.push({
        issue: `${report.database.emptyBioCount} 个用户bio为空`,
        severity: 'high',
        suggestion: '从CSV文件重新导入这些用户的自我介绍数据'
      })
    }
    
    if (report.database.suspiciousPatterns && report.database.suspiciousPatterns['无'] > 0) {
      report.recommendations.push({
        issue: `${report.database.suspiciousPatterns['无']} 个用户的bio仅为"无"`,
        severity: 'medium',
        suggestion: '检查CSV原始数据，如果原始数据有内容则重新导入'
      })
    }
    
    if (report.database.emptySkillsCount > 100) {
      report.recommendations.push({
        issue: `${report.database.emptySkillsCount} 个用户的skills字段为空`,
        severity: 'medium',
        suggestion: '从CSV的"个人标签"字段重新导入技能数据'
      })
    }
    
    if (report.comparison.importErrors.length > 0) {
      report.recommendations.push({
        issue: `${report.comparison.importErrors.length} 个CSV记录未成功导入`,
        severity: 'high',
        suggestion: '检查导入脚本，可能是手机号重复或格式问题导致'
      })
    }
    
    // 7. 生成数据质量评分
    const totalUsers = report.database.totalUsers
    const qualityScore = {
      bioCompleteness: ((totalUsers - report.database.emptyBioCount - (report.database.suspiciousPatterns?.['无'] || 0)) / totalUsers * 100).toFixed(1),
      skillsCompleteness: ((totalUsers - report.database.emptySkillsCount) / totalUsers * 100).toFixed(1),
      importSuccess: ((report.csv.totalRecords - report.comparison.importErrors.length) / report.csv.totalRecords * 100).toFixed(1),
      overall: 0
    }
    
    qualityScore.overall = ((parseFloat(qualityScore.bioCompleteness) + parseFloat(qualityScore.skillsCompleteness) + parseFloat(qualityScore.importSuccess)) / 3).toFixed(1)
    
    report.qualityScore = qualityScore
    
    // 8. 保存报告
    const reportPath = path.join(process.cwd(), 'data-quality-check.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log(`\n✅ 数据质量检查完成！`)
    console.log(`📄 详细报告已保存到: ${reportPath}`)
    
    // 显示质量评分
    console.log('\n📊 数据质量评分:')
    console.log(`  - Bio完整度: ${qualityScore.bioCompleteness}%`)
    console.log(`  - Skills完整度: ${qualityScore.skillsCompleteness}%`)
    console.log(`  - 导入成功率: ${qualityScore.importSuccess}%`)
    console.log(`  - 总体评分: ${qualityScore.overall}%`)
    
    // 显示修复建议
    if (report.recommendations.length > 0) {
      console.log('\n💡 修复建议:')
      report.recommendations.forEach((rec, index) => {
        const icon = rec.severity === 'high' ? '🔴' : '🟡'
        console.log(`  ${icon} ${rec.issue}`)
        console.log(`     建议: ${rec.suggestion}`)
      })
    }
    
    // 显示一些示例
    if (report.problemUsers.defaultBio.length > 0) {
      console.log('\n示例 - 使用默认bio的用户:')
      report.problemUsers.defaultBio.slice(0, 3).forEach(user => {
        console.log(`  - ${user.name} (${user.phone})`)
      })
    }
    
    if (report.comparison.bioMismatches.length > 0) {
      console.log('\n示例 - bio不匹配的用户:')
      report.comparison.bioMismatches.slice(0, 3).forEach(mismatch => {
        console.log(`  - ${mismatch.name}: ${mismatch.issue}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 检查过程出错:', error)
    report.issues.push(`检查过程出错: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行检查
checkDataQuality().catch(console.error)