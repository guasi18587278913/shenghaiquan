const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function fixLocationMismatches() {
  console.log('🔧 修复位置不匹配的数据...\n')
  
  try {
    // 读取检查报告
    const report = JSON.parse(fs.readFileSync('data-sync-report.json', 'utf-8'))
    
    console.log(`📊 发现 ${report.mismatches.length} 个位置不匹配的用户`)
    
    let fixedCount = 0
    const fixes = []
    
    // 修复每个不匹配的用户
    for (const mismatch of report.mismatches) {
      if (mismatch.field === 'location' && mismatch.csvExtracted && mismatch.csvExtracted !== '未知') {
        try {
          await prisma.user.updateMany({
            where: { name: mismatch.name },
            data: { location: mismatch.csvExtracted }
          })
          
          fixes.push({
            name: mismatch.name,
            oldLocation: mismatch.db,
            newLocation: mismatch.csvExtracted,
            originalCsv: mismatch.csv
          })
          
          fixedCount++
          console.log(`✅ ${mismatch.name}: ${mismatch.db} → ${mismatch.csvExtracted}`)
        } catch (error) {
          console.error(`❌ 修复 ${mismatch.name} 失败:`, error.message)
        }
      }
    }
    
    console.log(`\n✅ 修复完成！共修复 ${fixedCount} 个用户的位置信息`)
    
    // 保存修复记录
    const fixReport = {
      timestamp: new Date().toISOString(),
      fixedCount,
      fixes
    }
    
    fs.writeFileSync(
      'location-fixes-' + Date.now() + '.json',
      JSON.stringify(fixReport, null, 2),
      'utf-8'
    )
    
  } catch (error) {
    console.error('❌ 修复失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 运行修复
fixLocationMismatches()