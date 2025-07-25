import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// 解析CSV的函数，处理多行内容
function parseCSV(content: string): any[] {
  // 移除BOM字符
  content = content.replace(/^\uFEFF/, '')
  
  const lines = content.split('\n')
  if (lines.length < 2) return []
  
  // 获取表头
  const headers = lines[0].split(',').map(h => h.trim())
  
  // 解析数据行（处理包含换行的单元格）
  const data = []
  let currentRow = []
  let inQuotes = false
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    
    // 简单处理：如果行以数字开头，认为是新行
    if (/^\d+,/.test(line) && !inQuotes) {
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
    // 读取CSV文件 - 使用实际的文件名
    const csvPath = path.join(process.cwd(), 'data', '海外AI产品 名单 .csv')
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
          console.log(`⚠️  跳过第 ${index + 1} 条：缺少姓名`)
          skipCount++
          continue
        }
        
        // 如果没有手机号，使用星球编号或微信ID作为替代
        const loginId = phone || (studentId ? `S${studentId}` : `wx_${student['微信ID']?.trim() || index}`)
        
        // 处理标签
        const tagString = student['个人标签'] || ''
        const tags = tagString
          .split(/[,，;；、\/]+/)
          .map((t: string) => t.trim())
          .filter((t: string) => t && t !== '无' && t.length > 0)
        
        // 处理城市信息
        const location = student['城市']?.trim() || '未知'
        
        // 处理自我介绍（可能包含换行）
        const bio = student['自我介绍']?.trim() || ''
        
        // 创建用户
        const user = await prisma.user.create({
          data: {
            name: name,
            phone: loginId, // 使用loginId作为登录凭证
            password: await hash('deepsea2024', 10),
            avatar: student['星球头像']?.trim() || null,
            bio: bio.substring(0, 500), // 限制长度
            tags: tags.slice(0, 5), // 最多5个标签
            location: location,
            role: 'USER',
            points: 100,
            level: 1,
          }
        })
        
        successCount++
        if (successCount % 50 === 0) {
          console.log(`✅ 已成功导入 ${successCount} 条...`)
        }
        
      } catch (error: any) {
        if (error.code === 'P2002') {
          existCount++
          // 用户已存在，不打印
        } else {
          errorCount++
          console.error(`❌ 第 ${index + 1} 条导入失败:`, error.message)
          console.log(`   数据: ${student['星球昵称']} - ${student['手机号']}`)
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
    const cities = await prisma.user.groupBy({
      by: ['location'],
      _count: true,
      orderBy: {
        _count: {
          location: 'desc'
        }
      },
      take: 5
    })
    
    console.log('\n🏙️  用户城市分布 TOP 5:')
    cities.forEach((city, index) => {
      console.log(`   ${index + 1}. ${city.location}: ${city._count} 人`)
    })
    
  } catch (error) {
    console.error('❌ 导入过程出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行导入
importStudents()