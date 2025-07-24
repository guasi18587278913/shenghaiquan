const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// 中国主要城市列表
const cities = [
  '北京', '上海', '深圳', '广州', '杭州', '成都', '武汉', '西安', 
  '南京', '重庆', '天津', '苏州', '青岛', '大连', '厦门', '郑州',
  '长沙', '合肥', '福州', '昆明', '济南', '哈尔滨', '沈阳', '长春',
  '石家庄', '太原', '南昌', '贵阳', '南宁', '兰州', '银川', '海口'
]

async function fixUserLocations() {
  console.log('🔧 修复用户位置数据...\n')
  
  try {
    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        location: true
      }
    })
    
    console.log(`📊 总用户数: ${users.length}`)
    
    let fixedCount = 0
    let alreadyValidCount = 0
    
    for (const user of users) {
      // 检查location是否是有效的城市名
      const isValidCity = cities.some(city => 
        user.location && user.location.includes(city)
      )
      
      if (!isValidCity || !user.location || user.location.length > 10) {
        // 如果不是有效城市或太长，随机分配一个城市
        const randomCity = cities[Math.floor(Math.random() * cities.length)]
        
        await prisma.user.update({
          where: { id: user.id },
          data: { location: randomCity }
        })
        
        fixedCount++
        
        if (fixedCount % 50 === 0) {
          console.log(`✅ 已修复 ${fixedCount} 个用户的位置...`)
        }
      } else {
        alreadyValidCount++
      }
    }
    
    console.log('\n📊 修复完成:')
    console.log(`  ✅ 修复了 ${fixedCount} 个用户的位置`)
    console.log(`  ✅ ${alreadyValidCount} 个用户已有有效位置`)
    console.log(`  ✅ 总计处理 ${users.length} 个用户`)
    
  } catch (error) {
    console.error('修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserLocations()