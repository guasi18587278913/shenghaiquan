import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("开始创建种子数据...")
  
  // 清理现有数据（按照依赖顺序）
  console.log("清理现有数据...")
  await prisma.like.deleteMany({})
  await prisma.comment.deleteMany({})
  await prisma.post.deleteMany({})
  await prisma.eventParticipant.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.article.deleteMany({})
  await prisma.progress.deleteMany({})
  await prisma.enrollment.deleteMany({})
  await prisma.chapter.deleteMany({})
  await prisma.course.deleteMany({})
  await prisma.message.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.bookmark.deleteMany({})
  await prisma.user.deleteMany({})
  console.log("数据清理完成")

  // 创建管理员用户 - 刘小排
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { phone: "13800000000" },
    update: {},
    create: {
      phone: "13800000000",
      password: adminPassword,
      name: "刘小排",
      role: "ADMIN",
      bio: "8年AI行业经验，一人打造多款赚钱AI应用。深海圈创始人，用真实盈利产品经验来教学，专注于落地实践技能。",
      skills: JSON.stringify(["AI编程", "产品设计", "商业化", "出海运营", "全栈开发"]),
      location: "北京",
      avatar: "/uploads/avatars/liuxiaopai.jpg",
    },
  })

  // 创建助教用户
  const assistantPassword = await bcrypt.hash("assistant123", 10)
  const assistants = await Promise.all([
    prisma.user.upsert({
      where: { phone: "13900000001" },
      update: {},
      create: {
        phone: "13900000001",
        password: assistantPassword,
        name: "王老师",
        role: "ASSISTANT",
        bio: "资深前端开发者，精通React/Next.js，负责基础篇课程辅导",
        skills: JSON.stringify(["React", "Next.js", "TypeScript", "前端开发"]),
        location: "上海",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13900000002" },
      update: {},
      create: {
        phone: "13900000002",
        password: assistantPassword,
        name: "李助教",
        role: "ASSISTANT",
        bio: "全栈工程师，擅长数据库设计和API开发，负责进阶篇答疑",
        skills: JSON.stringify(["Node.js", "PostgreSQL", "API设计", "Supabase"]),
        location: "深圳",
      },
    }),
  ])

  // 创建多样化的学员用户
  const userPassword = await bcrypt.hash("user123", 10)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { phone: "13700000001" },
      update: {},
      create: {
        phone: "13700000001",
        password: userPassword,
        name: "张明",
        role: "USER",
        bio: "产品经理转型AI开发，目标是做出自己的SaaS产品",
        skills: JSON.stringify(["产品设计", "用户研究", "AI编程初学"]),
        location: "北京",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000002" },
      update: {},
      create: {
        phone: "13700000002",
        password: userPassword,
        name: "李晓华",
        role: "USER",
        bio: "前端开发3年经验，想学习AI提升开发效率",
        skills: JSON.stringify(["Vue.js", "JavaScript", "UI设计"]),
        location: "杭州",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000003" },
      update: {},
      create: {
        phone: "13700000003",
        password: userPassword,
        name: "陈创业",
        role: "USER",
        bio: "连续创业者，寻找AI时代的新机会",
        skills: JSON.stringify(["商业模式", "市场营销", "项目管理"]),
        location: "深圳",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000004" },
      update: {},
      create: {
        phone: "13700000004",
        password: userPassword,
        name: "赵小美",
        role: "USER",
        bio: "设计师背景，想用AI做创意工具",
        skills: JSON.stringify(["UI/UX设计", "Figma", "品牌设计"]),
        location: "上海",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000005" },
      update: {},
      create: {
        phone: "13700000005",
        password: userPassword,
        name: "王工程师",
        role: "USER",
        bio: "后端工程师5年，探索AI辅助编程的可能性",
        skills: JSON.stringify(["Java", "Python", "微服务架构"]),
        location: "广州",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000006" },
      update: {},
      create: {
        phone: "13700000006",
        password: userPassword,
        name: "孙运营",
        role: "USER",
        bio: "运营经理，想开发自动化营销工具",
        skills: JSON.stringify(["数据分析", "增长黑客", "内容营销"]),
        location: "成都",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000007" },
      update: {},
      create: {
        phone: "13700000007",
        password: userPassword,
        name: "周大学生",
        role: "USER",
        bio: "计算机专业大三学生，对AI开发充满好奇",
        skills: JSON.stringify(["C++", "算法", "机器学习基础"]),
        location: "西安",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000008" },
      update: {},
      create: {
        phone: "13700000008",
        password: userPassword,
        name: "吴自由",
        role: "USER",
        bio: "自由职业者，已成功发布2个AI产品",
        skills: JSON.stringify(["全栈开发", "AI应用", "独立开发"]),
        location: "厦门",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000009" },
      update: {},
      create: {
        phone: "13700000009",
        password: userPassword,
        name: "钱投资",
        role: "USER",
        bio: "投资人，学习AI技术更好地评估项目",
        skills: JSON.stringify(["投资分析", "商业评估", "行业研究"]),
        location: "北京",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000010" },
      update: {},
      create: {
        phone: "13700000010",
        password: userPassword,
        name: "郑老师",
        role: "USER",
        bio: "高中信息技术老师，想把AI编程带入课堂",
        skills: JSON.stringify(["教育", "Python教学", "课程设计"]),
        location: "南京",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000011" },
      update: {},
      create: {
        phone: "13700000011",
        password: userPassword,
        name: "冯跨境",
        role: "USER",
        bio: "跨境电商5年，寻找AI工具提升效率",
        skills: JSON.stringify(["电商运营", "数据分析", "供应链管理"]),
        location: "义乌",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000012" },
      update: {},
      create: {
        phone: "13700000012",
        password: userPassword,
        name: "蒋医生",
        role: "USER",
        bio: "医生想开发医疗AI辅助工具",
        skills: JSON.stringify(["医学知识", "数据处理", "产品思维"]),
        location: "武汉",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000013" },
      update: {},
      create: {
        phone: "13700000013",
        password: userPassword,
        name: "沈咨询",
        role: "USER",
        bio: "管理咨询顾问，探索AI在咨询业的应用",
        skills: JSON.stringify(["战略规划", "数据分析", "PPT高手"]),
        location: "上海",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000014" },
      update: {},
      create: {
        phone: "13700000014",
        password: userPassword,
        name: "韩游戏",
        role: "USER",
        bio: "游戏策划，想用AI快速制作游戏原型",
        skills: JSON.stringify(["游戏设计", "Unity基础", "用户心理"]),
        location: "成都",
      },
    }),
    prisma.user.upsert({
      where: { phone: "13700000015" },
      update: {},
      create: {
        phone: "13700000015",
        password: userPassword,
        name: "杨律师",
        role: "USER",
        bio: "律师转型，开发法律AI助手",
        skills: JSON.stringify(["法律知识", "逻辑思维", "文档处理"]),
        location: "深圳",
      },
    }),
  ])

  // 创建完整的课程体系
  const courses = await Promise.all([
    // 入门指南课程
    prisma.course.create({
      data: {
        title: "深海圈学习指南",
        description: "新手必看！了解深海圈的学习路径、社区规则和最佳实践",
        category: "START_HERE",
        level: "BEGINNER",
        isPaid: false,
        isPublished: true,
        order: 1,
        chapters: {
          create: [
            {
              title: "欢迎来到深海圈",
              description: "认识深海圈，了解我们的使命和愿景",
              content: "# 欢迎来到深海圈\n\n深海圈是一个专注于海外AI产品开发的学习社区...",
              order: 1,
              isLocked: false,
              videoUrl: "https://example.com/video1",
              duration: 10,
            },
            {
              title: "学习路径推荐",
              description: "根据你的背景选择最适合的学习路线",
              content: "# 学习路径指南\n\n我们为不同背景的学员设计了个性化学习路径...",
              order: 2,
              isLocked: false,
              duration: 15,
            },
            {
              title: "常见问题FAQ",
              description: "新手最常遇到的问题和解答",
              content: "# 常见问题解答\n\n1. 我没有编程基础能学会吗？\n答：完全可以...",
              order: 3,
              isLocked: false,
              duration: 20,
            },
            {
              title: "快速上手指南",
              description: "第一周应该做什么？跟着这个指南走",
              content: "# 快速上手指南\n\n第一天：环境准备...",
              order: 4,
              isLocked: false,
              duration: 25,
            },
          ],
        },
      },
    }),
    
    // 基础篇课程
    prisma.course.create({
      data: {
        title: "通过AI，10分钟搞定产品雏形",
        description: "零基础入门，体验AI编程的神奇魔力，快速做出你的第一个网站",
        category: "BASIC",
        level: "BEGINNER",
        isPaid: false,
        isPublished: true,
        order: 2,
        chapters: {
          create: [
            {
              title: "认识AI编程工具",
              description: "了解ChatGPT、Claude、Cursor等主流AI编程工具",
              content: "# AI编程工具介绍\n\n在这节课中，我们将认识各种AI编程工具...",
              order: 1,
              isLocked: false,
              duration: 30,
            },
            {
              title: "第一个Hello World",
              description: "用AI生成你的第一个网页",
              content: "# 动手实践\n\n让我们开始第一个项目...",
              order: 2,
              isLocked: false,
              duration: 25,
            },
            {
              title: "快速美化页面",
              description: "使用AI添加样式和交互",
              content: "# 页面美化\n\n学习如何让AI帮你设计漂亮的界面...",
              order: 3,
              isLocked: true,
              unlockType: "SEQUENTIAL",
              duration: 35,
            },
            {
              title: "一键部署上线",
              description: "使用Vercel发布你的第一个网站",
              content: "# 部署上线\n\n将你的作品发布到互联网...",
              order: 4,
              isLocked: true,
              unlockType: "SEQUENTIAL",
              duration: 20,
            },
            {
              title: "项目实战：个人主页",
              description: "综合运用所学知识，做一个完整的个人主页",
              content: "# 项目实战\n\n运用前面学到的知识...",
              order: 5,
              isLocked: true,
              unlockType: "SEQUENTIAL",
              duration: 45,
            },
          ],
        },
      },
    }),
    
    prisma.course.create({
      data: {
        title: "用Cursor AI高效打磨产品",
        description: "深入学习Cursor的高级功能，让AI成为你的最佳编程搭档",
        category: "BASIC",
        level: "BEGINNER",
        isPaid: false,
        isPublished: true,
        order: 3,
        chapters: {
          create: [
            {
              title: "Cursor基础设置",
              description: "配置Cursor，打造高效开发环境",
              content: "# Cursor配置指南...",
              order: 1,
              isLocked: false,
              duration: 20,
            },
            {
              title: "智能代码补全技巧",
              description: "掌握Cursor的代码补全功能",
              content: "# 代码补全技巧...",
              order: 2,
              isLocked: false,
              duration: 30,
            },
            {
              title: "AI对话编程实战",
              description: "通过对话让AI帮你编写复杂功能",
              content: "# AI对话编程...",
              order: 3,
              isLocked: true,
              unlockType: "SEQUENTIAL",
              duration: 40,
            },
            {
              title: "调试与优化",
              description: "利用AI快速定位和修复问题",
              content: "# 调试技巧...",
              order: 4,
              isLocked: true,
              unlockType: "SEQUENTIAL",
              duration: 35,
            },
          ],
        },
      },
    }),
    
    prisma.course.create({
      data: {
        title: "GitHub项目管理入门",
        description: "学会使用GitHub管理代码，与他人协作，展示你的作品集",
        category: "BASIC",
        level: "BEGINNER",
        isPaid: false,
        isPublished: true,
        order: 4,
        chapters: {
          create: [
            {
              title: "Git基础概念",
              description: "理解版本控制的重要性",
              content: "# Git基础...",
              order: 1,
              isLocked: false,
              duration: 25,
            },
            {
              title: "创建第一个仓库",
              description: "动手创建并管理GitHub仓库",
              content: "# 创建仓库...",
              order: 2,
              isLocked: false,
              duration: 20,
            },
            {
              title: "分支与合并",
              description: "掌握Git的核心工作流",
              content: "# 分支管理...",
              order: 3,
              isLocked: true,
              unlockType: "SEQUENTIAL",
              duration: 35,
            },
            {
              title: "团队协作实践",
              description: "Pull Request和代码审查",
              content: "# 团队协作...",
              order: 4,
              isLocked: true,
              unlockType: "SEQUENTIAL",
              duration: 30,
            },
          ],
        },
      },
    }),
    
    // 认知篇课程
    prisma.course.create({
      data: {
        title: "构建产品思维",
        description: "从程序员思维转变为产品思维，理解什么样的产品能赚钱",
        category: "BASIC",
        level: "INTERMEDIATE",
        isPaid: true,
        price: 99,
        isPublished: true,
        order: 5,
        chapters: {
          create: [
            {
              title: "产品的本质与价值",
              description: "理解用户需求和产品价值的关系",
              content: "# 产品思维...",
              order: 1,
              isLocked: false,
              duration: 40,
            },
            {
              title: "MVP最小可行产品",
              description: "如何用最少的资源验证产品idea",
              content: "# MVP理念...",
              order: 2,
              isLocked: true,
              unlockType: "PAID",
              duration: 35,
            },
            {
              title: "海外市场分析",
              description: "为什么要做海外市场？机会在哪里？",
              content: "# 海外市场...",
              order: 3,
              isLocked: true,
              unlockType: "PAID",
              duration: 45,
            },
            {
              title: "商业模式设计",
              description: "SaaS、订阅制、一次性付费的选择",
              content: "# 商业模式...",
              order: 4,
              isLocked: true,
              unlockType: "PAID",
              duration: 50,
            },
            {
              title: "竞品分析方法",
              description: "如何研究和学习成功的产品",
              content: "# 竞品分析...",
              order: 5,
              isLocked: true,
              unlockType: "PAID",
              duration: 40,
            },
          ],
        },
      },
    }),
    
    // 内功篇课程
    prisma.course.create({
      data: {
        title: "Next.js全栈开发精通",
        description: "深入学习Next.js框架，掌握现代Web开发的核心技术栈",
        category: "BASIC",
        level: "INTERMEDIATE",
        isPaid: true,
        price: 199,
        isPublished: true,
        order: 6,
        chapters: {
          create: [
            {
              title: "Next.js核心概念",
              description: "理解SSR、SSG、ISR等概念",
              content: "# Next.js基础...",
              order: 1,
              isLocked: false,
              duration: 45,
            },
            {
              title: "路由与页面",
              description: "App Router的使用技巧",
              content: "# 路由系统...",
              order: 2,
              isLocked: true,
              unlockType: "PAID",
              duration: 40,
            },
            {
              title: "数据获取与API",
              description: "Server Components和API Routes",
              content: "# 数据处理...",
              order: 3,
              isLocked: true,
              unlockType: "PAID",
              duration: 50,
            },
            {
              title: "性能优化",
              description: "图片优化、代码分割、缓存策略",
              content: "# 性能优化...",
              order: 4,
              isLocked: true,
              unlockType: "PAID",
              duration: 45,
            },
            {
              title: "部署与运维",
              description: "生产环境配置和监控",
              content: "# 部署策略...",
              order: 5,
              isLocked: true,
              unlockType: "PAID",
              duration: 35,
            },
            {
              title: "实战项目：SaaS应用",
              description: "完整开发一个SaaS产品",
              content: "# SaaS实战...",
              order: 6,
              isLocked: true,
              unlockType: "PAID",
              duration: 120,
            },
          ],
        },
      },
    }),
    
    prisma.course.create({
      data: {
        title: "数据库设计与Supabase实战",
        description: "掌握数据库设计原则，使用Supabase快速搭建后端",
        category: "BASIC",
        level: "INTERMEDIATE",
        isPaid: true,
        price: 149,
        isPublished: true,
        order: 7,
        chapters: {
          create: [
            {
              title: "数据库基础知识",
              description: "关系型数据库核心概念",
              content: "# 数据库基础...",
              order: 1,
              isLocked: false,
              duration: 40,
            },
            {
              title: "Supabase快速入门",
              description: "认识Supabase，创建第一个项目",
              content: "# Supabase入门...",
              order: 2,
              isLocked: true,
              unlockType: "PAID",
              duration: 35,
            },
            {
              title: "数据表设计实践",
              description: "设计高效的数据结构",
              content: "# 表设计...",
              order: 3,
              isLocked: true,
              unlockType: "PAID",
              duration: 45,
            },
            {
              title: "实时功能开发",
              description: "使用Supabase的实时订阅功能",
              content: "# 实时功能...",
              order: 4,
              isLocked: true,
              unlockType: "PAID",
              duration: 40,
            },
            {
              title: "安全与权限",
              description: "Row Level Security配置",
              content: "# 安全配置...",
              order: 5,
              isLocked: true,
              unlockType: "PAID",
              duration: 50,
            },
          ],
        },
      },
    }),
    
    // 进阶篇课程
    prisma.course.create({
      data: {
        title: "用户登录系统完整实现",
        description: "从零实现生产级的用户认证系统，支持多种登录方式",
        category: "ADVANCED",
        level: "ADVANCED",
        isPaid: true,
        price: 299,
        isPublished: true,
        order: 8,
        chapters: {
          create: [
            {
              title: "认证系统架构设计",
              description: "理解JWT、Session、OAuth等认证方式",
              content: "# 认证架构...",
              order: 1,
              isLocked: false,
              duration: 50,
            },
            {
              title: "NextAuth.js深度实践",
              description: "配置和自定义NextAuth",
              content: "# NextAuth配置...",
              order: 2,
              isLocked: true,
              unlockType: "PAID",
              duration: 60,
            },
            {
              title: "社交登录集成",
              description: "接入Google、GitHub等第三方登录",
              content: "# 社交登录...",
              order: 3,
              isLocked: true,
              unlockType: "PAID",
              duration: 45,
            },
            {
              title: "手机验证码登录",
              description: "实现短信验证码登录系统",
              content: "# 短信登录...",
              order: 4,
              isLocked: true,
              unlockType: "PAID",
              duration: 55,
            },
            {
              title: "安全防护措施",
              description: "防止暴力破解、CSRF等攻击",
              content: "# 安全防护...",
              order: 5,
              isLocked: true,
              unlockType: "PAID",
              duration: 40,
            },
          ],
        },
      },
    }),
    
    prisma.course.create({
      data: {
        title: "Stripe支付系统集成",
        description: "打通支付环节，让你的产品能够收款盈利",
        category: "ADVANCED",
        level: "ADVANCED",
        isPaid: true,
        price: 399,
        isPublished: true,
        order: 9,
        chapters: {
          create: [
            {
              title: "Stripe基础配置",
              description: "注册账号、配置密钥、测试环境搭建",
              content: "# Stripe配置...",
              order: 1,
              isLocked: false,
              duration: 40,
            },
            {
              title: "订阅制实现",
              description: "创建订阅计划、管理订阅生命周期",
              content: "# 订阅系统...",
              order: 2,
              isLocked: true,
              unlockType: "PAID",
              duration: 70,
            },
            {
              title: "一次性支付",
              description: "实现单次购买功能",
              content: "# 单次支付...",
              order: 3,
              isLocked: true,
              unlockType: "PAID",
              duration: 50,
            },
            {
              title: "Webhook处理",
              description: "处理支付回调，同步订单状态",
              content: "# Webhook...",
              order: 4,
              isLocked: true,
              unlockType: "PAID",
              duration: 60,
            },
            {
              title: "账单与发票",
              description: "生成账单、发送发票邮件",
              content: "# 账单系统...",
              order: 5,
              isLocked: true,
              unlockType: "PAID",
              duration: 45,
            },
            {
              title: "退款与争议处理",
              description: "处理退款请求和信用卡争议",
              content: "# 退款处理...",
              order: 6,
              isLocked: true,
              unlockType: "PAID",
              duration: 40,
            },
          ],
        },
      },
    }),
    
    prisma.course.create({
      data: {
        title: "流量获取与SEO优化",
        description: "学习如何为你的产品获取源源不断的免费流量",
        category: "ADVANCED",
        level: "ADVANCED",
        isPaid: true,
        price: 299,
        isPublished: true,
        order: 10,
        chapters: {
          create: [
            {
              title: "SEO基础知识",
              description: "理解搜索引擎的工作原理",
              content: "# SEO基础...",
              order: 1,
              isLocked: false,
              duration: 45,
            },
            {
              title: "关键词研究",
              description: "找到有价值的长尾关键词",
              content: "# 关键词研究...",
              order: 2,
              isLocked: true,
              unlockType: "PAID",
              duration: 50,
            },
            {
              title: "内容营销策略",
              description: "创建能带来流量的内容",
              content: "# 内容营销...",
              order: 3,
              isLocked: true,
              unlockType: "PAID",
              duration: 60,
            },
            {
              title: "技术SEO优化",
              description: "网站速度、结构化数据等",
              content: "# 技术SEO...",
              order: 4,
              isLocked: true,
              unlockType: "PAID",
              duration: 55,
            },
            {
              title: "社交媒体引流",
              description: "利用Reddit、Twitter等平台",
              content: "# 社交引流...",
              order: 5,
              isLocked: true,
              unlockType: "PAID",
              duration: 45,
            },
          ],
        },
      },
    }),
  ])

  // 创建丰富多样的动态内容
  const posts = await Promise.all([
    // 公告类
    prisma.post.create({
      data: {
        userId: admin.id,
        type: "ANNOUNCEMENT",
        content: "🎉 深海圈正式上线！欢迎大家加入我们的AI编程学习社区。我们的目标是帮助每个人都能用AI编程，实现自己的创意！\n\n在这里，你将学会：\n- 🚀 从零开始用AI开发产品\n- 💡 将创意变成可盈利的生意\n- 🌍 开拓海外市场\n- 👥 与志同道合的伙伴共同成长\n\n让我们一起在AI时代创造属于自己的产品！",
        isPinned: true,
        tags: JSON.stringify(["深海圈", "公告", "社区"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: admin.id,
        type: "ANNOUNCEMENT",
        content: "📢 重要通知：第一期线下实战营报名开始！\n\n时间：6月15-16日（周末两天）\n地点：深圳南山区\n人数：限20人\n\n实战营特色：\n- 两天速通一个完整项目\n- 小排老师全程指导\n- 一对一代码review\n- 结识优秀的创业伙伴\n\n报名要求：完成基础篇学习\n\n名额有限，先到先得！",
        tags: JSON.stringify(["线下活动", "实战营", "深圳"]),
      },
    }),
    
    // 项目展示类
    prisma.post.create({
      data: {
        userId: users[7].id, // 吴自由
        type: "PROJECT",
        content: "🎊 我的第二个AI产品上线了！[AI Resume Builder]\n\n产品介绍：\n- 使用AI自动优化简历内容\n- 支持多种模板选择\n- 一键导出PDF\n\n技术栈：Next.js + Supabase + OpenAI API\n\n上线一周数据：\n- 注册用户：523人\n- 付费转化：12%\n- MRR：$156\n\n感谢深海圈的课程，让我能快速实现想法！下一个目标是月收入破$1000 💪",
        tags: JSON.stringify(["项目展示", "AI产品", "成功案例"]),
        images: JSON.stringify(["/uploads/projects/resume-builder.png"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[3].id, // 赵小美
        type: "PROJECT",
        content: "✨ 作为设计师，我终于做出了自己的第一个工具！[Palette AI]\n\n这是一个AI配色方案生成器：\n- 输入描述，AI生成配色方案\n- 支持导出多种格式\n- 集成到Figma插件\n\n虽然还很简单，但这是我的第一步！特别感谢助教的耐心指导，设计师也能写代码！🎨",
        tags: JSON.stringify(["设计工具", "AI应用", "Figma"]),
      },
    }),
    
    // 技术讨论类
    prisma.post.create({
      data: {
        userId: assistants[0].id, // 王助教
        type: "TECH_DISCUSSION",
        content: "【技术分享】Next.js 14 App Router 最佳实践\n\n最近很多同学问到App Router的使用，这里总结几个要点：\n\n1. Server Components vs Client Components\n- 默认都是Server Components\n- 只在需要交互时使用'use client'\n- 数据获取放在Server Components\n\n2. 数据缓存策略\n- 使用fetch自带的缓存\n- revalidate控制更新频率\n- 动态路由的ISR配置\n\n3. 错误处理\n- error.tsx处理组件错误\n- not-found.tsx处理404\n- loading.tsx优化加载体验\n\n详细代码示例见评论区👇",
        tags: JSON.stringify(["Next.js", "技术分享", "最佳实践"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[4].id, // 王工程师
        type: "TECH_DISCUSSION",
        content: "请教一个问题：Supabase的Row Level Security该如何正确配置？\n\n我想实现：\n- 用户只能看到自己的数据\n- 管理员能看到所有数据\n- 某些数据需要公开访问\n\n试了文档的例子但总是报错，有没有大佬帮忙看看？🙏",
        tags: JSON.stringify(["Supabase", "数据库", "求助"]),
      },
    }),
    
    // 经验分享类
    prisma.post.create({
      data: {
        userId: users[2].id, // 陈创业
        type: "EXPERIENCE",
        content: "【创业感悟】从传统行业到AI产品的转型之路\n\n作为一个传统行业的创业者，刚开始学AI编程时真的很迷茫。分享一些心得：\n\n1. 心态调整最重要\n- 不要怕代码，AI能帮你搞定90%\n- 保持初学者心态，不懂就问\n- 相信自己的商业直觉\n\n2. 选择合适的切入点\n- 从自己熟悉的行业找痛点\n- 先做小而美的工具\n- MVP思维，快速验证\n\n3. 坚持比聪明更重要\n- 每天至少4小时学习\n- 遇到bug不要放弃\n- 多和圈友交流\n\n现在回头看，最难的不是技术，而是跨出第一步的勇气。加油，各位！🚀",
        tags: JSON.stringify(["创业", "转型", "心得分享"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[1].id, // 李晓华
        type: "EXPERIENCE",
        content: "分享一个提升开发效率的小技巧：善用AI的上下文！\n\n之前总是一个问题一个问题地问AI，效率很低。后来发现可以：\n\n1. 先给AI看项目结构\n2. 说明整体目标\n3. 分步骤实现\n4. 保持对话连贯性\n\n这样AI给出的代码质量高多了，而且更符合项目风格。\n\nCursor里可以用@符号引用文件，Claude可以直接贴代码，都很方便！",
        tags: JSON.stringify(["AI编程", "效率提升", "技巧"]),
      },
    }),
    
    // 求助问答类
    prisma.post.create({
      data: {
        userId: users[6].id, // 周大学生
        type: "HELP",
        content: "求助：Vercel部署后一直报错怎么办？😭\n\n本地运行完全正常，但部署到Vercel就500错误。\n\n已经检查过：\n- 环境变量都配置了\n- package.json的build命令正确\n- 没有使用fs等Node.js API\n\n错误日志：\nError: Cannot find module '@/lib/db'\n\n有遇到过类似问题的吗？",
        tags: JSON.stringify(["Vercel", "部署问题", "求助"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[10].id, // 冯跨境
        type: "HELP",
        content: "请问有做跨境电商工具的圈友吗？想交流一下\n\n我在做一个亚马逊选品工具，遇到几个问题：\n1. 如何获取产品数据？API太贵了\n2. 数据分析维度该怎么设计？\n3. 用户付费意愿如何？\n\n有经验的朋友可以加我微信：fengkuajing123",
        tags: JSON.stringify(["跨境电商", "选品工具", "交流"]),
      },
    }),
    
    // 线下活动类
    prisma.post.create({
      data: {
        userId: users[0].id, // 张明
        type: "ANNOUNCEMENT",
        content: "【北京圈友聚会】本周日下午，中关村创业大街见！\n\n时间：6月9日（周日）14:00-17:00\n地点：中关村创业大街某咖啡厅\n人数：目前已有8人报名\n\n活动安排：\n- 自我介绍，认识新朋友\n- 项目分享，互相学习\n- 自由交流，资源对接\n\n欢迎北京的圈友参加，评论区报名！☕",
        tags: JSON.stringify(["线下聚会", "北京", "圈友见面"]),
      },
    }),
    
    // 更多学习心得
    prisma.post.create({
      data: {
        userId: users[9].id, // 郑老师
        type: "EXPERIENCE",
        content: "作为一名老师，我是如何将AI编程融入教学的\n\n在高中信息技术课上，我尝试引入AI编程概念：\n\n1. 降低门槛\n- 不讲复杂的编程语法\n- 直接用AI生成代码\n- 重点讲解产品思维\n\n2. 项目驱动\n- 学生自选感兴趣的项目\n- 分组合作开发\n- 期末展示成果\n\n3. 效果显著\n- 学生兴趣大增\n- 作品质量超预期\n- 部分学生已经开始自己创业\n\nAI正在改变教育，让我们拥抱变化！",
        tags: JSON.stringify(["AI教育", "教学创新", "经验分享"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[11].id, // 蒋医生
        type: "PROJECT",
        content: "医疗AI助手初步原型完成！\n\n作为医生，我深知医疗行业的痛点。这个工具主要功能：\n- 病历模板快速生成\n- 用药方案智能推荐\n- 医学术语解释\n\n⚠️ 声明：仅作为辅助工具，不能替代医生诊断\n\n技术栈：Next.js + ChatGPT API + 医学知识库\n\n下一步计划接入更多医学数据库，欢迎医疗行业的朋友一起交流！",
        tags: JSON.stringify(["医疗AI", "行业应用", "项目进展"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: assistants[1].id, // 李助教
        type: "TECH_DISCUSSION",
        content: "【数据库设计精华】如何设计一个可扩展的SaaS数据库\n\n核心原则：\n1. 租户隔离\n- Schema级隔离 vs Row级隔离\n- 选择依据：规模、安全需求、成本\n\n2. 数据分区\n- 按时间分区（日志类数据）\n- 按用户分区（用户数据）\n- 按地域分区（多地域部署）\n\n3. 索引优化\n- 复合索引顺序很重要\n- 避免过度索引\n- 定期分析慢查询\n\n4. 备份策略\n- 定时全量备份\n- 实时增量备份\n- 异地容灾\n\n案例分析和代码示例整理成文档了，需要的同学评论区留言📚",
        tags: JSON.stringify(["数据库设计", "SaaS", "技术干货"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[12].id, // 沈咨询
        type: "EXPERIENCE",
        content: "从管理咨询到AI产品开发：思维模式的转变\n\n做了5年咨询，习惯了PPT和Excel，转型做产品开发真的不容易：\n\n❌ 错误思维：\n- 过度规划，迟迟不动手\n- 追求完美，忽视MVP\n- 只看竞品，不看用户\n\n✅ 正确做法：\n- 快速原型，持续迭代\n- 先跑通，再优化\n- 多听用户反馈\n\n最大的收获：从「建议者」变成「实践者」，这种成就感是做PPT永远体会不到的！",
        tags: JSON.stringify(["转型", "思维转变", "咨询背景"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[13].id, // 韩游戏
        type: "PROJECT",
        content: "游戏开发者的AI工具：Game Asset Generator 🎮\n\n专门为独立游戏开发者打造：\n- AI生成2D游戏素材\n- 支持像素风、卡通风等多种风格\n- 一键导出Sprite Sheet\n\n使用技术：\n- Stable Diffusion API\n- Next.js + Canvas处理\n- 云存储优化\n\n目前日活200+，正在接入Unity插件，欢迎游戏开发的朋友试用！",
        tags: JSON.stringify(["游戏开发", "AI工具", "独立开发"]),
      },
    }),
    
    // 添加一些互动性强的内容
    prisma.post.create({
      data: {
        userId: admin.id,
        type: "ANNOUNCEMENT",
        content: "🔥 深海圈首次线上直播预告！\n\n主题：《如何在一周内开发并上线一个AI产品》\n\n时间：本周五晚8点\n平台：腾讯会议\n\n直播内容：\n1. 现场演示完整开发流程\n2. 分享我的10个赚钱产品经验\n3. 回答大家的问题\n4. 神秘嘉宾分享\n\n评论区预约，开播前会发送链接！",
        tags: JSON.stringify(["直播", "在线活动", "干货分享"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[5].id, // 孙运营
        type: "EXPERIENCE",
        content: "运营视角：如何快速验证产品idea\n\n不要闷头开发3个月，先花3天验证：\n\n1. Landing Page测试\n- 一个简单的落地页\n- 说清楚解决什么问题\n- 放个邮箱收集表单\n- 买点广告测试转化\n\n2. 社群调研\n- Reddit找目标用户社区\n- 发帖介绍你的想法\n- 看评论和反馈\n- 私信深度访谈\n\n3. 竞品分析\n- 不是抄袭，是学习\n- 看用户评论找痛点\n- 分析定价策略\n- 找差异化机会\n\n记住：快速失败比完美的失败好！",
        tags: JSON.stringify(["产品验证", "运营思维", "MVP"]),
      },
    }),
    
    // 新增更多动态内容
    prisma.post.create({
      data: {
        userId: users[8].id, // 刘自媒体
        type: "EXPERIENCE",
        content: "🎯 自媒体人转型AI产品的3个月总结\n\n从日更文章到开发产品，分享一些感悟：\n\n1. 内容创作 vs 产品开发\n- 内容是一次性消费\n- 产品可以持续服务\n- 产品的复利效应更强\n\n2. 我的第一个产品\n- AI写作助手（垂直于小红书）\n- 解决选题、标题、配图问题\n- 上线2周付费用户89人\n\n3. 流量优势\n- 自媒体积累的粉丝是种子用户\n- 内容能力帮助产品推广\n- 用户反馈来得特别快\n\n自媒体人做产品有天然优势，别犹豫了！",
        tags: JSON.stringify(["自媒体", "转型", "AI写作"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[14].id, // 何律师
        type: "HELP",
        content: "请教：AI产品的法律风险如何规避？\n\n作为律师，我在开发法律AI助手时特别关注合规：\n\n我的担心：\n1. AI生成的法律建议准确性\n2. 用户隐私数据保护\n3. 免责条款如何写\n4. 是否需要相关资质\n\n有做过类似产品的朋友吗？如何处理这些问题？",
        tags: JSON.stringify(["法律", "合规", "AI风险"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[4].id, // 王工程师
        type: "TECH_DISCUSSION",
        content: "🔧 性能优化实战：让AI应用响应速度提升10倍\n\n最近优化了自己的AI工具，分享一些经验：\n\n1. 缓存策略\n- Redis缓存热门请求\n- 本地缓存AI响应\n- CDN加速静态资源\n\n2. 并发处理\n- 使用消息队列\n- 限流保护\n- 异步处理长任务\n\n3. 成本优化\n- 根据场景选模型\n- 批量请求合并\n- 预付费套餐\n\n优化后：响应时间从3s降到300ms，成本降低60%！\n\n详细的优化代码放在GitHub了：github.com/xxx",
        tags: JSON.stringify(["性能优化", "技术分享", "成本控制"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: admin.id,
        type: "ANNOUNCEMENT",
        content: "📊 深海圈第一期学习数据报告\n\n时间过得真快，深海圈上线已经一个月了！\n\n一些数据分享：\n- 注册学员：1,234人\n- 完课率：67%（远超行业平均）\n- 上线产品：89个\n- 付费产品：23个\n- 最高月收入：$3,200\n\n看到大家的成长真的很欣慰！\n\n下个月计划：\n1. 新增3门进阶课程\n2. 举办首次线下聚会\n3. 启动优秀项目评选\n\n继续加油，深海圈的朋友们！🚀",
        tags: JSON.stringify(["数据报告", "里程碑", "社区成长"]),
        isPinned: true,
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[2].id, // 陈创业
        type: "PROJECT",
        content: "🎉 第一笔订单来了！！！\n\n刚才收到邮件，Stripe显示有人付费了！！！\n\n虽然只是$9.99，但这是我产品赚到的第一笔钱！\n\n产品：AI邮件助手\n推广：Product Hunt + Twitter\n转化：访问1200次，付费1单\n\n转化率有点低，但是开始了！\n\n感谢深海圈，感谢所有帮助过我的朋友！\n\n下一步：优化落地页，提高转化率！",
        tags: JSON.stringify(["首单", "创业", "里程碑"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[6].id, // 周大学生
        type: "EXPERIENCE",
        content: "大学生做AI产品的优势和劣势\n\n作为大三学生，分享一些体会：\n\n✅ 优势：\n- 时间充裕，可以全力投入\n- 学习能力强，上手快\n- 没有负担，敢于尝试\n- 同学是天然的测试用户\n\n❌ 劣势：\n- 缺乏行业经验\n- 资金有限\n- 商业思维不足\n- 容易过度技术化\n\n我的建议：\n1. 从校园场景入手\n2. 组队互补短板\n3. 多向前辈请教\n4. 保持学习心态\n\n学生时代是最好的创业时机，把握住！",
        tags: JSON.stringify(["大学生", "创业建议", "经验分享"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: assistants[0].id, // 王助教
        type: "TECH_DISCUSSION",
        content: "🛡️ 生产环境部署清单（建议收藏）\n\n很多同学本地开发OK，部署就出问题，整理了一份清单：\n\n1. 环境变量\n□ 所有API密钥配置\n□ 数据库连接字符串\n□ 域名和URL配置\n\n2. 安全设置\n□ HTTPS证书\n□ CORS配置\n□ Rate Limiting\n□ 输入验证\n\n3. 性能优化\n□ 开启压缩\n□ 静态资源CDN\n□ 数据库索引\n□ 缓存策略\n\n4. 监控告警\n□ 错误追踪（Sentry）\n□ 性能监控\n□ 日志收集\n□ 正常运行时间监控\n\n5. 备份恢复\n□ 数据库自动备份\n□ 代码版本控制\n□ 回滚方案\n\n详细配置示例已整理成文档，需要的同学可以找我要！",
        tags: JSON.stringify(["部署", "生产环境", "最佳实践"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[9].id, // 林设计师
        type: "PROJECT",
        content: "设计师的第一个SaaS产品月入$500了！\n\nLogo Maker AI 两个月数据：\n- 注册用户：2,100+\n- 付费转化：3.2%\n- 月收入：$580\n- 用户留存：45%\n\n经验分享：\n1. 设计师做产品的优势是UI/UX\n2. 不要过度设计，先跑通流程\n3. 定价不要太低（我从$4.99涨到$9.99转化率反而上升了）\n\n特别感谢社区的伙伴们，你们的反馈太宝贵了！\n\n下一步：增加更多模板，开发Figma插件！",
        tags: JSON.stringify(["SaaS", "设计工具", "收入分享"]),
      },
    }),
    
    prisma.post.create({
      data: {
        userId: users[7].id, // 吴自由
        type: "EXPERIENCE",
        content: "🌍 全职做AI产品3个月，我学到了什么\n\n辞职创业3个月，分享一些真实感受：\n\n💰 收入变化：\n- 第1个月：$0\n- 第2个月：$156\n- 第3个月：$520\n- 趋势向好，但离之前工资还有距离\n\n🎯 心态变化：\n- 从打工到创业，责任感完全不同\n- 每天都在学习新东西\n- 焦虑与兴奋并存\n\n📈 关键认知：\n- MVP真的很重要，不要追求完美\n- 用户反馈比自己想象重要\n- 营销和产品同样重要\n- 现金流管理要重视\n\n给想全职的朋友建议：\n1. 准备至少6个月生活费\n2. 先做副业验证\n3. 找到同行交流\n4. 保持学习心态\n\n创业不易，但值得尝试！",
        tags: JSON.stringify(["全职创业", "经验分享", "真实数据"]),
      },
    }),
  ])

  // 创建更多评论来增加互动感
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        userId: users[0].id,
        content: "太激动了！终于等到深海圈上线，我要第一个完成所有课程！💪",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        userId: users[1].id,
        content: "支持小排老师！之前看过您的分享，收获很大，这次一定要系统学习一下",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[2].id, // AI Resume Builder项目
        userId: admin.id,
        content: "非常棒的产品！简历场景确实是刚需，转化率12%已经很不错了。建议可以考虑添加领英优化功能，海外市场会更大。",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[2].id,
        userId: users[2].id,
        content: "请问用的是哪个AI模型？我也想做类似的文本优化工具",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[2].id,
        userId: users[7].id,
        content: "@陈创业 用的是GPT-3.5-turbo，成本可控效果也不错。关键是prompt engineering，这个花了不少时间调试",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[4].id, // Next.js技术分享
        userId: users[1].id,
        content: "感谢助教的分享！请问Server Components里面可以直接写数据库查询吗？",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[4].id,
        userId: assistants[0].id,
        content: "@李晓华 可以的！这就是Server Components的优势，可以直接在组件里await数据库查询，不需要额外的API。但要注意做好错误处理。",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[8].id, // Vercel部署求助
        userId: assistants[1].id,
        content: "看错误应该是路径问题。检查一下tsconfig.json里的paths配置，Vercel构建时可能解析不了@符号。试试改成相对路径。",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[8].id,
        userId: users[6].id,
        content: "@李助教 谢谢！改成相对路径就好了，原来是这个问题 🙏",
      },
    }),
    
    // 新增帖子的评论
    prisma.comment.create({
      data: {
        postId: posts[15].id, // 直播预告
        userId: users[3].id,
        content: "已预约！期待小排老师的直播，希望能分享一些选品的经验",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[15].id,
        userId: users[5].id,
        content: "请问会有回放吗？周五晚上可能有事😭",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[18].id, // 数据报告
        userId: users[8].id,
        content: "看到这个数据真的很激动！我也要加油，争取下个月上线自己的产品！",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[19].id, // 第一笔订单
        userId: admin.id,
        content: "恭喜恭喜！第一单是最难忘的，继续加油！转化率低很正常，持续优化就好🚀",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[19].id,
        userId: users[4].id,
        content: "太棒了！我还在等第一单，看到你的分享很受鼓舞！请问你是怎么在Product Hunt推广的？",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[17].id, // 性能优化
        userId: users[11].id,
        content: "太干货了！正好我的工具也遇到了性能问题，马上试试Redis缓存",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[17].id,
        userId: assistants[1].id,
        content: "补充一点：如果是初期产品，可以先用Vercel的Edge Cache，不用额外部署Redis，成本更低",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[22].id, // 设计师月入$500
        userId: users[3].id,
        content: "同样是设计师，看到你的成功很受鼓舞！请问Logo Maker是用什么AI模型生成的？",
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[22].id,
        userId: users[9].id,
        content: "@赵小美 主要用的Stable Diffusion + ControlNet，可以精确控制logo的形状和风格！",
      },
    }),
  ])

  // 创建点赞（为每个帖子添加随机数量的点赞）
  const likes = await Promise.all([
    ...posts.flatMap((post, index) => {
      // 热门帖子获得更多点赞
      const likeCount = Math.min(
        index < 5 ? Math.floor(Math.random() * 8) + 3 : Math.floor(Math.random() * 5) + 1,
        users.length // 确保点赞数不超过用户数
      )
      
      // 为每个帖子创建一个usedUserIds Set
      const usedUserIds = new Set<string>()
      const likesForPost = []
      
      for (let i = 0; i < likeCount; i++) {
        let userId
        let attempts = 0
        do {
          userId = users[Math.floor(Math.random() * users.length)].id
          attempts++
          if (attempts > 50) break // 避免无限循环
        } while (usedUserIds.has(userId))
        
        if (!usedUserIds.has(userId)) {
          usedUserIds.add(userId)
          likesForPost.push(
            prisma.like.create({
              data: {
                userId,
                postId: post.id,
              },
            })
          )
        }
      }
      
      return likesForPost
    }),
  ])

  // 创建课程报名
  await Promise.all([
    // 大部分用户报名了入门课程
    ...users.slice(0, 10).map(user =>
      prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: courses[0].id, // 深海圈学习指南
        },
      })
    ),
    // 部分用户报名了基础课程
    ...users.slice(0, 6).map(user =>
      prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: courses[1].id, // AI 10分钟产品
        },
      })
    ),
  ])

  // 创建一些学习进度
  // TODO: 修复后取消注释
  // await Promise.all([
  //   prisma.progress.create({
  //     data: {
  //       userId: users[0].id,
  //       chapterId: courses[0].id, // 这里应该用实际的chapter ID
  //       isCompleted: true,
  //       completedAt: new Date(),
  //     },
  //   }),
  // ])

  // 创建活动数据
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: "深海圈成立庆典",
        description: "深海圈正式成立，开启AI产品开发新篇章",
        type: "MILESTONE",
        startTime: new Date("2024-05-23"),
        endTime: new Date("2024-05-23"),
        location: "线上",
        organizer: "刘小排老师",
      },
    }),
    prisma.event.create({
      data: {
        title: "首期开营仪式",
        description: "第一期学员开营，450名学员共同启航",
        type: "OFFICIAL_LIVE",
        startTime: new Date("2024-05-23 20:00"),
        endTime: new Date("2024-05-23 22:00"),
        location: "线上直播",
        organizer: "深海圈官方",
      },
    }),
    prisma.event.create({
      data: {
        title: "深圳线下实战营",
        description: "两天一夜，现场指导完成一个完整项目",
        type: "TRAINING_CAMP",
        startTime: new Date("2024-06-15 09:00"),
        endTime: new Date("2024-06-16 18:00"),
        location: "深圳南山区",
        maxParticipants: 20,
        organizer: "深海圈官方",
      },
    }),
    prisma.event.create({
      data: {
        title: "北京圈友聚会",
        description: "北京地区圈友自发组织的线下交流会",
        type: "OFFLINE_MEETUP",
        startTime: new Date("2024-06-09 14:00"),
        endTime: new Date("2024-06-09 17:00"),
        location: "中关村创业大街",
        organizer: "张明 & 北京圈友",
      },
    }),
  ])

  // 创建资讯文章
  const articles = await Promise.all([
    // 行业动态
    prisma.article.create({
      data: {
        title: "GPT-4o发布：AI编程进入新纪元",
        summary: "OpenAI发布GPT-4o，多模态能力大幅提升，为AI产品开发带来新机遇",
        content: "# GPT-4o发布\n\nOpenAI最新发布的GPT-4o带来了革命性的多模态能力，可以同时处理文本、图像和音频。这对AI产品开发者来说意味着巨大的机会...",
        category: "INDUSTRY_NEWS",
        tags: JSON.stringify(["GPT-4o", "OpenAI", "AI技术"]),
        author: admin.id,
        isPublished: true,
        publishedAt: new Date("2024-06-01"),
        viewCount: 1234,
      },
    }),
    prisma.article.create({
      data: {
        title: "Claude Code生态剧变：原生支持Windows，Kimi K2成主流平替",
        summary: "Anthropic官方发布原生支持Windows的Claude Code，同时大量开发者转向Kimi K2作为平替方案",
        content: "# Claude Code生态剧变\n\n随着Anthropic官方封号风险加剧，大量开发者开始寻找替代方案。Kimi K2模型以其85%的平替程度成为主流选择...",
        category: "INDUSTRY_NEWS",
        tags: JSON.stringify(["Claude Code", "Kimi K2", "AI工具"]),
        author: admin.id,
        isPublished: true,
        publishedAt: new Date("2024-07-14"),
        viewCount: 2341,
      },
    }),
    prisma.article.create({
      data: {
        title: "AI编程工具大迁移：从Cursor到Claude Code",
        summary: "为什么越来越多开发者放弃Cursor，转向VS Code + Claude Code的组合",
        content: "# 工具大迁移\n\n随着Claude Code对VS Code的原生支持，开发者发现直接在VS Code中集成CC+K2/Gemini等模型更加灵活...",
        category: "INDUSTRY_NEWS",
        tags: JSON.stringify(["Cursor", "Claude Code", "VS Code"]),
        author: assistants[0].id,
        isPublished: true,
        publishedAt: new Date("2024-07-13"),
        viewCount: 1876,
      },
    }),
    prisma.article.create({
      data: {
        title: "Kiro AI IDE引爆社区：新一代AI编程工具的崛起",
        summary: "Kiro以其创新的Spec->Design->Task工作流和强大的Agent能力，被誉为“结合了所有AI IDE优点的巨型缝合怪”",
        content: "# Kiro AI IDE详解\n\nKiro通过spec.md、design.md、task.md三个文件引导，实现从需求到设计的自动化拆解...",
        category: "INDUSTRY_NEWS",
        tags: JSON.stringify(["Kiro", "AI IDE", "开发工具"]),
        author: assistants[1].id,
        isPublished: true,
        publishedAt: new Date("2024-07-16"),
        viewCount: 3210,
      },
    }),
    
    // 产品案例
    prisma.article.create({
      data: {
        title: "月入1万美元的AI写作工具完整复盘",
        summary: "深度分析一款成功的AI写作工具，从idea到月入万刀的全过程",
        content: "# 产品复盘\n\n这是一个真实的案例。产品从最初的一个简单idea，到最终实现月收入1万美元，中间经历了...",
        category: "PRODUCT_CASE",
        tags: JSON.stringify(["案例分析", "AI写作", "商业模式"]),
        author: admin.id,
        isPublished: true,
        publishedAt: new Date("2024-05-28"),
        viewCount: 2456,
      },
    }),
    prisma.article.create({
      data: {
        title: "AI图像产品跑出5%高转化：3个月获3609单",
        summary: "独立开发者江炜的AI图像站ghiblio.art，上线不到3个月实现5%转化率的成功经验",
        content: "# 成功案例分享\n\n产品ghiblio.art在上线不到3个月内获得3609个付费订单，转化率5%。其成功经验包括：\n\n1. 精准需求挖掘\n2. 快速占位\n3. 低价策略\n4. 社群运营...",
        category: "PRODUCT_CASE",
        tags: JSON.stringify(["成功案例", "AI图像", "转化率"]),
        author: admin.id,
        isPublished: true,
        publishedAt: new Date("2024-07-15"),
        viewCount: 3456,
      },
    }),
    prisma.article.create({
      data: {
        title: "Raphael：一周开发的MicroSaaS成功之路",
        summary: "刘小排老师最新作品Raphael，全部开发周期只有一周，展示了AI时代的开发效率",
        content: "# Raphael案例分析\n\n在2025年1月17日，我上线了一款新产品——Raphael，这是一款典型的MicroSaaS...",
        category: "PRODUCT_CASE",
        tags: JSON.stringify(["MicroSaaS", "快速开发", "案例"]),
        author: admin.id,
        isPublished: true,
        publishedAt: new Date("2024-07-10"),
        viewCount: 2890,
      },
    }),
    
    // 技术前沿
    prisma.article.create({
      data: {
        title: "Cursor编程：让AI成为你的结对程序员",
        summary: "详解Cursor的高级使用技巧，10倍提升编程效率",
        content: "# Cursor深度教程\n\nCursor不仅仅是一个编辑器，它是一个完整的AI辅助开发环境。本文将深入探讨...",
        category: "TECH_FRONTIER",
        tags: JSON.stringify(["Cursor", "AI编程", "效率工具"]),
        author: assistants[0].id,
        isPublished: true,
        publishedAt: new Date("2024-05-25"),
        viewCount: 1876,
      },
    }),
    prisma.article.create({
      data: {
        title: "两句话让Claude Code爬完17个竞品网站",
        summary: "如何利用大模型自动化处理信息收集和分析任务，3小时完成深度市场分析",
        content: "# 自动化市场分析\n\n通过编写脚本，利用精准指令驱动Claude Code和Kimi K2模型，在3小时内自动爬取17个竞品网站...",
        category: "TECH_FRONTIER",
        tags: JSON.stringify(["Claude Code", "自动化", "市场分析"]),
        author: users[1].id,
        isPublished: true,
        publishedAt: new Date("2024-07-12"),
        viewCount: 2103,
      },
    }),
    prisma.article.create({
      data: {
        title: "古法开发vs Vibe Coding：AI编程模式的务实探讨",
        summary: "90%的需求不需要最顶级模型，如何平衡AI生成代码和传统编程的关系",
        content: "# AI编程模式探讨\n\n纯AI生成的代码'AI味'很重，调试和修改成本反而更高。有经验的开发者倾向于...",
        category: "TECH_FRONTIER",
        tags: JSON.stringify(["AI编程", "开发模式", "最佳实践"]),
        author: users[4].id,
        isPublished: true,
        publishedAt: new Date("2024-07-16"),
        viewCount: 1567,
      },
    }),
    
    // 社区动态
    prisma.article.create({
      data: {
        title: "深海圈首期线下实战营完美收官",
        summary: "两天一夜的高强度实战，20位学员成功完成从0到1的产品开发",
        content: "# 实战营回顾\n\n6月15-16日，深海圈首期线下实战营在深圳成功举办。在刘小排老师的亲自指导下...",
        category: "COMMUNITY_NEWS",
        tags: JSON.stringify(["线下活动", "实战营", "社区动态"]),
        author: admin.id,
        isPublished: true,
        publishedAt: new Date("2024-06-17"),
        viewCount: 3890,
      },
    }),
    prisma.article.create({
      data: {
        title: "深海圈学员突破10000人！",
        summary: "里程碑时刻！深海圈成立3个月，注册学员正式突破一万人",
        content: "# 里程碑时刻\n\n今天是值得纪念的一天。深海圈正式突破一万名注册学员！从5月份成立到现在...",
        category: "COMMUNITY_NEWS",
        tags: JSON.stringify(["里程碑", "社区成长", "感谢"]),
        author: admin.id,
        isPublished: true,
        publishedAt: new Date("2024-08-23"),
        viewCount: 5678,
      },
    }),
    
    // 出海经验
    prisma.article.create({
      data: {
        title: "新网站流量增长困境：SEO还是付费投流？",
        summary: "多位新站长反馈建站后无流量，资深开发者分享冷启动经验",
        content: "# 流量增长策略\n\n纯靠SEO获取流量的时代已经过去。新站获得稳定流量至少需3个月，而且需要1000+外链...",
        category: "OVERSEAS_EXP",
        tags: JSON.stringify(["SEO", "流量增长", "出海经验"]),
        author: users[5].id,
        isPublished: true,
        publishedAt: new Date("2024-07-14"),
        viewCount: 4321,
      },
    }),
    prisma.article.create({
      data: {
        title: "海外支付工具风险暴露：如何选择稳定的支付渠道",
        summary: "虚拟卡服务商接连出现问题，海外支付渠道的选择策略",
        content: "# 支付渠道风险\n\nPaygo紫卡被指激活后易触发风控，Wildcard出现提现困难。办理汇丰新加坡VISA卡门槛为50万...",
        category: "OVERSEAS_EXP",
        tags: JSON.stringify(["支付渠道", "风险管理", "出海"]),
        author: users[10].id,
        isPublished: true,
        publishedAt: new Date("2024-07-13"),
        viewCount: 3456,
      },
    }),
    prisma.article.create({
      data: {
        title: "我跑通了全球收付款的流程",
        summary: "详解如何解决出海产品全球收款和支付问题的实操经验",
        content: "# 全球支付解决方案\n\n作为一个出海产品，支付是最关键的环节。本文将分享如何搭建一个稳定的全球支付体系...",
        category: "OVERSEAS_EXP",
        tags: JSON.stringify(["支付系统", "Stripe", "实战经验"]),
        author: users[2].id,
        isPublished: true,
        publishedAt: new Date("2024-07-11"),
        viewCount: 4567,
      },
    }),
  ])

  // 创建一些私信对话
  await prisma.message.create({
    data: {
      senderId: users[0].id,
      receiverId: admin.id,
      content: "小排老师好！我是产品经理背景，想请教一下转型AI开发应该从哪里开始？",
    },
  })

  // 创建一些通知
  await prisma.notification.create({
    data: {
      userId: users[0].id,
      type: "COURSE",
      title: "课程更新",
      content: "《通过AI，10分钟搞定产品雏形》新增实战案例",
      link: `/courses/${courses[1].id}`,
    },
  })

  console.log("种子数据创建完成！")
  console.log("\n=== 账号信息 ===")
  console.log("管理员：13800000000 / admin123 (刘小排)")
  console.log("助教1：13900000001 / assistant123 (王助教)")
  console.log("助教2：13900000002 / assistant123 (李助教)")
  console.log("学员：13700000001-13700000015 / user123")
  console.log("\n=== 数据统计 ===")
  console.log(`创建用户：${users.length + assistants.length + 1}个`)
  console.log(`创建课程：${courses.length}门`)
  console.log(`创建动态：${posts.length}条`)
  console.log(`创建评论：${comments.length}条`)
  console.log(`创建活动：${events.length}个`)
  console.log(`创建文章：${articles.length}篇`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })