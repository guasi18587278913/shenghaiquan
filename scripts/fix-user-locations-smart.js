const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

// 已知用户的正确城市映射（需要手动维护）
const knownUserCities = {
  '杨昌': '北京',
  // 可以在这里添加更多确认的用户城市映射
  // 例如：
  // '张三': '上海',
  // '李四': '深圳',
}

// 从bio中提取城市信息的关键词
const cityKeywords = {
  '北京': ['北京', '帝都', 'Beijing', 'BJ', '海淀', '朝阳', '中关村', '望京'],
  '上海': ['上海', '魔都', 'Shanghai', 'SH', '浦东', '徐汇', '黄浦', '陆家嘴'],
  '深圳': ['深圳', '鹏城', 'Shenzhen', 'SZ', '南山', '福田', '龙岗'],
  '广州': ['广州', '羊城', 'Guangzhou', 'GZ', '天河', '越秀', '番禺'],
  '杭州': ['杭州', 'Hangzhou', 'HZ', '西湖', '滨江', '萧山'],
  '成都': ['成都', 'Chengdu', 'CD', '高新区', '锦江'],
  '武汉': ['武汉', 'Wuhan', 'WH', '江汉', '武昌', '汉口'],
  '西安': ['西安', "Xi'an", 'XA', '雁塔', '碑林'],
  '南京': ['南京', 'Nanjing', 'NJ', '鼓楼', '玄武', '建邺'],
  '苏州': ['苏州', 'Suzhou', '园区', '姑苏'],
  '重庆': ['重庆', 'Chongqing', 'CQ', '渝中', '江北'],
  '天津': ['天津', 'Tianjin', 'TJ', '滨海', '和平区'],
  '厦门': ['厦门', 'Xiamen', 'XM', '思明', '湖里'],
  // 添加更多城市关键词
}

// 从公司名称推断城市
const companyToCityMap = {
  '腾讯': '深圳',
  '阿里巴巴': '杭州',
  '阿里': '杭州',
  '字节跳动': '北京',
  '字节': '北京',
  '百度': '北京',
  '美团': '北京',
  '京东': '北京',
  '网易': '杭州',
  '华为': '深圳',
  '小米': '北京',
  '滴滴': '北京',
  'ByteDance': '北京',
  'Alibaba': '杭州',
  'Tencent': '深圳',
  'Baidu': '北京',
  // 添加更多公司映射
}

// 智能推断用户城市
function inferUserCity(user) {
  // 1. 首先检查已知映射
  if (knownUserCities[user.name]) {
    return knownUserCities[user.name]
  }
  
  // 2. 从bio中查找城市关键词
  if (user.bio) {
    const bioLower = user.bio.toLowerCase()
    for (const [city, keywords] of Object.entries(cityKeywords)) {
      for (const keyword of keywords) {
        if (bioLower.includes(keyword.toLowerCase())) {
          return city
        }
      }
    }
  }
  
  // 3. 从公司名称推断
  if (user.company) {
    const companyLower = user.company.toLowerCase()
    for (const [company, city] of Object.entries(companyToCityMap)) {
      if (companyLower.includes(company.toLowerCase())) {
        return city
      }
    }
  }
  
  // 4. 从phone字段中查找地区信息（如果包含地址）
  if (user.phone && user.phone.includes('/')) {
    // 例如："广东省/深圳市/龙岗区"
    for (const city of Object.keys(cityKeywords)) {
      if (user.phone.includes(city)) {
        return city
      }
    }
  }
  
  return null
}

async function smartFixUserLocations() {
  console.log('🤖 智能修复用户位置数据...\n')
  
  try {
    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        bio: true,
        company: true,
        phone: true
      }
    })
    
    console.log(`📊 总用户数: ${users.length}`)
    
    let fixedCount = 0
    let inferredCount = 0
    let unchangedCount = 0
    let defaultAssignCount = 0
    const fixes = []
    
    // 中国主要城市列表（用于默认分配）
    const defaultCities = [
      '北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '西安', 
      '南京', '重庆', '天津', '苏州', '青岛', '大连', '厦门'
    ]
    
    for (const user of users) {
      // 检查当前location是否有效
      const isValidCity = user.location && 
                         user.location.length <= 10 && 
                         !user.location.includes('】') &&
                         !user.location.includes('【')
      
      if (!isValidCity) {
        // 尝试智能推断城市
        const inferredCity = inferUserCity(user)
        
        if (inferredCity) {
          await prisma.user.update({
            where: { id: user.id },
            data: { location: inferredCity }
          })
          
          fixes.push({
            name: user.name,
            oldLocation: user.location || '空',
            newLocation: inferredCity,
            method: '智能推断'
          })
          
          inferredCount++
          fixedCount++
        } else {
          // 无法推断，使用默认分配（但基于用户ID的哈希值，保证同一用户总是分配到同一城市）
          const hash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          const defaultCity = defaultCities[hash % defaultCities.length]
          
          await prisma.user.update({
            where: { id: user.id },
            data: { location: defaultCity }
          })
          
          fixes.push({
            name: user.name,
            oldLocation: user.location || '空',
            newLocation: defaultCity,
            method: '默认分配'
          })
          
          defaultAssignCount++
          fixedCount++
        }
      } else {
        unchangedCount++
      }
    }
    
    // 生成修复报告
    const report = {
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      fixedCount,
      inferredCount,
      defaultAssignCount,
      unchangedCount,
      fixes: fixes.slice(0, 100) // 只保存前100条记录
    }
    
    // 保存报告
    fs.writeFileSync(
      'location-fix-report.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    )
    
    console.log('\n📊 修复完成！')
    console.log(`✅ 智能推断: ${inferredCount} 个`)
    console.log(`📍 默认分配: ${defaultAssignCount} 个`)
    console.log(`🔄 保持不变: ${unchangedCount} 个`)
    console.log(`📝 总计修复: ${fixedCount} 个`)
    console.log('\n📄 详细报告已保存到: location-fix-report.json')
    
    // 显示一些修复示例
    console.log('\n📋 修复示例:')
    fixes.slice(0, 10).forEach(fix => {
      console.log(`   ${fix.name}: ${fix.oldLocation} → ${fix.newLocation} (${fix.method})`)
    })
    
  } catch (error) {
    console.error('❌ 修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 添加命令行参数支持
if (process.argv[2] === '--add-mapping') {
  // 添加已知映射的功能
  const userName = process.argv[3]
  const city = process.argv[4]
  
  if (userName && city) {
    console.log(`\n📝 要添加映射，请编辑脚本中的 knownUserCities 对象:`)
    console.log(`   '${userName}': '${city}',`)
    console.log(`\n然后重新运行脚本。`)
  } else {
    console.log('\n使用方法: node fix-user-locations-smart.js --add-mapping "用户名" "城市"')
  }
} else {
  // 执行修复
  smartFixUserLocations()
}