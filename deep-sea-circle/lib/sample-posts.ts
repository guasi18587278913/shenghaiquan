import { PostType } from "@prisma/client"
import { sampleUsers } from "./sample-users"

// 模拟帖子数据
export const samplePosts = [
  {
    id: "1",
    content: "🎉 深海圈第一期学习营数据报告\n\n时间过得真快，深海圈上线已经一个月了！\n\n一些数据分享：\n- 注册学员：1,234人\n- 活跃学员：823人\n- 提交作业：2,345份\n- 开发项目：156个\n\n感谢大家的支持，我们会继续努力，给大家带来更好的学习体验！实现自己的创业梦！",
    type: "ANNOUNCEMENT" as PostType,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    user: sampleUsers[0], // 刘小排
    tags: JSON.stringify(["数据报告", "社区成长"]),
    isPinned: true,
    _count: {
      likes: 234,
      comments: 56,
    },
  },
  {
    id: "2", 
    content: "深海圈正式上线！欢迎大家加入我们的AI编程学习社区。我们的目标是帮助每个人都能用AI编程，实现自己的创意！\n\n在这里，你将学会：\n- 🚀 从零开始用AI开发产品\n- 💡 将创意变成可盈利的生意\n- 🌍 开拓海外市场机会...",
    type: "GENERAL" as PostType,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2小时前
    user: sampleUsers[0], // 刘小排
    tags: JSON.stringify(["深海圈", "公告", "社区"]),
    _count: {
      likes: 351,
      comments: 89,
    },
  },
  {
    id: "3",
    content: "刚刚用 Claude 完成了一个完整的 Chrome 插件开发！\n\n从想法到上架只用了3天时间，目前已经有200+安装量。\n\n分享几个关键点：\n1. 选择真实痛点（我选择的是标签管理）\n2. MVP先行，功能不要太复杂\n3. UI要简洁美观\n4. 充分利用AI辅助编程\n\n#AI编程 #Chrome插件 #产品开发",
    type: "PROJECT" as PostType,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5小时前
    user: sampleUsers[1], // 张三
    tags: JSON.stringify(["AI编程", "Chrome插件", "产品开发"]),
    _count: {
      likes: 67,
      comments: 12,
    },
  },
  {
    id: "4",
    content: "请教一个技术问题：\n\n我在用 Next.js 开发一个 SaaS 产品，遇到了支付集成的问题。Stripe 和 PayPal 哪个更适合面向海外用户？\n\n有经验的朋友能分享一下吗？",
    type: "HELP" as PostType,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8小时前
    user: sampleUsers[2], // 李四
    tags: JSON.stringify(["支付", "SaaS", "技术问题"]),
    _count: {
      likes: 23,
      comments: 18,
    },
  },
  {
    id: "5",
    content: "分享一个提高 AI 编程效率的小技巧：\n\n与其让 AI 一次性生成大段代码，不如：\n1. 先让它帮你设计架构\n2. 分模块逐步实现\n3. 每个模块都要测试\n4. 遇到问题再针对性优化\n\n这样出错率会大大降低，调试也更容易。",
    type: "TECH_DISCUSSION" as PostType,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12小时前
    user: sampleUsers[3], // 王五
    tags: JSON.stringify(["AI编程", "效率提升", "经验分享"]),
    _count: {
      likes: 156,
      comments: 34,
    },
  },
]