const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const prisma = new PrismaClient()

// 智能CSV解析器（与之前相同）
class SmartCSVParser {
  constructor(csvPath) {
    this.csvPath = csvPath
    this.users = []
    this.headers = []
  }

  async parse() {
    const fileStream = fs.createReadStream(this.csvPath)
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    let isFirstLine = true
    let currentUser = null
    let currentLine = []
    let userCount = 0

    for await (const line of rl) {
      const cleanLine = line.replace(/^\uFEFF/, '').trim()
      
      if (!cleanLine) continue

      if (isFirstLine) {
        this.headers = cleanLine.split(',').map(h => h.trim())
        isFirstLine = false
        continue
      }

      if (/^\d{4,6},/.test(cleanLine)) {
        if (currentUser) {
          const userData = this.parseUserData(currentLine.join('\n'))
          if (userData) {
            this.users.push(userData)
            userCount++
          }
        }

        currentUser = cleanLine
        currentLine = [cleanLine]
      } else {
        if (currentLine.length > 0) {
          currentLine.push(cleanLine)
        }
      }
    }

    if (currentUser) {
      const userData = this.parseUserData(currentLine.join('\n'))
      if (userData) {
        this.users.push(userData)
        userCount++
      }
    }

    console.log(`✅ 成功解析 ${userCount} 个用户`)
    return this.users
  }

  parseUserData(rawData) {
    try {
      const parts = this.smartSplit(rawData)
      
      const user = {
        星球编号: parts[0]?.trim() || '',
        微信昵称: parts[1]?.trim() || '',
        星球昵称: parts[2]?.trim() || '',
        微信ID: parts[3]?.trim() || '',
        星球头像: parts[4]?.trim() || '',
        行业: parts[5]?.trim() || '',
        身份: parts[6]?.trim() || '',
        自我介绍: parts[7]?.trim() || '',
        个人标签: parts[8]?.trim() || '',
        城市: parts[9]?.trim() || '',
        可提供的资源: parts[10]?.trim() || '',
        手机号: parts[11]?.trim() || '',
        微信号: parts[12]?.trim() || ''
      }

      if (!user.星球编号 || (!user.星球昵称 && !user.微信昵称)) {
        return null
      }

      return user
    } catch (error) {
      console.error('解析用户数据失败:', error)
      return null
    }
  }

  smartSplit(text) {
    const result = []
    let current = ''
    let inQuote = false
    let quoteChar = ''

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const nextChar = text[i + 1]

      if ((char === '"' || char === '"' || char === '"') && !inQuote) {
        inQuote = true
        quoteChar = char
      } else if (char === quoteChar && inQuote) {
        inQuote = false
        quoteChar = ''
      } else if (char === ',' && !inQuote) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  }
}

// 安全的导入管理器
class SafeImportManager {
  constructor() {
    this.defaultPassword = null
  }

  async init() {
    this.defaultPassword = await bcrypt.hash('deep123456', 10)
  }

