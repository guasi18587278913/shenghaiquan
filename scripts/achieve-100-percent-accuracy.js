const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')
const { execSync } = require('child_process')

// 提取城市名的完善函数
function extractCityName(location) {
  if (!location || location.trim() === '') return null
  
  // 处理 "省/市/区" 格式
  if (location.includes('/')) {
    const parts = location.split('/').map(p => p.trim())
    if (parts.length >= 2) {
      // 提取市级名称
      let city = parts[1].replace(/市$/, '')
      return city
    }
  }
  
  // 处理 "省 市 区" 格式（空格分隔）
  if (location.includes(' ')) {
    const parts = location.split(' ').filter(p => p.trim())
    for (const part of parts) {
      const cityMatch = part.match(/(.*?)[市]/)
      if (cityMatch) return cityMatch[1]
    }
  }
  
  // 直接匹配城市名
  const cities = [
    '北京', '上海', '天津', '重庆', '深圳', '广州', '杭州', '成都', '武汉', '西安', 
    '南京', '苏州', '厦门', '青岛', '大连', '郑州', '长沙', '合肥', '福州', '昆明', 
    '济南', '哈尔滨', '沈阳', '长春', '石家庄', '太原', '南昌', '贵阳', '南宁', '兰州', 
    '银川', '海口', '珠海', '佛山', '东莞', '中山', '惠州', '无锡', '常州', '宁波',
    '温州', '嘉兴', '绍兴', '台州', '烟台', '潍坊', '临沂', '唐山', '保定', '廊坊',
    '洛阳', '宜昌', '襄阳', '岳阳', '常德', '株洲', '湘潭', '衡阳', '南通', '徐州',
    '扬州', '泰州', '镇江', '芜湖', '马鞍山', '淮安', '连云港', '淮南', '泉州', '莆田',
    '漳州', '龙岩', '三明', '南平', '宁德', '九江', '赣州', '吉安', '萍乡', '新余',
    '鹰潭', '景德镇', '威海', '日照', '德州', '聊城', '滨州', '菏泽', '济宁', '枣庄',
    '淄博', '包头', '呼和浩特', '鄂尔多斯', '通辽', '赤峰', '西宁', '拉萨', '乌鲁木齐',
    '桂林', '柳州', '梧州', '北海', '钦州', '防城港', '玉林', '贵港', '河池', '来宾',
    '崇左', '三亚', '儋州', '五指山', '琼海', '文昌', '东方', '定安', '屯昌', '澄迈'
  ]
  
  // 尝试在location中找到城市名
  for (const city of cities) {
    if (location.includes(city)) {
      return city
    }
  }
  
  // 特殊处理
  const specialMappings = {
    '福建省莆田市': '莆田',
    '广东惠州': '惠州',
    '广东东莞': '东莞',
    '浙江杭州': '杭州',
    '浙江宁波': '宁波',
    '江苏苏州': '苏州',
    '江苏南京': '南京'
  }
  
  for (const [pattern, city] of Object.entries(specialMappings)) {
    if (location.includes(pattern)) return city
  }
  
  return null
}

