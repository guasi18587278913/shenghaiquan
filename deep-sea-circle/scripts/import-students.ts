import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'
import csv from 'csv-parser'

const prisma = new PrismaClient()

// 定义CSV数据的类型
interface StudentData {
  星球成员号: string
  微信昵称: string
  星球昵称: string
  微信ID: string
  星球头像: string
  行业: string
  身份: string
  自我介绍: string
  个人标签: string
  城市: string
  可提供的资源: string
  手机号: string
  微信号: string
  我的标签: string
  你现在的身份: string
}

// 处理标签字符串，转换为数组
function parseTags(tagString: string): string[] {
  if (!tagString || tagString === '无') return []
  
  // 处理多种分隔符：逗号、顿号、分号、斜杠等
  const tags = tagString
    .split(/[,，;；、\/\s]+/)
    .map(tag => tag.trim())
    .filter(tag => tag && tag !== '无')
  
  return [...new Set(tags)] // 去重
}

// 清理和格式化数据
function cleanData(data: StudentData) {
  return {
    studentId: data.星球成员号?.trim() || '',
    wechatName: data.微信昵称?.trim() || '',
    name: data.星球昵称?.trim() || data.微信昵称?.trim() || `学员${data.星球成员号}`,
    wechatId: data.微信ID?.trim() || '',
    avatar: data.星球头像?.trim() || null,
    industry: data.行业?.trim() || '',
    role: data.身份?.trim() || '',
    bio: data.自我介绍?.trim() || '',
    tags: parseTags(data.个人标签),
    city: data.城市?.trim() || '',
    resources: data.可提供的资源?.trim() || '',
    phone: data.手机号?.trim() || '',
    currentStatus: data.你现在的身份?.trim() || ''
  }
}

async function importStudents() {
  console.log('🚀 开始导入学员数据...')
  
  const csvFilePath = path.join(process.cwd(), 'data', 'students.csv')
  
  // 检查文件是否存在
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ 找不到文件:', csvFilePath)
    console.log('请确保将CSV文件放在 data/students.csv')
    return
  }
  
  const students: any[] = []
  let successCount = 0
  let errorCount = 0
  
  // 读取CSV文件
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row: StudentData) => {
      students.push(row)
    })
    .on('end', async () => {
      console.log(`📊 读取到 ${students.length} 条数据`)
      
      // 开始导入
      for (const [index, student] of students.entries()) {
        try {
          const data = cleanData(student)
          
          // 跳过没有手机号和微信ID的记录
          if (!data.phone && !data.wechatId) {
            console.log(`⚠️  跳过第 ${index + 1} 条：缺少联系方式`)
            continue
          }
          
          // 创建用户
          const user = await prisma.user.create({
            data: {
              name: data.name,
              phone: data.phone || `wx_${data.wechatId}`, // 如果没有手机号，用微信ID代替
              password: await hash('123456', 10), // 默认密码
              avatar: data.avatar,
              bio: data.bio,
              tags: data.tags,
              location: data.city,
              role: 'USER',
              points: 100, // 初始积分
              level: 1,    // 初始等级
              
              // 额外信息存储在JSON字段中（如果需要）
              // metadata: {
              //   studentId: data.studentId,
              //   wechatId: data.wechatId,
              //   industry: data.industry,
              //   resources: data.resources,
              //   currentStatus: data.currentStatus
              // }
            }
          })
          
          successCount++
          
          // 每100条打印一次进度
          if ((index + 1) % 100 === 0) {
            console.log(`✅ 已导入 ${index + 1}/${students.length} 条`)
          }
          
        } catch (error: any) {
          errorCount++
          
          // 处理重复数据
          if (error.code === 'P2002') {
            console.log(`⚠️  第 ${index + 1} 条数据已存在：${data.name}`)
          } else {
            console.error(`❌ 导入第 ${index + 1} 条失败:`, error.message)
          }
        }
      }
      
      console.log('\n📊 导入完成!')
      console.log(`✅ 成功: ${successCount} 条`)
      console.log(`❌ 失败: ${errorCount} 条`)
      console.log(`⏭️  跳过: ${students.length - successCount - errorCount} 条`)
      
      // 统计信息
      const totalUsers = await prisma.user.count()
      console.log(`\n👥 数据库中总用户数: ${totalUsers}`)
      
      await prisma.$disconnect()
    })
    .on('error', (error) => {
      console.error('❌ 读取CSV文件失败:', error)
      prisma.$disconnect()
    })
}

// 运行导入
importStudents().catch(console.error)