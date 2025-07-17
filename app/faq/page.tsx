"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Card } from "@/components/ui/card"

interface FAQItem {
  id: number
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: 1,
    category: "学习路径",
    question: "刚学 NextJS，建议怎么上手？",
    answer: `请花时间完成 NextJS 官方的教程。最好的教程，是 NextJS 官方的教程。如果你觉得看英文太累，一定要找个国内的视频来看的话，我暂且推荐 https://www.bilibili.com/video/BV157pRe8EyD。

学完后请自测，是否完全清楚以下概念：
- 组件（Components）
  - 服务器组件（Server Components）
  - 客户端组件（Client Components）
- Page、API 路由、布局系统（Layouts）
- 中间件（Middleware）、环境变量
- 边缘运行时（Edge Runtime）、App Router
- 数据获取方法、渲染策略
- Streaming 与 Suspense
- 动态导入（Dynamic Imports）`,
  },
  {
    id: 2,
    category: "工具使用",
    question: "为什么我的 Cursor 比别人的更笨？",
    answer: `因为你没有花时间学习「内功」😄

你在玩弄 Cursor 上比别人多花的时间，就是你在「内功篇」比别人少花的时间。请一定要花足量的时间在"补齐内功"上。无论是 NextJS 还是 Supabase，市面上都有无数多的优秀教程了，视频的、图文的都有。`,
  },
  {
    id: 3,
    category: "转型建议",
    question: "我是程序员，怎么入局出海产品？",
    answer: `恭喜你！如果你是程序员，你学习起来比别人更快。

你的路径应该是从分析成功的产品开始。当你遇到一个技术平平、用户量大、团队小的产品时，你应该感到兴奋。你需要应用各种工具，去回答以下问题：
1. 它的用户是怎么来的？
2. 它的用户为什么会付费？
3. 如果我来做，我会怎么做，从而有希望超过它？
4. 这个产品对我有什么启发，我有没有机会做出差异化的功能、差异化的痛点、差异化的获客方式？

并养成习惯。然后，你还需要养成收集抱怨的习惯，去关注生活中的痛点。`,
  },
  {
    id: 4,
    category: "技术问题",
    question: "我在调试 Google 登录的时候，梯子不好用，但正常浏览网页时梯子是好用的。",
    answer: `因为你的梯子使用的是"代理/系统"功能，本质上是一个代理，不是一个真正的系统级微屁恩。

请换成支持 TUN 模式（或"VPN 模式"、或"增强模式"）的梯子客户端软件，并在安装的时候赋予它们系统管理员权限。

例如，我的 Mac 电脑，使用的是 ClashX Pro；而在我的 Windows 电脑上，我直接使用了商业的 VPN 软件，不是代理软件。`,
  },
  {
    id: 5,
    category: "API相关",
    question: "有没有可以联网搜索的大模型 API？",
    answer: "OpenRouter 上的模型都可以，加上一个参数就行。",
  },
  {
    id: 6,
    category: "合规问题",
    question: "为什么我部署海外的网站国内明明可以访问，大家做国内网站，还非要去备案、做 ICP、放到国内呢？",
    answer: `因为：
1. 有被墙的风险，无法保障服务的稳定性。海外的服务器无法被境内监管部门监管，因此，一旦你的网站上出现了一些可能需要被监管的内容，就会立即被墙。
2. 理论上讲，从境外服务器对境内用户提供服务，是违法的。

综上，如果您做的是国内产品，请一定要遵守相关法律法规，取得相应的备案。`,
  },
  {
    id: 7,
    category: "开发问题",
    question: "我每次和cursor对话，终端这里好像都报错，但测试窗口又成功，只是有些小细节需要调整，那我想问下，这个终端报错要处理吗？",
    answer: `遇到这种问题，可以养成 Ctrl+C 停止服务，手动重新 npm run dev 运行服务的习惯～～

另外，不建议让 Cursor 自动帮你启动 npm run dev，那会造成很多困扰。这个服务自己启动、自己管理比较好。`,
  },
  {
    id: 8,
    category: "需求验证",
    question: "如何找到目标用户验证需求？",
    answer: `- 社群调研：Reddit/X的细分板块、竞品评论区挖掘痛点。
- 案例参考：AI工具站可通过Google Ads或SEO关键词（KD<40）引流。
- MVP策略：先上线核心功能（如登录/支付），再根据反馈迭代。`,
  },
  {
    id: 9,
    category: "学习方法",
    question: "如何控制学习进度？",
    answer: `课程的核心思想是分阶段学习和实施，而不是试图一次性完成所有事情或急于从一开始就推出一个完整的产品。

建议路径：
- 遵循手册/结构：理解你正在构建的模块化性质
- 逐步实施：达到一定理解后再开始实战
- 增量解决问题：在构建过程中逐步解决问题
- 学习后增量实现目标：先学会基础，再追求速度

第一个产品需要时间（1-2个月），但随着技能积累，后续开发会越来越快。`,
  },
  {
    id: 10,
    category: "支付风控",
    question: "Stripe风控如何避坑？",
    answer: `为什么必须重视支付风控？
出海SaaS或AI工具项目一旦上线，支付环节是高风险区域。

典型翻车案例：
- 用户用盗刷卡、黑卡尝试下单，支付失败
- 失败订单多，Stripe会怀疑你平台"高风险"，甚至主动封禁
- 一旦封号：账户余额和未结算款项冻结，申诉困难

必做配置：
✅ 启用"高风险卡拦截"
✅ 启用"可疑IP、设备拦截"
✅ 配置"拒绝高风险国家"
✅ 定期查看风控报告，及时拉黑异常用户`,
  },
  {
    id: 11,
    category: "SEO优化",
    question: "什么是 KD 值？如何选择关键词？",
    answer: `KD = Keyword Difficulty（关键词难度系数）

反映的是这个关键词想在 Google 搜索结果前几页排名的难度。KD 越高，竞争越激烈，SEO优化成本越高。

不同平台 KD 值不同的原因：
- 每个平台数据源不同
- 统计口径不一致
- 有的重视外链情况，有的重视页面内容

实战建议：
- 选用自己常用、信任的数据平台，保持统一标准
- KD 只是参考，流量、转化、竞争对手布局同样重要
- 新站建议选择 KD < 40 的关键词`,
  },
  {
    id: 12,
    category: "部署问题",
    question: "本地和线上数据加载速度不一样？",
    answer: `典型原因：
1. 开发模式和生产模式差异
2. 浏览器缓存差异
3. API 代理/网络层差异
4. 数据库和 Supabase 缓存
5. Next.js revalidate / ISR 配置

检查步骤：
- 确认本地是不是 next dev 模式
- 看线上是不是有 revalidate 配置
- 检查浏览器 DevTools，Network 里的 Cache-Control
- 确认 Supabase 是否启用了行级缓存
- 查看 API 响应 Header 对比差异`,
  },
]

const categories = [...new Set(faqData.map(item => item.category))]

export default function FAQPage() {
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("全部")

  const toggleExpand = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const filteredFAQ = selectedCategory === "全部" 
    ? faqData 
    : faqData.filter(item => item.category === selectedCategory)

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">常见问题</h1>
        <p className="text-muted-foreground">
          这里整理了深海圈学员最常遇到的问题和解答，持续更新中...
        </p>
      </div>

      {/* 分类筛选 */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("全部")}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            selectedCategory === "全部"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80"
          }`}
        >
          全部
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ列表 */}
      <div className="space-y-4">
        {filteredFAQ.map(item => (
          <Card key={item.id} className="overflow-hidden">
            <button
              onClick={() => toggleExpand(item.id)}
              className="w-full p-4 text-left hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="text-xs text-muted-foreground mb-1">
                    {item.category}
                  </div>
                  <h3 className="font-medium">{item.question}</h3>
                </div>
                {expandedItems.includes(item.id) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                )}
              </div>
            </button>
            {expandedItems.includes(item.id) && (
              <div className="px-4 pb-4">
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {item.answer}
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredFAQ.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">该分类下暂无问题</p>
        </div>
      )}
    </div>
  )
}