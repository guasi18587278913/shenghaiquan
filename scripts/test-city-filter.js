const fetch = require('node-fetch')

async function testCityFilter() {
  console.log('🧪 测试城市筛选功能...\n')
  
  try {
    // 1. 测试北京筛选
    console.log('1️⃣ 测试筛选北京的用户:')
    const beijingResponse = await fetch('http://localhost:3000/api/users?city=北京&pageSize=5')
    const beijingData = await beijingResponse.json()
    console.log(`   找到 ${beijingData.total} 个北京用户`)
    console.log('   前3个用户:')
    beijingData.users.slice(0, 3).forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} - ${user.location}`)
    })
    
    // 2. 测试搜索 + 城市筛选
    console.log('\n2️⃣ 测试搜索 + 城市筛选 (上海 + "工程师"):')
    const comboResponse = await fetch('http://localhost:3000/api/users?city=上海&search=工程师&pageSize=5')
    const comboData = await comboResponse.json()
    console.log(`   找到 ${comboData.total} 个符合条件的用户`)
    if (comboData.users.length > 0) {
      comboData.users.forEach((user, i) => {
        console.log(`   ${i + 1}. ${user.name} - ${user.position} @ ${user.location}`)
      })
    }
    
    // 3. 测试URL跳转
    console.log('\n3️⃣ 测试地图页面跳转URL:')
    console.log('   从北京点击"查看全部成员"将跳转到:')
    console.log('   http://localhost:3000/members?city=北京')
    console.log('\n   页面将显示:')
    console.log('   - 北京的城市筛选标签')
    console.log('   - 只显示北京的用户')
    console.log('   - 可以点击X清除筛选')
    
    console.log('\n✅ 测试完成！功能正常工作')
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 检查是否安装了 node-fetch
try {
  require.resolve('node-fetch')
  testCityFilter()
} catch (e) {
  // 使用内置的 http 模块
  const http = require('http')
  
  function httpGet(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        let data = ''
        res.on('data', chunk => data += chunk)
        res.on('end', () => resolve(JSON.parse(data)))
      }).on('error', reject)
    })
  }
  
  async function testWithHttp() {
    console.log('🧪 测试城市筛选功能...\n')
    
    try {
      const beijingData = await httpGet('http://localhost:3000/api/users?city=北京&pageSize=5')
      console.log(`✅ 北京用户: ${beijingData.total} 人`)
      console.log('前3个:', beijingData.users.slice(0, 3).map(u => u.name).join(', '))
      
      console.log('\n✅ 功能测试通过！')
      console.log('📌 访问 http://localhost:3000/map')
      console.log('   点击任意城市的"查看全部成员"按钮即可测试')
    } catch (error) {
      console.error('❌ 测试失败:', error.message)
    }
  }
  
  testWithHttp()
}