  async showCurrentStats() {
    const totalUsers = await prisma.user.count()
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } })
    const userCount = await prisma.user.count({ where: { role: 'USER' } })

    console.log('\n📊 当前数据库状态：')
    console.log(`   总用户数: ${totalUsers}`)
    console.log(`   管理员: ${adminCount}`)
    console.log(`   普通用户: ${userCount}`)
    console.log('')
  }

  async safeClearUsers(keepAdmin = true) {
    console.log('\n🗑️  安全清理用户数据...')
    
    try {
      // 使用事务确保数据一致性
      await prisma.$transaction(async (tx) => {
        if (keepAdmin) {
          // 获取要删除的普通用户ID
          const usersToDelete = await tx.user.findMany({
            where: { role: 'USER' },
            select: { id: true }
          })
          const userIds = usersToDelete.map(u => u.id)

          if (userIds.length > 0) {
            // 先删除关联数据
            console.log('   删除用户相关数据...')
            await tx.bookmark.deleteMany({ where: { userId: { in: userIds } } })
            await tx.like.deleteMany({ where: { userId: { in: userIds } } })
            await tx.comment.deleteMany({ where: { userId: { in: userIds } } })
            await tx.post.deleteMany({ where: { userId: { in: userIds } } })
            await tx.eventParticipant.deleteMany({ where: { userId: { in: userIds } } })
            await tx.enrollment.deleteMany({ where: { userId: { in: userIds } } })
            await tx.progress.deleteMany({ where: { userId: { in: userIds } } })
            await tx.message.deleteMany({ 
              where: { 
                OR: [
                  { senderId: { in: userIds } },
                  { receiverId: { in: userIds } }
                ]
              } 
            })
            await tx.notification.deleteMany({ where: { userId: { in: userIds } } })
            await tx.follow.deleteMany({ 
              where: { 
                OR: [
                  { followerId: { in: userIds } },
                  { followingId: { in: userIds } }
                ]
              } 
            })

            // 最后删除用户
            await tx.user.deleteMany({ where: { id: { in: userIds } } })
            console.log(`   ✅ 已删除 ${userIds.length} 个普通用户及其相关数据`)
          }
        } else {
          // 清空所有数据
          console.log('   清空所有数据...')
          await tx.bookmark.deleteMany({})
          await tx.like.deleteMany({})
          await tx.comment.deleteMany({})
          await tx.post.deleteMany({})
          await tx.eventParticipant.deleteMany({})
          await tx.enrollment.deleteMany({})
          await tx.progress.deleteMany({})
          await tx.message.deleteMany({})
          await tx.notification.deleteMany({})
          await tx.follow.deleteMany({})
          await tx.user.deleteMany({})
          console.log('   ✅ 已清空所有数据')
        }
      })
    } catch (error) {
      console.error('❌ 清理数据失败:', error.message)
      throw error
    }
  }

  async importUsers(users) {
    console.log('\n🚀 开始导入用户...')
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const [index, user] of users.entries()) {
      try {
        const name = user.星球昵称?.trim() || user.微信昵称?.trim()
        const studentId = user.星球编号?.toString().trim()
        
        if (!name || !studentId) {
          skipCount++
          continue
        }

        const phone = user.手机号?.toString().trim() || `S${studentId}`
        const email = user.微信ID ? `${user.微信ID}@deepseacircle.com` : 
                     studentId ? `${studentId}@deepseacircle.com` : null

        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: phone },
              { name: name }
            ]
          }
        })

        if (existing) {
          skipCount++
          continue
        }

        await prisma.user.create({
          data: {
            name: name,
            phone: phone,
            email: email,
            password: this.defaultPassword,
            bio: user.自我介绍?.trim() || null,
            location: user.城市?.trim() || null,
            avatar: user.星球头像?.trim() || null,
            company: user.行业?.trim() || null,
            position: user.身份?.trim() || null,
            skills: user.个人标签 ? JSON.stringify([user.个人标签]) : null,
            role: 'USER',
            level: 1,
            points: 0,
            isActive: true
          }
        })

        successCount++
        
        if (successCount % 50 === 0) {
          console.log(`   ✅ 已导入 ${successCount} 个用户...`)
        }
      } catch (error) {
        errorCount++
        console.error(`   ❌ 导入失败 [${user.星球昵称 || user.微信昵称}]: ${error.message}`)
      }
    }

    console.log('\n📊 导入完成！')
    console.log(`   ✅ 成功导入: ${successCount} 个`)
    console.log(`   ⏭️  跳过已存在: ${skipCount} 个`)
    console.log(`   ❌ 导入失败: ${errorCount} 个`)

    await this.showCurrentStats()
  }
}

// 主程序
async function main() {
  console.log('🌊 深海圈安全用户导入工具 v2.0')
  console.log('─'.repeat(50))
  
  const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ 找不到CSV文件:', csvPath)
    return
  }

  try {
    const parser = new SmartCSVParser(csvPath)
    const manager = new SafeImportManager()
    await manager.init()

    await manager.showCurrentStats()

    console.log('\n📖 正在解析CSV文件...')
    const users = await parser.parse()

    console.log(`\n📋 准备导入 ${users.length} 个用户`)

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log('\n请选择操作：')
    console.log('1. 清理普通用户后导入（保留管理员）- 推荐')
    console.log('2. 直接追加导入（保留所有现有数据）')
    console.log('3. 取消操作')

    rl.question('\n请输入选项 (1-3): ', async (answer) => {
      try {
        switch (answer.trim()) {
          case '1':
            await manager.safeClearUsers(true)
            await manager.importUsers(users)
            break
          case '2':
            await manager.importUsers(users)
            break
          case '3':
            console.log('❌ 操作已取消')
            break
          default:
            console.log('❌ 无效选项')
        }
      } catch (error) {
        console.error('❌ 操作失败:', error.message)
      }
      
      rl.close()
      await prisma.$disconnect()
    })

  } catch (error) {
    console.error('❌ 发生错误:', error)
    await prisma.$disconnect()
  }
}

// 运行主程序
main()