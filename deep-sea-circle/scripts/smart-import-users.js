const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const prisma = new PrismaClient()

// 智能CSV解析器
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
      // 去除BOM
      const cleanLine = line.replace(/^\uFEFF/, '').trim()
      
      if (!cleanLine) continue

      // 第一行是表头
      if (isFirstLine) {
        this.headers = cleanLine.split(',').map(h => h.trim())
        isFirstLine = false
        continue
      }

      // 检查是否是新用户行（以星球编号开头）
      if (/^\d{4,6},/.test(cleanLine)) {
        // 保存上一个用户
        if (currentUser) {
          const userData = this.parseUserData(currentLine.join('\n'))
          if (userData) {
            this.users.push(userData)
            userCount++
          }
        }

        // 开始新用户
        currentUser = cleanLine
        currentLine = [cleanLine]
      } else {
        // 继续当前用户的多行内容
        if (currentLine.length > 0) {
          currentLine.push(cleanLine)
        }
      }
    }

    // 保存最后一个用户
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
      // 智能分割：处理包含逗号的字段
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

      // 验证必要字段
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

// 导入管理器
class ImportManager {
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

  async previewData(users) {
    console.log('\n📋 数据预览（前10条）：')
    console.log('─'.repeat(80))
    
    users.slice(0, 10).forEach((user, index) => {
      const name = user.星球昵称 || user.微信昵称
      const phone = user.手机号 || `S${user.星球编号}`
      const city = user.城市 || '未知'
      console.log(`${index + 1}. ${name} | ${phone} | ${city}`)
    })
    
    console.log('─'.repeat(80))
    console.log(`... 共 ${users.length} 条数据\n`)
  }

  async clearExistingUsers(keepAdmin = true) {
    console.log('\n🗑️  清理现有用户数据...')
    
    if (keepAdmin) {
      // 保留管理员和助教
      await prisma.user.deleteMany({
        where: {
          role: 'USER'
        }
      })
      console.log('✅ 已清理普通用户，保留管理员和助教')
    } else {
      // 清理所有用户
      await prisma.user.deleteMany({})
      console.log('✅ 已清理所有用户')
    }
  }

  async importUsers(users) {
    console.log('\n🚀 开始导入用户...')
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    const errors = []

    for (const [index, user] of users.entries()) {
      try {
        const name = user.星球昵称?.trim() || user.微信昵称?.trim()
        const studentId = user.星球编号?.toString().trim()
        
        if (!name || !studentId) {
          skipCount++
          continue
        }

        // 生成唯一标识
        const phone = user.手机号?.toString().trim() || `S${studentId}`
        const email = user.微信ID ? `${user.微信ID}@deepseacircle.com` : 
                     studentId ? `${studentId}@deepseacircle.com` : null

        // 检查是否已存在
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

        // 创建用户
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
        
        // 进度提示
        if (successCount % 50 === 0) {
          console.log(`   ✅ 已导入 ${successCount} 个用户...`)
        }
      } catch (error) {
        errorCount++
        errors.push({
          user: user.星球昵称 || user.微信昵称,
          error: error.message
        })
      }
    }

    // 显示结果
    console.log('\n📊 导入完成！')
    console.log(`   ✅ 成功导入: ${successCount} 个`)
    console.log(`   ⏭️  跳过已存在: ${skipCount} 个`)
    console.log(`   ❌ 导入失败: ${errorCount} 个`)

    if (errors.length > 0) {
      console.log('\n❌ 错误详情：')
      errors.slice(0, 5).forEach(e => {
        console.log(`   - ${e.user}: ${e.error}`)
      })
      if (errors.length > 5) {
        console.log(`   ... 还有 ${errors.length - 5} 个错误`)
      }
    }

    // 最终统计
    await this.showCurrentStats()
  }
}

// 主程序
async function main() {
  console.log('🌊 深海圈智能用户导入工具')
  console.log('─'.repeat(50))
  
  const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ 找不到CSV文件:', csvPath)
    return
  }

  try {
    // 初始化
    const parser = new SmartCSVParser(csvPath)
    const manager = new ImportManager()
    await manager.init()

    // 显示当前状态
    await manager.showCurrentStats()

    // 解析CSV
    console.log('\n📖 正在解析CSV文件...')
    const users = await parser.parse()

    // 预览数据
    await manager.previewData(users)

    // 询问用户操作
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log('请选择操作：')
    console.log('1. 清理所有用户后重新导入')
    console.log('2. 清理普通用户后重新导入（保留管理员）')
    console.log('3. 追加导入（不清理现有数据）')
    console.log('4. 取消操作')

    rl.question('\n请输入选项 (1-4): ', async (answer) => {
      switch (answer.trim()) {
        case '1':
          await manager.clearExistingUsers(false)
          await manager.importUsers(users)
          break
        case '2':
          await manager.clearExistingUsers(true)
          await manager.importUsers(users)
          break
        case '3':
          await manager.importUsers(users)
          break
        case '4':
          console.log('❌ 操作已取消')
          break
        default:
          console.log('❌ 无效选项')
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