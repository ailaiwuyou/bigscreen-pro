import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建种子数据...')

  // 创建演示账号
  const demoPassword = await bcrypt.hash('Demo123456', 10)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@bigscreen.pro' },
    update: {},
    create: {
      email: 'demo@bigscreen.pro',
      username: '演示用户',
      password: demoPassword,
      role: 'USER',
      status: 'ACTIVE',
    },
  })

  console.log('✅ 演示账号创建成功:', demoUser.email)

  // 创建管理员账号
  const adminPassword = await bcrypt.hash('Admin123456', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bigscreen.pro' },
    update: {},
    create: {
      email: 'admin@bigscreen.pro',
      username: '管理员',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ 管理员账号创建成功:', adminUser.email)

  // 创建示例仪表盘
  const demoDashboard = await prisma.dashboard.upsert({
    where: { id: 'demo-dashboard-001' },
    update: {},
    create: {
      id: 'demo-dashboard-001',
      title: '销售数据大屏',
      description: '展示全渠道销售数据的实时监控大屏',
      status: 'PUBLISHED',
      config: {
        width: 1920,
        height: 1080,
        backgroundColor: '#0f1419',
        components: [],
      },
      thumbnail: '/thumbnails/sales-dashboard.png',
      createdBy: demoUser.id,
    },
  })

  console.log('✅ 示例仪表盘创建成功:', demoDashboard.title)

  console.log('\n🎉 种子数据创建完成！')
  console.log('\n可用账号：')
  console.log('  演示账号: demo@bigscreen.pro / Demo123456')
  console.log('  管理员:   admin@bigscreen.pro / Admin123456')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
