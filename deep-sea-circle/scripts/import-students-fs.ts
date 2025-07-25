import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// 简单的CSV解析函数
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim())
  if (lines.length < 2) return []
  
  // 获取表头
  const headers = lines[0].split(',').map(h => h.trim())
  
  // 解析数据行
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
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
    const csvPath = path.join(process.cwd(), 'data', 'students.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const students = parseCSV(csvContent)
    
    console.log(`📊 读取到 ${students.length} 条数据`)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    // 逐条导入
    for (const [index, student] of students.entries()) {
      try {
        const phone = student['手机号']?.trim()
        const name = student['星球昵称']?.trim() || student['微信昵称']?.trim()
        
        // 跳过没有基本信息的记录
        if (!phone || !name) {
          console.log(`⚠️  跳过第 ${index + 1} 条：缺少必要信息`)
          skipCount++
          continue
        }
        
        // 处理标签
        const tagString = student['个人标签'] || ''
        const tags = tagString
          .split(/[,，;；、\/]+/)
          .map((t: string) => t.trim())
          .filter((t: string) => t && t !== '无')
        
        // 创建用户
        await prisma.user.create({
          data: {
            name: name,
            phone: phone,
            password: await hash('deepsea2024', 10),
            avatar: student['星球头像'] || null,
            bio: student['自我介绍'] || '',
            tags: tags,
            location: student['城市'] || '未知',
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
        errorCount++
        if (error.code === 'P2002') {
          console.log(`⚠️  用户已存在: ${student['星球昵称']} (${student['手机号']})`)
        } else {
          console.error(`❌ 导入失败:`, error.message)
        }
      }
    }
    
    // 打印结果
    console.log('\n📊 导入完成！')
    console.log(`✅ 成功: ${successCount} 条`)
    console.log(`⏭️  跳过: ${skipCount} 条`)
    console.log(`❌ 失败: ${errorCount} 条`)
    
    const total = await prisma.user.count()
    console.log(`\n👥 数据库总用户数: ${total}`)
    
  } catch (error) {
    console.error('❌ 导入过程出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行导入
importStudents()