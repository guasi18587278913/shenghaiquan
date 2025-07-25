"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ChevronDown, GraduationCap, CreditCard, Settings, Users, Shield, Book, MessageCircle, Video, ThumbsUp, ThumbsDown, Sparkles, HelpCircle, TrendingUp } from "lucide-react"

// FAQ分类配置
const categoryConfig = [
  { id: "learning", label: "学习路径", icon: GraduationCap, color: "from-blue-500 to-indigo-500", bgColor: "from-blue-50 to-indigo-50" },
  { id: "technical", label: "技术开发", icon: Settings, color: "from-orange-500 to-red-500", bgColor: "from-orange-50 to-red-50" },
  { id: "product", label: "产品策略", icon: Sparkles, color: "from-purple-500 to-pink-500", bgColor: "from-purple-50 to-pink-50" },
  { id: "payment", label: "支付风控", icon: CreditCard, color: "from-emerald-500 to-teal-500", bgColor: "from-emerald-50 to-teal-50" },
  { id: "seo", label: "SEO优化", icon: TrendingUp, color: "from-gray-500 to-gray-700", bgColor: "from-gray-50 to-gray-100" }
]

// FAQ数据
const faqData = [
  {
    id: 1,
    category: "learning",
    question: "零基础新手应该怎么开始学习NextJS?",
    answer: `对于零基础新手，建议按照以下路径学习：

**基础阶段（1-2个月）**
1. HTML/CSS基础 - 了解网页结构和样式
2. JavaScript基础 - 变量、函数、数组、对象等
3. React基础 - 组件、状态、生命周期

**进阶阶段（2-3个月）**
1. Next.js官方教程 - 强烈推荐官方的Learn Next.js课程
2. 实战小项目 - 博客、待办事项等
3. 了解服务端渲染(SSR)和静态生成(SSG)

**深入阶段**
- App Router和Server Components
- API Routes开发
- 数据库集成(Prisma/Supabase)
- 部署和优化

**学习资源推荐**
- Next.js官方文档和教程
- YouTube上的Traversy Media
- 深海圈的实战课程

记住：慢就是快，基础打牢才能走得更远！`,
    views: 3456,
    helpful: 298,
    notHelpful: 5
  },
  {
    id: 2,
    category: "learning",
    question: "必须掌握的NextJS核心概念有哪些？",
    answer: `掌握以下核心概念，你就能开发大部分Next.js应用：

**1. 路由系统**
- App Router vs Pages Router
- 动态路由和嵌套路由
- 路由组和并行路由

**2. 渲染模式**
- 客户端渲染(CSR)
- 服务端渲染(SSR) 
- 静态生成(SSG)
- 增量静态再生(ISR)

**3. 数据获取**
- Server Components中的async/await
- 客户端的useEffect和SWR
- Server Actions

**4. 优化技术**
- Image组件和图片优化
- Font优化
- 代码分割和懒加载

**5. API开发**
- API Routes
- 中间件(Middleware)
- 边缘函数

**6. 部署相关**
- 环境变量管理
- 构建优化
- Vercel部署

掌握这些概念后，你就能应对90%的开发场景！`,
    views: 2890,
    helpful: 245,
    notHelpful: 3
  },
  {
    id: 3,
    category: "technical",
    question: "Cursor AI自动补全失效怎么办？",
    answer: `Cursor AI补全失效的常见原因和解决方案：

**1. 检查基础设置**
- 确保AI功能已开启
- 检查是否有可用的API额度
- 重启Cursor编辑器

**2. 网络问题**
- 使用稳定的VPN（推荐节点：美国/日本）
- 检查防火墙设置
- 尝试切换DNS（如8.8.8.8）

**3. 项目配置**
- 清理项目缓存：删除.next文件夹
- 检查.cursorignore文件
- 确保项目文件不要太大

**4. 常见解决步骤**
1. 重启Cursor
2. 检查网络连接
3. 清理缓存：Cmd+Shift+P → "Reload Window"
4. 重新登录账号
5. 检查订阅状态

**5. 备选方案**
- 使用GitHub Copilot
- 尝试VS Code + Continue插件
- 使用ChatGPT辅助编码

如果问题持续，建议在深海圈社区寻求帮助！`,
    views: 4521,
    helpful: 412,
    notHelpful: 8
  },
  {
    id: 4,
    category: "technical",
    question: "本地能跑但线上报错该如何排查？",
    answer: `这是最常见的部署问题，按以下步骤排查：

**1. 环境变量检查**
\`\`\`bash
# 本地.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
# 线上需要改为实际域名
NEXT_PUBLIC_API_URL=https://yourdomain.com
\`\`\`

**2. 构建测试**
\`\`\`bash
# 本地模拟生产环境
npm run build
npm run start
\`\`\`

**3. 常见问题清单**
- Node版本不一致
- 依赖包版本冲突 
- 硬编码的localhost地址
- CORS跨域设置
- 数据库连接字符串

**4. Vercel部署检查**
- Functions日志查看错误
- 环境变量是否正确设置
- 构建日志是否有警告

**5. 调试技巧**
- 使用console.log定位问题
- 检查Network面板的API调用
- 对比本地和线上的构建产物

**预防措施**
- 使用相对路径而非绝对路径
- 环境变量统一管理
- 定期测试生产构建`,
    views: 3678,
    helpful: 334,
    notHelpful: 6
  },
  {
    id: 5,
    category: "product",
    question: "程序员如何进入海外独立开发市场？",
    answer: `程序员转型独立开发的实战指南：

**1. 思维转变**
- 从"技术优先"到"用户优先"
- 从"功能完美"到"快速验证"
- 从"代码质量"到"商业价值"

**2. 市场调研**
- 使用Google Trends分析趋势
- Reddit/Twitter了解用户痛点
- Product Hunt研究竞品
- 关注细分市场而非大市场

**3. MVP开发策略**
- 2-4周完成核心功能
- 使用现成UI组件(shadcn/ui)
- 集成支付(Stripe/Lemon Squeezy)
- 快速部署(Vercel)

**4. 营销获客**
- 写作建立个人品牌
- Twitter/LinkedIn分享进展
- Product Hunt首发
- SEO优化获取长尾流量

**5. 收入模式**
- SaaS订阅(最稳定)
- 一次性购买(LTD)
- 使用量计费(Credits)
- 免费增值(Freemium)

**成功案例**
- Tony Dinh - 年收入$40万+
- Pieter Levels - 12个产品
- Danny Postma - Headshot Pro

开始行动比完美计划更重要！`,
    views: 5234,
    helpful: 489,
    notHelpful: 7
  },
  {
    id: 6,
    category: "product",
    question: "如何找到目标用户并验证需求？",
    answer: `需求验证的系统化方法：

**1. 发现痛点**
- 从自己的问题出发
- 观察身边人的抱怨
- Reddit/论坛的问题帖
- Twitter上的吐槽

**2. 用户画像**
- 具体到一个人(不是一群人)
- 明确TA的职业、年龄、痛点
- 了解TA的付费能力和习惯

**3. 快速验证**
- Landing Page + 邮件收集
- Google/Facebook小额广告测试
- 发帖征集Beta用户
- 预售测试付费意愿

**4. 用户访谈技巧**
- "您现在是如何解决这个问题的？"
- "这个问题给您带来多大困扰？"
- "您愿意为解决方案付费吗？"
- 听>说，不要推销

**5. 验证指标**
- 邮件订阅转化率>20%
- 预售转化率>2%
- NPS分数>50
- 用户主动推荐

**失败信号**
- "这个想法不错"但不付费
- 找不到10个种子用户
- 用户流失率>50%

记住：卖铲子比挖金矿容易！`,
    views: 4123,
    helpful: 378,
    notHelpful: 5
  },
  {
    id: 7,
    category: "payment",
    question: "Stripe风控有哪些坑？如何避免？",
    answer: `Stripe风控经验总结，避免账号被封：

**1. 高危行为（必须避免）**
- 短时间大量测试交易
- 使用虚假信息注册
- 频繁更换IP地址
- 异常的退款率(>5%)

**2. 账号设置优化**
- 完善商家信息
- 添加真实的业务描述
- 上传清晰的产品截图
- 设置合理的账单描述

**3. 交易监控**
- 关注支付成功率
- 及时处理争议订单
- 主动联系可疑交易
- 保持良好的客服响应

**4. 风控配置建议**
\`\`\`javascript
// Radar规则设置
- 3D Secure for high-risk
- Block disposable emails
- Velocity checks
- ZIP code verification
\`\`\`

**5. 备用方案**
- Lemon Squeezy(对国人友好)
- Paddle(自动处理税务)
- Gumroad(简单产品销售)

**6. 最佳实践**
- 逐步提升交易量
- 保持稳定增长曲线
- 及时回复Stripe邮件
- 准备好KYC材料

预防永远比解封容易！`,
    views: 2890,
    helpful: 267,
    notHelpful: 4
  },
  {
    id: 8,
    category: "seo",
    question: "KD值到底是什么？怎么看？",
    answer: `关键词难度(KD)深度解析：

**1. KD值含义**
- 0-10: 非常容易，新站可做
- 11-30: 较容易，需要一些外链
- 31-50: 中等难度，需要优质内容
- 51-70: 困难，需要强大的站点
- 71-100: 极难，大站才能竞争

**2. 不同工具的差异**
- Ahrefs: 基于外链数量
- SEMrush: 综合多个因素
- Moz: 侧重域名权重
- 结论: 参考多个工具

**3. KD值的局限性**
- 只是参考，不是绝对
- 忽略了内容质量因素
- 没考虑用户搜索意图
- 细分领域可能不准

**4. 实战选词策略**
- 新站: KD<20 + 长尾词
- 6个月: KD<40 + 中尾词
- 1年后: 可尝试KD 50+

**5. 比KD更重要的**
- 搜索意图匹配度
- 内容的独特价值
- 用户体验优化
- 持续更新频率

**案例分享**
某学员KD70的词排名第3，因为：
- 内容超级详细(5000字+)
- 解决了具体问题
- 获得自然外链
- 用户停留时间长

KD值参考即可，内容价值才是王道！`,
    views: 3567,
    helpful: 312,
    notHelpful: 6
  },
  {
    id: 9,
    category: "technical",
    question: "如何处理开发环境需要VPN的问题？",
    answer: `开发环境网络配置最佳实践：

**1. 推荐VPN工具**
- ClashX Pro (macOS)
- Clash for Windows
- V2rayN (Windows)
- 稳定节点：美国/日本/新加坡

**2. 终端代理配置**
\`\`\`bash
# macOS/Linux
export https_proxy=http://127.0.0.1:7890
export http_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7890

# 测试是否生效
curl -I https://www.google.com
\`\`\`

**3. Git代理设置**
\`\`\`bash
# 设置代理
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
\`\`\`

**4. npm/yarn配置**
\`\`\`bash
# npm
npm config set proxy http://127.0.0.1:7890
npm config set https-proxy http://127.0.0.1:7890

# yarn 
yarn config set proxy http://127.0.0.1:7890
\`\`\`

**5. 常见问题解决**
- Docker需要在设置中配置代理
- WSL2需要单独配置
- 某些API需要全局代理模式

**6. 备选方案**
- 使用国内镜像源
- GitHub的Gitee镜像
- Cloudflare Workers代理

记得选择稳定的服务商，影响开发效率！`,
    views: 4892,
    helpful: 445,
    notHelpful: 9
  },
  {
    id: 10,
    category: "product",
    question: "如何把V0和starter kit结合？",
    answer: `V0 + Starter Kit的高效开发流程：

**1. 使用V0生成UI组件**
- 描述清楚组件需求
- 选择合适的设计风格
- 导出使用shadcn/ui的代码

**2. 集成到Starter Kit**
\`\`\`bash
# 1. 复制组件代码到components/
# 2. 安装需要的shadcn组件
npx shadcn-ui@latest add button card
# 3. 调整样式匹配项目
\`\`\`

**3. 常见集成问题**
- 样式冲突：检查CSS变量
- 依赖缺失：按提示安装
- TypeScript错误：补充类型定义
- 响应式问题：调整断点

**4. 最佳实践**
- V0负责UI原型
- Starter Kit负责业务逻辑
- 保持组件的独立性
- 做好props类型定义

**5. 推荐工作流**
1. Starter Kit搭建项目框架
2. V0快速生成页面UI
3. 手动优化交互逻辑
4. 集成API和数据库

**实战技巧**
- 用V0生成复杂布局
- 手写简单组件
- 善用V0的迭代功能
- 保持代码整洁

这样可以节省70%的UI开发时间！`,
    views: 3234,
    helpful: 298,
    notHelpful: 4
  }
]

