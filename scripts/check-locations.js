const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkLocations() {
  try {
    // 检查前20个用户的位置数据
    const users = await prisma.user.findMany({
      take: 20,
      select: { id: true, name: true, location: true }
    })
    
    console.log('用户位置数据检查:')
    console.log('═'.repeat(80))
    
    users.forEach(u => {
      const locationLength = u.location?.length || 0
      const isTooLong = locationLength > 50
      console.log(`${u.name}: "${u.location}" ${isTooLong ? '⚠️ 太长!' : '✓'}`)
    })
    
    // 统计位置长度
    const allUsers = await prisma.user.findMany({
      select: { location: true }
    })
    
    const longLocations = allUsers.filter(u => u.location && u.location.length > 50).length
    const emptyLocations = allUsers.filter(u => !u.location).length
    
    console.log('\n统计:')
    console.log(`总用户数: ${allUsers.length}`)
    console.log(`位置太长(>50字符): ${longLocations}`)
    console.log(`没有位置: ${emptyLocations}`)
    
  } catch (error) {
    console.error('检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLocations()