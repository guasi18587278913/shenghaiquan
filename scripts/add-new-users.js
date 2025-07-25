const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')

const prisma = new PrismaClient()

// 添加单个用户
async function addSingleUser(userData) {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    const user = await prisma.user.create({
      data: {
        email: userData.email || `${userData.name}@example.com`,
        password: hashedPassword,
        name: userData.name,
        phone: userData.phone || '',
        bio: userData.bio || '',
        location: userData.location || '北京', // 默认北京
        company: userData.company || '',
        position: userData.position || '',
        avatar: userData.avatar || '',
        skills: JSON.stringify(userData.skills || []),
        role: 'USER',
        level: 1,
        points: 0,
        isActive: true
      }
    })
    
    console.log(`✅ 成功添加用户: ${user.name} - ${user.location}`)
    return user
  } catch (error) {
    if (error.code === 'P2002') {
      console.log(`⚠️  用户已存在: ${userData.name}`)
    } else {
      console.error(`❌ 添加用户失败: ${userData.name}`, error.message)
    }
    return null
  }
}

// 从CSV文件批量添加用户（简化版本）
async function addUsersFromCSV(csvPath) {
  try {
    const content = fs.readFileSync(csvPath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      console.log('❌ CSV文件为空或格式错误')
      return 0
    }
    
    // 解析表头
    const headers = lines[0].split(',').map(h => h.trim())
    const users = []
    
    // 解析数据行
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const user = {}
      
      headers.forEach((header, index) => {
        const key = header === '姓名' ? 'name' :
                   header === '城市' ? 'location' :
                   header === '职位' ? 'position' :
                   header === '公司' ? 'company' :
                   header === '手机号' ? 'phone' :
                   header === '简介' ? 'bio' :
                   header === '技能' ? 'skills' :
                   header
        
        if (key === 'skills' && values[index]) {
          user[key] = values[index].split('、')
        } else {
          user[key] = values[index] || ''
        }
      })
      
      if (user.name) {
        users.push(user)
      }
    }
    
    console.log(`📊 准备添加 ${users.length} 个用户...`)
    
    let successCount = 0
    for (const user of users) {
      const result = await addSingleUser(user)
      if (result) successCount++
    }
    
    console.log(`\n✅ 成功添加 ${successCount} 个用户`)
    return successCount
    
  } catch (error) {
    console.error('❌ 读取CSV文件失败:', error.message)
    return 0
  }
}

// 命令行使用示例
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
📝 使用方法:

1. 添加单个用户:
   node scripts/add-new-users.js --single "张三" "上海" "产品经理" "某公司"

2. 从CSV批量添加:
   node scripts/add-new-users.js --csv "新用户名单.csv"

3. 快速测试添加:
   node scripts/add-new-users.js --test
    `)
    return
  }
  
  try {
    if (args[0] === '--single') {
      // 添加单个用户
      const [, name, location, position, company] = args
      if (!name) {
        console.error('❌ 请提供用户姓名')
        return
      }
      
      await addSingleUser({
        name,
        location: location || '北京',
        position: position || '',
        company: company || ''
      })
      
    } else if (args[0] === '--csv') {
      // 从CSV文件添加
      const csvPath = args[1]
      if (!csvPath) {
        console.error('❌ 请提供CSV文件路径')
        return
      }
      
      await addUsersFromCSV(csvPath)
      
    } else if (args[0] === '--test') {
      // 测试添加几个用户
      console.log('🧪 测试模式：添加测试用户...')
      
      const testUsers = [
        { name: '测试用户1', location: '深圳', position: 'AI工程师', company: '测试公司A' },
        { name: '测试用户2', location: '杭州', position: '产品经理', company: '测试公司B' },
        { name: '测试用户3', location: '成都', position: '数据分析师', company: '测试公司C' }
      ]
      
      for (const user of testUsers) {
        await addSingleUser(user)
      }
    }
    
    // 显示更新后的统计
    console.log('\n📊 更新后的统计信息:')
    const totalUsers = await prisma.user.count()
    const locations = await prisma.user.groupBy({
      by: ['location'],
      _count: {
        location: true
      },
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: 5
    })
    
    console.log(`总用户数: ${totalUsers}`)
    console.log('Top 5 城市分布:')
    locations.forEach(loc => {
      console.log(`  ${loc.location}: ${loc._count.location} 人`)
    })
    
  } catch (error) {
    console.error('❌ 错误:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 导出函数供其他脚本使用
module.exports = {
  addSingleUser,
  addUsersFromCSV
}

// 如果直接运行此脚本
if (require.main === module) {
  main()
}