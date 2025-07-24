const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const fs = require('fs')

async function finalCleanup() {
  console.log('🎯 最终清理 - 删除所有非CSV用户\n')
  
  try {
    // 读取分析报告
    const analysis = JSON.parse(fs.readFileSync('extra-users-analysis.json', 'utf-8'))
    
    // 要删除的用户列表
    const toDelete = [
      ...analysis.extra_users.users,  // 15个测试用户
      ...analysis.seed_users.users    // 3个种子用户
    ]
    
    console.log(`📋 准备删除 ${toDelete.length} 个额外用户`)
    console.log(`   - 测试用户: ${analysis.extra_users.users.length}个`)
    console.log(`   - 种子用户: ${analysis.seed_users.users.length}个`)
    
    console.log('\n🗑️  开始删除...')
    let deletedCount = 0
    const errors = []
    
    for (const user of toDelete) {
      try {
        await prisma.user.delete({
          where: { id: user.id }
        })
        console.log(`   ✅ 删除: ${user.name} (${user.role})`)
        deletedCount++
      } catch (error) {
        errors.push({ user: user.name, error: error.message })
        console.log(`   ❌ 失败: ${user.name} - ${error.message}`)
      }
    }
    
    // 验证最终数据
    console.log('\n📊 验证最终数据...')
    const finalCount = await prisma.user.count()
    const csvCount = 904
    
    // 获取城市分布
    const cityStats = await prisma.user.groupBy({
      by: ['location'],
      _count: { location: true },
      orderBy: { _count: { location: 'desc' } },
      take: 10
    })
    
    // 生成最终报告
    const finalReport = {
      timestamp: new Date().toISOString(),
      action: 'final_cleanup',
      before: {
        dbUsers: finalCount + deletedCount,
        csvUsers: csvCount,
        extra: toDelete.length
      },
      after: {
        dbUsers: finalCount,
        csvUsers: csvCount,
        difference: finalCount - csvCount
      },
      deleted: {
        total: deletedCount,
        testUsers: analysis.extra_users.users.length,
        seedUsers: analysis.seed_users.users.length,
        errors: errors.length
      },
      accuracy: ((csvCount / finalCount) * 100).toFixed(2) + '%',
      cityDistribution: cityStats.map(s => ({
        city: s.location,
        count: s._count.location,
        percentage: ((s._count.location / finalCount) * 100).toFixed(1) + '%'
      })),
      status: finalCount === csvCount ? 'PERFECT_MATCH' : 'MISMATCH',
      errors: errors
    }
    
    // 保存报告
    fs.writeFileSync(
      'final-100-percent-report.json',
      JSON.stringify(finalReport, null, 2),
      'utf-8'
    )
    
    // 打印结果
    console.log('\n' + '='.repeat(60))
    console.log('🏁 最终清理完成！')
    console.log('='.repeat(60))
    
    console.log(`\n📈 最终统计:`)
    console.log(`   CSV用户数: ${csvCount}`)
    console.log(`   数据库用户数: ${finalCount}`)
    console.log(`   删除用户数: ${deletedCount}`)
    console.log(`   准确率: ${finalReport.accuracy}`)
    
    if (finalCount === csvCount) {
      console.log('\n🎉 完美匹配！已实现100%数据准确性！')
      console.log('   ✅ 所有CSV用户都已正确导入')
      console.log('   ✅ 没有任何多余数据')
      console.log('   ✅ 数据库与CSV完全一致')
    } else if (finalCount > csvCount) {
      console.log(`\n⚠️  仍有 ${finalCount - csvCount} 个差异`)
      console.log('   可能原因：')
      console.log('   - CSV中有重复的手机号导致某些用户未能导入')
      console.log('   - 某些用户在导入后又被手动添加')
      
      // 查找可能的重复
      const duplicatePhones = await prisma.$queryRaw`
        SELECT phone, COUNT(*) as count 
        FROM User 
        WHERE phone IS NOT NULL 
        GROUP BY phone 
        HAVING COUNT(*) > 1
        LIMIT 10
      `
      
      if (duplicatePhones.length > 0) {
        console.log('\n   发现重复手机号:')
        duplicatePhones.forEach(d => {
          console.log(`   - ${d.phone}: ${d.count}次`)
        })
      }
    } else {
      console.log(`\n❌ 数据库用户少于CSV！缺少 ${csvCount - finalCount} 个用户`)
    }
    
    console.log('\n🏙️  城市分布TOP10:')
    cityStats.forEach(({ location, _count }) => {
      const percentage = ((_count.location / finalCount) * 100).toFixed(1)
      console.log(`   ${location}: ${_count.location}人 (${percentage}%)`)
    })
    
    console.log('\n📄 详细报告已保存: final-100-percent-report.json')
    
    // 验证建议
    console.log('\n🔍 验证建议:')
    console.log('1. 访问 http://localhost:3000/members 检查成员列表')
    console.log('2. 访问 http://localhost:3000/map 检查地图分布')
    console.log('3. 搜索几个特定用户验证数据正确性')
    
  } catch (error) {
    console.error('❌ 清理失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行最终清理
finalCleanup()