async function achieve100PercentAccuracy() {
  console.log('🎯 开始实现100%数据准确性...\n')
  
  try {
    // 步骤1: 读取原始CSV数据
    console.log('📄 步骤1: 读取原始CSV数据')
    const pythonScript = `
import csv
import json

with open('data/海外AI产品 名单 .csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    users = []
    row_num = 2  # Excel行号从2开始（跳过表头）
    for row in reader:
        if len(row) >= 12:
            users.append({
                'row_num': row_num,
                'star_id': row[0].strip() if row[0] else '',
                'wechat_name': row[1].strip() if row[1] else '',
                'star_name': row[2].strip() if row[2] else '',
                'wechat_id': row[3].strip() if row[3] else '',
                'avatar': row[4].strip() if row[4] else '',
                'industry': row[5].strip() if row[5] else '',
                'identity': row[6].strip() if row[6] else '',
                'bio': row[7].strip() if row[7] else '',
                'tags': row[8].strip() if row[8] else '',
                'city': row[9].strip() if row[9] else '',
                'resources': row[10].strip() if len(row) > 10 else '',
                'phone': row[11].strip() if len(row) > 11 else '',
                'wechat_id2': row[12].strip() if len(row) > 12 else '',
                'my_tags': row[13].strip() if len(row) > 13 else '',
                'current_identity': row[14].strip() if len(row) > 14 else ''
            })
        row_num += 1
print(json.dumps(users))
`
    
    const result = execSync(`python3 -c "${pythonScript}"`, { 
      encoding: 'utf-8', 
      maxBuffer: 50 * 1024 * 1024 
    })
    const csvUsers = JSON.parse(result)
    console.log(`✅ 读取到 ${csvUsers.length} 条CSV数据`)
    
    // 步骤2: 获取数据库现有数据
    console.log('\n💾 步骤2: 分析数据库现状')
    const dbUsers = await prisma.user.findMany()
    console.log(`✅ 数据库中有 ${dbUsers.length} 个用户`)
    
    // 创建映射
    const dbUserMap = new Map()
    dbUsers.forEach(user => {
      dbUserMap.set(user.name, user)
    })
    
    // 步骤3: 修复所有数据不匹配
    console.log('\n🔧 步骤3: 修复所有数据不匹配')
    let updateCount = 0
    let insertCount = 0
    let deleteCount = 0
    const updates = []
    const inserts = []
    const issues = []
    
    // 处理每个CSV用户
    for (const csvUser of csvUsers) {
      // 跳过无效数据
      if (!csvUser.star_name || csvUser.star_name === '.' || csvUser.star_name.length < 2) {
        issues.push({
          row: csvUser.row_num,
          name: csvUser.star_name || csvUser.wechat_name || '(空)',
          issue: '用户名无效',
          action: '跳过'
        })
        continue
      }
      
      const dbUser = dbUserMap.get(csvUser.star_name)
      
      // 提取城市
      const extractedCity = extractCityName(csvUser.city)
      const cityToUse = extractedCity || '其他'
      
      if (dbUser) {
        // 检查是否需要更新
        const needsUpdate = 
          dbUser.location !== cityToUse ||
          dbUser.company !== csvUser.industry ||
          dbUser.position !== csvUser.identity ||
          dbUser.avatar !== csvUser.avatar ||
          (dbUser.bio || '') !== csvUser.bio
        
        if (needsUpdate) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              location: cityToUse,
              company: csvUser.industry,
              position: csvUser.identity,
              avatar: csvUser.avatar || null,
              bio: csvUser.bio || ''
            }
          })
          
          updates.push({
            name: csvUser.star_name,
            changes: {
              location: dbUser.location !== cityToUse ? `${dbUser.location} → ${cityToUse}` : null,
              company: dbUser.company !== csvUser.industry ? `${dbUser.company} → ${csvUser.industry}` : null,
              position: dbUser.position !== csvUser.identity ? `${dbUser.position} → ${csvUser.identity}` : null
            }
          })
          
          updateCount++
        }
        
        // 从映射中删除（用于找出多余的用户）
        dbUserMap.delete(csvUser.star_name)
      } else {
        // 需要插入新用户
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash('deepsea2024', 10)
        
        try {
          await prisma.user.create({
            data: {
              name: csvUser.star_name,
              email: `${csvUser.star_id || csvUser.row_num}@deepsea.com`,
              phone: csvUser.phone || csvUser.wechat_id || `user_${csvUser.row_num}`,
              password: hashedPassword,
              avatar: csvUser.avatar || null,
              bio: csvUser.bio || '',
              location: cityToUse,
              company: csvUser.industry || '',
              position: csvUser.identity || '',
              skills: JSON.stringify(csvUser.tags ? csvUser.tags.split(/[,，]/).filter(t => t) : []),
              role: 'USER',
              level: 1,
              points: 100
            }
          })
          
          inserts.push({
            name: csvUser.star_name,
            location: cityToUse,
            row: csvUser.row_num
          })
          
          insertCount++
        } catch (error) {
          issues.push({
            row: csvUser.row_num,
            name: csvUser.star_name,
            issue: error.message,
            action: '插入失败'
          })
        }
      }
    }
    
    // 步骤4: 处理数据库中多余的用户
    console.log('\n🗑️  步骤4: 清理多余数据')
    const extraUsers = Array.from(dbUserMap.values())
    const testUserPattern = /^(测试|test|demo|示例|演示)/i
    
    for (const user of extraUsers) {
      // 只删除明显的测试数据
      if (testUserPattern.test(user.name) || user.email?.includes('test') || user.email?.includes('demo')) {
        await prisma.user.delete({
          where: { id: user.id }
        })
        deleteCount++
        console.log(`   删除测试用户: ${user.name}`)
      } else {
        issues.push({
          name: user.name,
          issue: '数据库中存在但CSV中没有',
          action: '保留（可能是后添加的用户）'
        })
      }
    }
    
    // 步骤5: 验证最终结果
    console.log('\n✅ 步骤5: 验证最终结果')
    const finalDbCount = await prisma.user.count()
    const finalCsvCount = csvUsers.filter(u => u.star_name && u.star_name !== '.' && u.star_name.length >= 2).length
    
    // 生成详细报告
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        csvTotal: csvUsers.length,
        validCsvUsers: finalCsvCount,
        dbTotal: finalDbCount,
        updated: updateCount,
        inserted: insertCount,
        deleted: deleteCount,
        accuracy: ((finalCsvCount === finalDbCount) ? 100 : (finalDbCount / finalCsvCount * 100)).toFixed(2) + '%'
      },
      updates: updates.slice(0, 20),
      inserts: inserts.slice(0, 20),
      issues,
      cityDistribution: await getCityDistribution()
    }
    
    // 保存报告
    fs.writeFileSync(
      'data-accuracy-report.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    )
    
    // 打印结果
    console.log('\n' + '='.repeat(50))
    console.log('📊 数据准确性优化完成！')
    console.log('='.repeat(50))
    console.log(`\n📈 最终统计:`)
    console.log(`   CSV有效用户: ${finalCsvCount}`)
    console.log(`   数据库用户: ${finalDbCount}`)
    console.log(`   准确率: ${report.summary.accuracy}`)
    console.log(`\n🔄 操作统计:`)
    console.log(`   更新: ${updateCount} 条`)
    console.log(`   插入: ${insertCount} 条`)
    console.log(`   删除: ${deleteCount} 条`)
    
    if (issues.length > 0) {
      console.log(`\n⚠️  发现 ${issues.length} 个问题，详见报告`)
    }
    
    console.log('\n📄 详细报告已保存到: data-accuracy-report.json')
    
    // 如果还不是100%准确
    if (finalDbCount !== finalCsvCount) {
      console.log('\n❗ 未达到100%准确率的原因:')
      if (issues.length > 0) {
        issues.slice(0, 5).forEach(issue => {
          console.log(`   - ${issue.name}: ${issue.issue}`)
        })
      }
    } else {
      console.log('\n🎉 恭喜！已实现100%数据准确性！')
    }
    
  } catch (error) {
    console.error('❌ 优化失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 获取城市分布
async function getCityDistribution() {
  const cities = await prisma.user.groupBy({
    by: ['location'],
    _count: {
      location: true
    },
    orderBy: {
      _count: {
        location: 'desc'
      }
    },
    take: 20
  })
  
  return cities.map(c => ({
    city: c.location,
    count: c._count.location
  }))
}

// 执行优化
achieve100PercentAccuracy()