import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importStudentsSimple() {
  console.log('🚀 开始导入学员数据（简化版）...')
  
  // 示例数据格式（您可以根据实际情况修改）
  const sampleData = [
    { name: '阿布', phone: '18681538294', city: '广东省/深圳市/龙岗区', tags: '电商打杂' },
    { name: 'Dennis🍃 Lam', phone: '13418096168', city: '广东省/广州市/天河区', tags: '爱分享' },
    { name: '游走边缘', phone: '13450446436', city: '广东省/广州市/天河区', tags: '独立站跨境电商' },
    // 添加更多数据...
  ]
  
  let successCount = 0
  let errorCount = 0
  
  for (const [index, student] of sampleData.entries()) {
    try {
      // 处理标签
      const tags = student.tags ? [student.tags] : []
      
      // 创建用户
      await prisma.user.create({
        data: {
          name: student.name,
          phone: student.phone,
          password: await hash('deepsea2024', 10), // 统一默认密码
          location: student.city || '未知',
          tags: tags,
          role: 'USER',
          points: 100,
          level: 1,
        }
      })
      
      successCount++
      console.log(`✅ ${index + 1}. 导入成功: ${student.name}`)
      
    } catch (error: any) {
      errorCount++
      if (error.code === 'P2002') {
        console.log(`⚠️  ${index + 1}. 已存在: ${student.name} (${student.phone})`)
      } else {
        console.error(`❌ ${index + 1}. 导入失败:`, error.message)
      }
    }
  }
  
  console.log(`\n✅ 导入完成！成功: ${successCount}, 失败: ${errorCount}`)
  
  // 显示总用户数
  const total = await prisma.user.count()
  console.log(`👥 数据库总用户数: ${total}`)
  
  await prisma.$disconnect()
}

// 运行
importStudentsSimple().catch(console.error)