const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

// 从"省/市/区"格式中提取城市名
function extractCityFromAddress(address) {
  if (!address) return null
  
  // 处理格式：北京市/北京市/朝阳区
  const parts = address.split('/')
  if (parts.length >= 2) {
    // 取第二部分（市级）
    let city = parts[1].trim()
    // 去掉"市"后缀
    city = city.replace(/市$/, '')
    return city
  }
  
  // 如果没有斜杠，检查是否包含城市名
  const cityPattern = /(北京|上海|天津|重庆|深圳|广州|杭州|成都|武汉|西安|南京|苏州|厦门|青岛|大连|郑州|长沙|合肥|福州|昆明|济南|哈尔滨|沈阳|长春|石家庄|太原|南昌|贵阳|南宁|兰州|银川|海口)/
  const match = address.match(cityPattern)
  if (match) {
    return match[1]
  }
  
  return null
}

async function restoreOriginalLocations() {
  console.log('🔄 恢复用户的原始位置数据...\n')
  
  try {
    // 读取原始CSV文件
    const csvPath = 'data/海外AI产品 名单 .csv'
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // 手动解析CSV以正确处理逗号
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    // 使用Python脚本来正确解析CSV
    const { execSync } = require('child_process')
    const pythonScript = `
import csv
import json

with open('${csvPath}', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    headers = next(reader)
    users = []
    for row in reader:
        if len(row) >= 10 and row[2]:  # 确保有星球昵称
            users.append({
                'name': row[2].strip(),  # 星球昵称
                'city': row[9].strip() if len(row) > 9 else ''  # 城市
            })
print(json.dumps(users))
`
    
    const result = execSync(`python3 -c "${pythonScript}"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 })
    const csvUsers = JSON.parse(result)
    
    console.log(`📊 从CSV读取到 ${csvUsers.length} 个用户的城市信息`)
    
    let restoredCount = 0
    let notFoundCount = 0
    const fixes = []
    
    // 恢复每个用户的城市信息
    for (const csvUser of csvUsers) {
      if (!csvUser.city) continue
      
      // 从地址中提取城市名
      const extractedCity = extractCityFromAddress(csvUser.city)
      if (!extractedCity) continue
      
      // 更新数据库中的用户
      try {
        const dbUser = await prisma.user.findFirst({
          where: { name: csvUser.name }
        })
        
        if (dbUser) {
          // 只更新那些被错误修改的用户
          if (dbUser.location !== extractedCity) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { location: extractedCity }
            })
            
            fixes.push({
              name: csvUser.name,
              originalAddress: csvUser.city,
              oldLocation: dbUser.location,
              newLocation: extractedCity
            })
            
            restoredCount++
            
            if (restoredCount % 50 === 0) {
              console.log(`✅ 已恢复 ${restoredCount} 个用户...`)
            }
          }
        } else {
          notFoundCount++
        }
      } catch (error) {
        // 忽略单个用户的错误
      }
    }
    
    // 保存恢复报告
    const report = {
      timestamp: new Date().toISOString(),
      restoredCount,
      notFoundCount,
      fixes: fixes.slice(0, 100) // 保存前100条
    }
    
    fs.writeFileSync(
      'location-restore-report.json',
      JSON.stringify(report, null, 2),
      'utf-8'
    )
    
    console.log('\n✅ 恢复完成！')
    console.log(`📍 恢复位置: ${restoredCount} 个`)
    console.log(`❓ 未找到用户: ${notFoundCount} 个`)
    console.log('\n📄 详细报告已保存到: location-restore-report.json')
    
    // 显示一些恢复示例
    console.log('\n📋 恢复示例:')
    fixes.slice(0, 10).forEach(fix => {
      console.log(`   ${fix.name}: ${fix.oldLocation} → ${fix.newLocation} (原始: ${fix.originalAddress})`)
    })
    
    // 特别检查杨昌
    const yangchang = fixes.find(f => f.name === '杨昌')
    if (yangchang) {
      console.log(`\n✅ 杨昌已恢复: ${yangchang.oldLocation} → ${yangchang.newLocation}`)
    }
    
  } catch (error) {
    console.error('❌ 恢复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreOriginalLocations()