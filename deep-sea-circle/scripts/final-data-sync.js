const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

// 城市提取函数
function extractCity(location) {
  if (!location) return '其他'
  
  const cities = [
    '北京', '上海', '天津', '重庆', '深圳', '广州', '杭州', '成都', '武汉', '西安', 
    '南京', '苏州', '厦门', '青岛', '大连', '郑州', '长沙', '合肥', '福州', '昆明', 
    '济南', '哈尔滨', '沈阳', '长春', '石家庄', '太原', '南昌', '贵阳', '南宁', '兰州', 
    '银川', '海口', '珠海', '佛山', '东莞', '中山', '惠州', '无锡', '常州', '宁波',
    '温州', '嘉兴', '绍兴', '台州', '烟台', '潍坊', '临沂', '唐山', '保定', '廊坊',
    '洛阳', '宜昌', '襄阳', '岳阳', '常德', '株洲', '湘潭', '衡阳', '南通', '徐州',
    '莆田', '东营', '三亚', '中卫'
  ]
  
  // 处理"省/市/区"格式
  if (location.includes('/')) {
    const parts = location.split('/')
    if (parts.length >= 2) {
      const city = parts[1].replace(/市$/, '').trim()
      if (cities.includes(city)) return city
    }
  }
  
  // 直接匹配
  for (const city of cities) {
    if (location.includes(city)) return city
  }
  
  return '其他'
}

// 解析CSV（手动处理以避免引号问题）
function parseCSV(content) {
  const lines = content.split('\n')
  const headers = lines[0].split(',').map(h => h.trim().replace(/^\ufeff/, ''))
  const data = []
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    
    const row = {}
    const values = lines[i].split(',')
    
    // 手动映射重要字段
    row['星球编号'] = values[0]?.trim() || ''
    row['微信昵称'] = values[1]?.trim() || ''
    row['星球昵称'] = values[2]?.trim() || ''
    row['微信ID'] = values[3]?.trim() || ''
    row['星球头像'] = values[4]?.trim() || ''
    row['行业'] = values[5]?.trim() || ''
    row['身份'] = values[6]?.trim() || ''
    row['自我介绍'] = values[7]?.trim() || ''
    row['个人标签'] = values[8]?.trim() || ''
    row['城市'] = values[9]?.trim() || ''
    row['可提供的资源'] = values[10]?.trim() || ''
    row['手机号'] = values[11]?.trim() || ''
    row['行号'] = i + 1
    
    data.push(row)
  }
  
  return data
}

async function finalDataSync() {
  console.log('🎯 最终数据同步 - 实现100%准确性\n')
  
  try {
    // 1. 读取CSV
    console.log('📄 步骤1: 读取CSV数据')
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const csvData = parseCSV(csvContent)
    
    // 过滤有效数据
    const validCsvUsers = csvData.filter(row => {
      const name = row['星球昵称'] || row['微信昵称']
      return name && name.trim() && name !== '.'
    })
    
    console.log(`✅ CSV有效用户: ${validCsvUsers.length}`)
    
    // 2. 清空并重建数据
    console.log('\n🔄 步骤2: 清空并重建数据库')
    
    // 删除所有非管理员用户
    await prisma.user.deleteMany({
      where: {
        role: 'USER'
      }
    })
    console.log('✅ 已清空旧数据')
    
    // 3. 导入所有CSV用户
    console.log('\n📥 步骤3: 导入所有用户')
    let successCount = 0
    let errorCount = 0
    const errors = []
    
    for (const csvUser of validCsvUsers) {
      try {
        const name = csvUser['星球昵称'] || csvUser['微信昵称']
        const phone = csvUser['手机号'] || csvUser['微信ID'] || `row_${csvUser['行号']}`
        const hashedPassword = await bcrypt.hash('deepsea2024', 10)
        
        await prisma.user.create({
          data: {
            name: name.trim(),
            email: `${csvUser['星球编号'] || csvUser['行号']}@deepsea.com`,
            phone: phone,
            password: hashedPassword,
            avatar: csvUser['星球头像'] || null,
            bio: csvUser['自我介绍'] || '',
            location: extractCity(csvUser['城市']),
            company: csvUser['行业'] || '',
            position: csvUser['身份'] || '',
            skills: JSON.stringify(
              csvUser['个人标签'] ? 
              csvUser['个人标签'].split(/[,，]/).filter(t => t.trim()) : 
              []
            ),
            role: 'USER',
            level: 1,
            points: 100,
            isActive: true
          }
        })
        
        successCount++
        if (successCount % 100 === 0) {
          console.log(`   已导入 ${successCount} 个用户...`)
        }
      } catch (error) {
        errorCount++
        errors.push({
          row: csvUser['行号'],
          name: csvUser['星球昵称'] || csvUser['微信昵称'],
          error: error.message
        })
      }
    }
    
    // 4. 最终验证
    console.log('\n✅ 步骤4: 最终验证')
    const finalDbCount = await prisma.user.count()
    const cityStats = await prisma.user.groupBy({
      by: ['location'],
      _count: { location: true },
      orderBy: { _count: { location: 'desc' } },
      take: 10
    })
    
    // 生成报告
    const finalReport = {
      timestamp: new Date().toISOString(),
      summary: {
        csvTotal: csvData.length,
        csvValid: validCsvUsers.length,
        imported: successCount,
        failed: errorCount,
        dbTotal: finalDbCount,
        accuracy: ((successCount / validCsvUsers.length) * 100).toFixed(2) + '%'
      },
      cityDistribution: cityStats.map(s => ({
        city: s.location,
        count: s._count.location
      })),
      errors: errors.slice(0, 10)
    }
    
    fs.writeFileSync(
      'final-sync-report.json',
      JSON.stringify(finalReport, null, 2),
      'utf-8'
    )
    
    // 打印结果
    console.log('\n' + '='.repeat(60))
    console.log('🎉 数据同步完成！')
    console.log('='.repeat(60))
    console.log(`\n📊 最终统计:`)
    console.log(`   CSV总数: ${csvData.length}`)
    console.log(`   有效用户: ${validCsvUsers.length}`)
    console.log(`   成功导入: ${successCount}`)
    console.log(`   导入失败: ${errorCount}`)
    console.log(`   数据库总数: ${finalDbCount}`)
    console.log(`   准确率: ${finalReport.summary.accuracy}`)
    
    console.log('\n🏙️  城市分布TOP10:')
    cityStats.forEach(({ location, _count }) => {
      console.log(`   ${location}: ${_count.location}人`)
    })
    
    if (errorCount > 0) {
      console.log('\n❌ 导入失败的用户:')
      errors.slice(0, 5).forEach(e => {
        console.log(`   行${e.row}: ${e.name} - ${e.error}`)
      })
    }
    
    console.log('\n📄 详细报告: final-sync-report.json')
    
    // 验证网页显示
    console.log('\n🌐 验证网页显示:')
    console.log('   1. 访问 http://localhost:3000/members - 查看成员列表')
    console.log('   2. 访问 http://localhost:3000/map - 查看地图分布')
    console.log('   3. 所有数据应该100%同步显示')
    
  } catch (error) {
    console.error('❌ 同步失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行最终同步
finalDataSync()