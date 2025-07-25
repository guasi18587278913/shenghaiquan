const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
  console.log('🔐 深海圈登录功能测试')
  console.log('─'.repeat(50))
  
  try {
    // 1. 随机选择5个用户进行测试
    console.log('\n📋 随机选择5个用户进行登录测试...')
    const users = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        password: true
      }
    })
    
    console.log(`\n找到 ${users.length} 个用户`)
    
    // 2. 测试默认密码
    const defaultPassword = 'deep123456'
    console.log(`\n🔑 使用默认密码测试: ${defaultPassword}`)
    console.log('─'.repeat(50))
    
    for (const user of users) {
      console.log(`\n👤 测试用户: ${user.name}`)
      console.log(`   手机号: ${user.phone}`)
      
      // 验证密码
      const passwordMatch = await bcrypt.compare(defaultPassword, user.password)
      
      if (passwordMatch) {
        console.log(`   ✅ 密码验证成功！`)
      } else {
        console.log(`   ❌ 密码验证失败！`)
      }
    }
    
    // 3. 测试管理员账号
    console.log('\n\n🔑 测试管理员账号...')
    console.log('─'.repeat(50))
    
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        password: true
      }
    })
    
    if (admin) {
      console.log(`\n👤 管理员: ${admin.name}`)
      console.log(`   手机号: ${admin.phone}`)
      
      // 测试几个常见的管理员密码
      const adminPasswords = ['admin123', 'deep123456', 'admin']
      
      for (const testPassword of adminPasswords) {
        const match = await bcrypt.compare(testPassword, admin.password)
        if (match) {
          console.log(`   ✅ 密码验证成功！密码是: ${testPassword}`)
          break
        }
      }
    }
    
    // 4. 统计信息
    console.log('\n\n📊 用户统计信息')
    console.log('─'.repeat(50))
    
    const totalUsers = await prisma.user.count()
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const userCount = await prisma.user.count({ where: { role: 'USER' } })
    
    console.log(`总用户数: ${totalUsers}`)
    console.log(`管理员数: ${adminCount}`)
    console.log(`普通用户数: ${userCount}`)
    
    // 5. 检查是否有用户没有密码
    const noPasswordUsers = await prisma.user.count({
      where: {
        OR: [
          { password: null },
          { password: '' }
        ]
      }
    })
    
    if (noPasswordUsers > 0) {
      console.log(`\n⚠️  警告: 有 ${noPasswordUsers} 个用户没有设置密码！`)
    }
    
  } catch (error) {
    console.error('\n❌ 测试过程中出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行测试
testLogin()