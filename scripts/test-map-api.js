const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testMapAPIs() {
  try {
    console.log('🔍 Testing Map APIs...\n')

    // 1. Test locations API
    console.log('1. Testing /api/users/locations')
    const locations = await prisma.user.groupBy({
      by: ['location'],
      _count: {
        location: true
      },
      where: {
        location: {
          not: null
        }
      }
    })
    console.log(`✅ Found ${locations.length} unique locations`)
    console.log('Top 3 locations:', locations.slice(0, 3).map(l => `${l.location}: ${l._count.location} users`))

    // 2. Test by-city API
    console.log('\n2. Testing /api/users/by-city?city=上海')
    const shanghaiUsers = await prisma.user.findMany({
      where: {
        location: '上海'
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        position: true,
        company: true,
        role: true
      },
      take: 3,
      orderBy: {
        points: 'desc'
      }
    })
    console.log(`✅ Found ${shanghaiUsers.length} users in 上海`)
    shanghaiUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.name} - ${user.position || 'N/A'}`)
    })

    // 3. Test by-name API
    console.log('\n3. Testing /api/users/by-name?name=阿布')
    const user = await prisma.user.findFirst({
      where: {
        name: '阿布'
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        location: true,
        company: true,
        position: true,
        skills: true,
        role: true,
        level: true,
        points: true,
        createdAt: true
      }
    })
    if (user) {
      console.log(`✅ Found user: ${user.name}`)
      console.log(`   Location: ${user.location}`)
      console.log(`   Bio: ${user.bio ? user.bio.substring(0, 50) + '...' : 'N/A'}`)
    } else {
      console.log('❌ User not found')
    }

    // 4. Check overall statistics
    console.log('\n4. Overall Statistics')
    const totalUsers = await prisma.user.count()
    const usersWithLocation = await prisma.user.count({
      where: {
        location: {
          not: null
        }
      }
    })
    console.log(`✅ Total users: ${totalUsers}`)
    console.log(`✅ Users with location: ${usersWithLocation}`)
    console.log(`✅ Location coverage: ${((usersWithLocation / totalUsers) * 100).toFixed(2)}%`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMapAPIs()