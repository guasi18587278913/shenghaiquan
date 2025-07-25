const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const { execSync } = require('child_process')

// 提取城市名的函数
function extractCityName(location) {
  if (!location) return '未知'
  
  // 处理 "省/市/区" 格式
  if (location.includes('/')) {
    const parts = location.split('/')
    if (parts.length >= 2) {
      return parts[1].replace(/市$/, '').trim()
    }
  }
  
  // 处理其他格式
  const cityPattern = /(北京|上海|天津|重庆|深圳|广州|杭州|成都|武汉|西安|南京|苏州|厦门|青岛|大连|郑州|长沙|合肥|福州|昆明|济南|哈尔滨|沈阳|长春|石家庄|太原|南昌|贵阳|南宁|兰州|银川|海口)/
  const match = location.match(cityPattern)
  if (match) return match[1]
  
  return location.length > 10 ? '其他' : location
}

async function comprehensiveDataCheck() {
  console.log('🔍 开始全面数据检查...\n')
  
  try {
    // 1. 读取CSV数据
    console.log('📄 步骤1: 读取CSV文件')
    const pythonScript = `
import csv
import json

with open('data/海外AI产品 名单 .csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    users = []
    for row in reader:
        if len(row) >= 12 and row[2]:  # 确保有星球昵称
            users.append({
                'star_id': row[0].strip(),
                'wechat_name': row[1].strip(),
                'star_name': row[2].strip(),
                'wechat_id': row[3].strip(),
                'avatar': row[4].strip(),
                'industry': row[5].strip(),
                'identity': row[6].strip(),
                'bio': row[7].strip()[:100] + '...' if len(row[7]) > 100 else row[7].strip(),
                'tags': row[8].strip(),
                'city': row[9].strip(),
                'phone': row[11].strip() if len(row) > 11 else ''
            })
print(json.dumps(users))
`
    
    const result = execSync(`python3 -c "${pythonScript}"`, { 
      encoding: 'utf-8', 
      maxBuffer: 50 * 1024 * 1024 
    })
    const csvUsers = JSON.parse(result)
    console.log(`✅ CSV用户总数: ${csvUsers.length}`)
    
    // 2. 读取数据库数据
    console.log('\n💾 步骤2: 读取数据库数据')
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        location: true,
        company: true,
        position: true,
        bio: true,
        avatar: true,
        skills: true,
        createdAt: true
      }
    })
    console.log(`✅ 数据库用户总数: ${dbUsers.length}`)
    
    // 3. 数据匹配分析
    console.log('\n🔗 步骤3: 数据匹配分析')
    const matchAnalysis = {
      totalCsv: csvUsers.length,
      totalDb: dbUsers.length,
      matched: 0,
      mismatched: [],
      notInDb: [],
      extraInDb: []
    }
    
    // 创建数据库用户映射
    const dbUserMap = new Map()
    dbUsers.forEach(user => {
      dbUserMap.set(user.name, user)
    })
    
    // 检查CSV中的每个用户
    const csvFieldMatches = {
      location: { matched: 0, mismatched: 0 },
      company: { matched: 0, mismatched: 0 },
      position: { matched: 0, mismatched: 0 },
      avatar: { matched: 0, mismatched: 0 }
    }
    
    csvUsers.forEach(csvUser => {
      const dbUser = dbUserMap.get(csvUser.star_name)
      
      if (dbUser) {
        matchAnalysis.matched++
        
        // 检查各字段匹配情况
        // 位置
        const csvCity = extractCityName(csvUser.city)
        if (dbUser.location === csvCity) {
          csvFieldMatches.location.matched++
        } else {
          csvFieldMatches.location.mismatched++
          if (matchAnalysis.mismatched.length < 10) {
            matchAnalysis.mismatched.push({
              name: csvUser.star_name,
              field: 'location',
              csv: csvUser.city,
              csvExtracted: csvCity,
              db: dbUser.location
            })
          }
        }
        
        // 公司（行业）
        if (dbUser.company === csvUser.industry) {
          csvFieldMatches.company.matched++
        } else {
          csvFieldMatches.company.mismatched++
        }
        
        // 职位（身份）
        if (dbUser.position === csvUser.identity) {
          csvFieldMatches.position.matched++
        } else {
          csvFieldMatches.position.mismatched++
        }
        
        // 头像
        if (dbUser.avatar === csvUser.avatar) {
          csvFieldMatches.avatar.matched++
        } else if (!dbUser.avatar && !csvUser.avatar) {
          csvFieldMatches.avatar.matched++
        } else {
          csvFieldMatches.avatar.mismatched++
        }
        
        // 从映射中删除已匹配的用户
        dbUserMap.delete(csvUser.star_name)
      } else {
        matchAnalysis.notInDb.push(csvUser.star_name)
      }
    })
    
    // 剩余的是数据库中多出的用户
    matchAnalysis.extraInDb = Array.from(dbUserMap.keys())
    
    // 4. 城市分布对比
    console.log('\n🌍 步骤4: 城市分布对比')
    const csvCityStats = {}
    const dbCityStats = {}
    
    csvUsers.forEach(user => {
      const city = extractCityName(user.city)
      csvCityStats[city] = (csvCityStats[city] || 0) + 1
    })
    
    dbUsers.forEach(user => {
      const city = user.location || '未知'
      dbCityStats[city] = (dbCityStats[city] || 0) + 1
    })
    
    // 5. API测试
    console.log('\n🌐 步骤5: API接口测试')
    const apiTests = []
    
    // 测试位置API
    try {
      const locResponse = await fetch('http://localhost:3000/api/users/locations')
      const locData = await locResponse.json()
      apiTests.push({
        endpoint: '/api/users/locations',
        status: locResponse.ok ? '✅ 正常' : '❌ 错误',
        locationCount: locData.locations?.length || 0
      })
    } catch (e) {
      apiTests.push({
        endpoint: '/api/users/locations',
        status: '❌ 无法连接',
        error: e.message
      })
    }
    
    // 测试用户列表API
    try {
      const usersResponse = await fetch('http://localhost:3000/api/users?pageSize=5')
      const usersData = await usersResponse.json()
      apiTests.push({
        endpoint: '/api/users',
        status: usersResponse.ok ? '✅ 正常' : '❌ 错误',
        userCount: usersData.total || 0
      })
    } catch (e) {
      apiTests.push({
        endpoint: '/api/users',
        status: '❌ 无法连接',
        error: e.message
      })
    }
    
    // 生成检查报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        csvTotal: matchAnalysis.totalCsv,
        dbTotal: matchAnalysis.totalDb,
        matched: matchAnalysis.matched,
        notInDb: matchAnalysis.notInDb.length,
        extraInDb: matchAnalysis.extraInDb.length
      },
      fieldMatches: csvFieldMatches,
      mismatches: matchAnalysis.mismatched,
      cityDistribution: {
        topCsvCities: Object.entries(csvCityStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10),
        topDbCities: Object.entries(dbCityStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
      },
      apiTests,
      notInDb: matchAnalysis.notInDb.slice(0, 10),
      extraInDb: matchAnalysis.extraInDb.slice(0, 10)
    }
    
    // 保存详细报告
    fs.writeFileSync(
      'data-sync-report.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    )
    
    // 打印摘要
    console.log('\n📊 ========== 检查报告摘要 ==========\n')
    
    console.log('📈 数据匹配情况:')
    console.log(`   CSV总数: ${matchAnalysis.totalCsv}`)
    console.log(`   数据库总数: ${matchAnalysis.totalDb}`)
    console.log(`   匹配用户: ${matchAnalysis.matched}`)
    console.log(`   CSV中有但DB中没有: ${matchAnalysis.notInDb.length}`)
    console.log(`   DB中多出的用户: ${matchAnalysis.extraInDb.length}`)
    
    console.log('\n📍 字段匹配率:')
    Object.entries(csvFieldMatches).forEach(([field, stats]) => {
      const rate = ((stats.matched / (stats.matched + stats.mismatched)) * 100).toFixed(1)
      console.log(`   ${field}: ${rate}% (${stats.matched}/${stats.matched + stats.mismatched})`)
    })
    
    console.log('\n🏙️ Top 5 城市分布对比:')
    console.log('   CSV数据:')
    Object.entries(csvCityStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([city, count]) => {
        console.log(`     ${city}: ${count}人`)
      })
    console.log('   数据库:')
    Object.entries(dbCityStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([city, count]) => {
        console.log(`     ${city}: ${count}人`)
      })
    
    console.log('\n🌐 API状态:')
    apiTests.forEach(test => {
      console.log(`   ${test.endpoint}: ${test.status}`)
    })
    
    if (matchAnalysis.mismatched.length > 0) {
      console.log('\n⚠️  位置不匹配示例:')
      matchAnalysis.mismatched.slice(0, 5).forEach(m => {
        console.log(`   ${m.name}: CSV="${m.csv}" → 提取="${m.csvExtracted}", DB="${m.db}"`)
      })
    }
    
    console.log('\n✅ 检查完成！详细报告已保存到: data-sync-report.json')
    
    // 给出建议
    console.log('\n💡 建议:')
    if (matchAnalysis.notInDb.length > 0) {
      console.log(`   - 有 ${matchAnalysis.notInDb.length} 个CSV用户未导入数据库`)
    }
    if (csvFieldMatches.location.mismatched > 10) {
      console.log(`   - 位置字段匹配率较低，可能需要重新同步`)
    }
    if (matchAnalysis.extraInDb.length > 20) {
      console.log(`   - 数据库中有 ${matchAnalysis.extraInDb.length} 个额外用户（可能是测试数据）`)
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行检查
comprehensiveDataCheck()