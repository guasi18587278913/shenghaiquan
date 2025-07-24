import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// 解析CSV的函数
function parseCSV(content: string): any[] {
  // 移除BOM字符
  content = content.replace(/^\uFEFF/, '')
  
  const lines = content.split('\n')
  if (lines.length < 2) return []
  
  // 获取表头
  const headers = lines[0].split(',').map(h => h.trim())
  
  // 解析数据行（简化版本）
  const data = []
  let currentRow: string[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    
    // 如果行以数字开头，认为是新行
    if (/^\d+,/.test(line)) {
      if (currentRow.length > 0) {
        // 处理上一行
        const values = currentRow.join('\n').split(',')
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }
      currentRow = [line]
    } else {
      // 继续当前行
      if (currentRow.length > 0) {
        currentRow.push(line)
      }
    }
  }
  
  // 处理最后一行
  if (currentRow.length > 0) {
    const values = currentRow.join('\n').split(',')
    const row: any = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    data.push(row)
  }
  
  return data
}

async function importStudents() {
  console.log('🚀 开始导入学员数据...')
  
  try {
    // 读取CSV文件
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ 找不到文件:', csvPath)
      return
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const students = parseCSV(csvContent)
    
    console.log(`📊 读取到 ${students.length} 条数据`)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    let existCount = 0
    
    // 逐条导入
    for (const [index, student] of students.entries()) {
      try {
        // 获取基本信息
        const phone = student['手机号']?.toString().trim()
        const name = student['星球昵称']?.trim() || student['微信昵称']?.trim()
        const studentId = student['星球编号']?.toString().trim()
        
        // 跳过没有基本信息的记录
        if (!name) {
          skipCount++
          continue
        }
        
        // 如果没有手机号，使用星球编号或微信ID作为替代
        const loginId = phone || (studentId ? `S${studentId}` : `wx_${student['微信ID']?.trim() || index}`)
        
        // 处理标签（保存为JSON字符串）
        const tagString = student['个人标签'] || ''
        const tags = tagString
          .split(/[,，;；、\/]+/)
          .map((t: string) => t.trim())
          .filter((t: string) => t && t !== '无' && t.length > 0)
          .slice(0, 5) // 最多5个标签
        
        const skillsJson = JSON.stringify(tags)
        
        // 处理城市信息
        const location = student['城市']?.trim() || '未知'
        
        // 处理自我介绍（限制长度）
        const bio = (student['自我介绍']?.trim() || '').substring(0, 500)
        
        // 行业和身份
        const industry = student['行业']?.trim() || ''
        const identity = student['身份']?.trim() || ''
        
        // 创建用户
        await prisma.user.create({
          data: {
            name: name,
            phone: loginId,
            password: await hash('deepsea2024', 10),
            avatar: student['星球头像']?.trim() || null,
            bio: bio,
            skills: skillsJson, // 使用skills字段存储标签
            location: location,
            company: industry, // 使用company字段存储行业
            position: identity, // 使用position字段存储身份
            role: 'USER',
            points: 100,
            level: 1,
          }
        })
        
        successCount++
        
        // 每50条打印一次进度
        if (successCount % 50 === 0) {
          console.log(`✅ 已成功导入 ${successCount} 条...`)
        }
        
      } catch (error: any) {
        if (error.code === 'P2002') {
          existCount++
        } else {
          errorCount++
          console.error(`❌ 第 ${index + 1} 条导入失败:`, error.message.substring(0, 50))
        }
      }
    }
    
    // 打印结果
    console.log('\n📊 导入完成！')
    console.log(`✅ 成功导入: ${successCount} 条`)
    console.log(`📝 已存在: ${existCount} 条`)
    console.log(`⏭️  跳过: ${skipCount} 条`)
    console.log(`❌ 失败: ${errorCount} 条`)
    console.log(`📊 处理总计: ${students.length} 条`)
    
    const total = await prisma.user.count()
    console.log(`\n👥 数据库总用户数: ${total}`)
    
    // 显示一些统计信息
    if (successCount > 0) {
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { name: true, location: true }
      })
      
      console.log('\n🆕 最新导入的用户:')
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} - ${user.location}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 导入过程出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行导入
importStudents().catch(console.error)