// 热门搜索词
const hotSearches = ["NextJS入门", "Cursor AI", "Stripe风控", "独立开发", "部署问题", "V0使用"]

// 相关视频教程
const relatedVideos = [
  { id: 1, title: "NextJS 14 完整教程", duration: "45:23", views: 12421 },
  { id: 2, title: "Cursor AI 提效指南", duration: "28:15", views: 8756 },
  { id: 3, title: "海外产品从0到1", duration: "35:45", views: 6893 }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [helpfulVotes, setHelpfulVotes] = useState<{[key: number]: 'helpful' | 'notHelpful' | null}>({})
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  // 过滤FAQ
  const filteredFAQ = useMemo(() => {
    let filtered = faqData

    // 按分类过滤
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [selectedCategory, searchTerm])

  // 切换展开状态
  const toggleExpand = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // 投票处理
  const handleVote = (id: number, type: 'helpful' | 'notHelpful') => {
    setHelpfulVotes(prev => ({
      ...prev,
      [id]: prev[id] === type ? null : type
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      {/* Hero区域 */}
      <section className="bg-gradient-to-br from-[#003B46] via-[#07575B] to-[#0891A1] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              深海圈百问百答
            </h1>
            <p className="text-xl opacity-90 mb-8">
              NextJS开发、AI产品、海外独立开发的实战指南
            </p>

            {/* 搜索框 */}
            <div className="relative max-w-2xl mx-auto">
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : ''}`}>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索问题..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 placeholder-gray-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* 搜索时的光晕效果 */}
              {isSearchFocused && (
                <div className="absolute inset-0 -z-10 blur-2xl opacity-50">
                  <div className="h-full w-full bg-white rounded-2xl"></div>
                </div>
              )}
            </div>

            {/* 热门搜索 */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm opacity-80">热门搜索：</span>
              {hotSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-sm backdrop-blur-sm transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 主内容区 */}
            <div className="lg:col-span-3">
              {/* 分类网格 - Bento Box布局 */}
              {!searchTerm && !selectedCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {categoryConfig.map((category) => {
                    const Icon = category.icon
                    const categoryFAQs = faqData.filter(faq => faq.category === category.id)
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className="group relative p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
                      >
                        {/* 背景渐变 */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                        
                        {/* 内容 */}
                        <div className="relative">
                          <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${category.color} mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold mb-1">{category.label}</h3>
                          <p className="text-sm text-gray-600">{categoryFAQs.length} 篇文章</p>
                          
                          {/* 预览问题 */}
                          <div className="mt-4 space-y-1">
                            {categoryFAQs.slice(0, 2).map(faq => (
                              <p key={faq.id} className="text-xs text-gray-500 truncate">
                                • {faq.question}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Hover时的箭头 */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white">
                            →
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* 面包屑导航 */}
              {(searchTerm || selectedCategory) && (
                <div className="mb-6 flex items-center gap-2 text-sm">
                  <button
                    onClick={() => {
                      setSelectedCategory(null)
                      setSearchTerm("")
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    全部分类
                  </button>
                  {selectedCategory && (
                    <>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-900 font-medium">
                        {categoryConfig.find(c => c.id === selectedCategory)?.label}
                      </span>
                    </>
                  )}
                  {searchTerm && (
                    <>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-900">搜索: {searchTerm}</span>
                    </>
                  )}
                </div>
              )}

              {/* FAQ列表 */}
              <div className="space-y-4">
                {filteredFAQ.map((item, index) => {
                  const category = categoryConfig.find(c => c.id === item.category)
                  const Icon = category?.icon || HelpCircle
                  const isExpanded = expandedItems.includes(item.id)
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${category?.color || 'from-gray-400 to-gray-600'} flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1 pr-8">
                              {item.question}
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{category?.label}</span>
                              <span>•</span>
                              <span>{item.views} 次查看</span>
                            </div>
                          </div>
                          
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>
                      
                      {/* 展开的答案 */}
                      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                        <div className="px-6 pb-6">
                          <div className="pl-14 border-l-2 border-gray-100">
                            <div className="pl-6 prose prose-sm max-w-none text-gray-700">
                              <div dangerouslySetInnerHTML={{ __html: item.answer.replace(/\n/g, '<br>') }} />
                            </div>
                            
                            {/* 反馈按钮 */}
                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-600">这篇文章有帮助吗？</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleVote(item.id, 'helpful')}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                                      helpfulVotes[item.id] === 'helpful'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{item.helpful + (helpfulVotes[item.id] === 'helpful' ? 1 : 0)}</span>
                                  </button>
                                  <button
                                    onClick={() => handleVote(item.id, 'notHelpful')}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                                      helpfulVotes[item.id] === 'notHelpful'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                    <span>{item.notHelpful + (helpfulVotes[item.id] === 'notHelpful' ? 1 : 0)}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 无结果提示 */}
              {filteredFAQ.length === 0 && (
                <div className="text-center py-12">
                  <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">未找到相关问题</h3>
                  <p className="text-gray-600 mb-6">试试其他关键词或浏览分类</p>
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedCategory(null)
                    }}
                    className="px-6 py-2 bg-[#0891A1] text-white rounded-full hover:bg-[#07575B] transition-colors"
                  >
                    查看全部问题
                  </button>
                </div>
              )}
            </div>

            {/* 侧边栏 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 热门问题 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  热门问题
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 1, text: "零基础怎么开始学NextJS？" },
                    { id: 5, text: "程序员怎么做海外产品？" },
                    { id: 7, text: "Stripe风控如何避免？" }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        const faq = faqData.find(f => f.id === item.id)
                        if (faq) {
                          setExpandedItems([faq.id])
                          setSearchTerm(faq.question)
                        }
                      }}
                      className="w-full text-left text-sm text-gray-700 hover:text-[#0891A1] transition-colors"
                    >
                      • {item.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* 视频教程 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#0891A1]" />
                  相关视频
                </h3>
                <div className="space-y-3">
                  {relatedVideos.map(video => (
                    <div key={video.id} className="flex items-start gap-3 group cursor-pointer">
                      <div className="w-20 h-12 bg-gray-200 rounded-lg flex-shrink-0 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <div className="w-0 h-0 border-l-[6px] border-l-gray-700 border-y-[4px] border-y-transparent ml-0.5"></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#0891A1] transition-colors line-clamp-2">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {video.duration} • {video.views} 次观看
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 加入社区 */}
              <div className="bg-gradient-to-br from-[#003B46] to-[#0891A1] rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  没找到答案？
                </h3>
                <p className="text-sm opacity-90 mb-4">
                  加入深海圈社区，与10000+开发者一起交流
                </p>
                <button className="w-full bg-white text-[#0891A1] py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  加入社区
                </button>
                <p className="text-xs opacity-80 mt-2 text-center">
                  活跃时间：晚20:00-22:00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 添加动画样式 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}