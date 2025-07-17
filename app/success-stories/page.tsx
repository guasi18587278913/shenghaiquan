"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, DollarSign, Clock, Target, Zap } from "lucide-react"
import Link from "next/link"

const successStories = [
  {
    id: 1,
    name: "吴自由",
    role: "前产品经理 → 独立开发者",
    product: "AI Resume Builder",
    description: "智能简历优化工具，帮助求职者提升简历通过率",
    story: "辞职创业3个月，从零收入到月入$520。虽然离之前的工资还有距离，但看到了清晰的增长趋势。",
    metrics: {
      users: "523+",
      conversion: "12%",
      mrr: "$156",
      growth: "+230%",
    },
    tags: ["AI文本", "求职工具", "SaaS"],
    timeline: "3个月",
    highlight: "Product Hunt日榜第5名",
  },
  {
    id: 2,
    name: "林设计师",
    role: "UI设计师 → 产品创始人",
    product: "Logo Maker AI",
    description: "一键生成专业logo，支持多种风格和无限定制",
    story: "设计师背景让我在UI/UX上有优势。从$4.99涨价到$9.99后，转化率反而提升了。",
    metrics: {
      users: "2,100+",
      conversion: "3.2%",
      mrr: "$580",
      retention: "45%",
    },
    tags: ["设计工具", "AI生成", "创意"],
    timeline: "2个月",
    highlight: "即将推出Figma插件",
  },
  {
    id: 3,
    name: "陈创业",
    role: "传统行业 → AI创业者",
    product: "AI Email Assistant",
    description: "智能邮件助手，自动起草和优化商务邮件",
    story: "第一笔订单来的时候激动得睡不着！虽然只有$9.99，但这证明了产品的价值。",
    metrics: {
      users: "89+",
      conversion: "0.8%",
      mrr: "$9.99",
      growth: "刚起步",
    },
    tags: ["效率工具", "商务", "AI写作"],
    timeline: "1个月",
    highlight: "获得第一个付费用户",
  },
  {
    id: 4,
    name: "韩游戏",
    role: "游戏策划 → 工具开发者",
    product: "Game Asset Generator",
    description: "为独立游戏开发者提供AI生成的游戏素材",
    story: "结合游戏行业经验，找到了独立开发者的痛点。Unity插件正在开发中。",
    metrics: {
      users: "200+",
      conversion: "5%",
      mrr: "$800+",
      dailyActive: "45",
    },
    tags: ["游戏开发", "AI素材", "创意工具"],
    timeline: "4个月",
    highlight: "获得知名游戏博主推荐",
  },
  {
    id: 5,
    name: "赵小美",
    role: "视觉设计师 → 开发者",
    product: "Palette AI",
    description: "AI配色方案生成器，一键生成专业配色",
    story: "作为设计师，我知道配色的痛点。虽然产品简单，但这是我迈出的第一步！",
    metrics: {
      users: "450+",
      conversion: "2.1%",
      mrr: "$120",
      rating: "4.8/5",
    },
    tags: ["设计工具", "配色", "创意"],
    timeline: "1.5个月",
    highlight: "Chrome商店精选推荐",
  },
  {
    id: 6,
    name: "刘自媒体",
    role: "内容创作者 → SaaS创始人",
    product: "Content AI Pro",
    description: "专为小红书创作者打造的AI写作助手",
    story: "自媒体积累的粉丝成为种子用户，内容能力帮助产品快速传播。",
    metrics: {
      users: "890+",
      conversion: "8.5%",
      mrr: "$780",
      retention: "62%",
    },
    tags: ["内容创作", "社交媒体", "AI写作"],
    timeline: "2个月",
    highlight: "小红书官方推荐工具",
  },
]

export default function SuccessStoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">学员成功案例</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          从各行各业转型AI产品开发，他们用行动证明：只要开始，就不晚
        </p>
      </div>

      {/* 统计数据 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">89个</p>
            <p className="text-sm text-muted-foreground">已上线产品</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">$45K+</p>
            <p className="text-sm text-muted-foreground">月收入总和</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">15K+</p>
            <p className="text-sm text-muted-foreground">服务用户数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">2.5月</p>
            <p className="text-sm text-muted-foreground">平均开发时间</p>
          </CardContent>
        </Card>
      </div>

      {/* 成功案例列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {successStories.map((story) => (
          <Card key={story.id} className="hover-card h-full flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-lg">{story.product}</CardTitle>
                  <CardDescription className="text-sm">
                    {story.name} · {story.role}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {story.timeline}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{story.description}</p>
            </CardHeader>
            
            <CardContent className="flex-1">
              {/* 引言 */}
              <blockquote className="border-l-2 border-primary pl-4 mb-4 italic text-sm text-muted-foreground">
                "{story.story}"
              </blockquote>

              {/* 关键指标 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-2 bg-secondary rounded">
                  <p className="text-xs text-muted-foreground">用户数</p>
                  <p className="font-semibold">{story.metrics.users}</p>
                </div>
                <div className="text-center p-2 bg-secondary rounded">
                  <p className="text-xs text-muted-foreground">转化率</p>
                  <p className="font-semibold">{story.metrics.conversion}</p>
                </div>
                <div className="text-center p-2 bg-secondary rounded">
                  <p className="text-xs text-muted-foreground">月收入</p>
                  <p className="font-semibold text-primary">{story.metrics.mrr}</p>
                </div>
                <div className="text-center p-2 bg-secondary rounded">
                  <p className="text-xs text-muted-foreground">
                    {story.metrics.growth ? "增长率" : "留存率"}
                  </p>
                  <p className="font-semibold">
                    {story.metrics.growth || story.metrics.retention}
                  </p>
                </div>
              </div>

              {/* 亮点 */}
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">{story.highlight}</p>
              </div>

              {/* 标签 */}
              <div className="flex flex-wrap gap-1">
                {story.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA区域 */}
      <div className="mt-16 text-center py-12 bg-secondary/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">下一个成功案例，就是你</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          无论你是设计师、产品经理、程序员，还是完全的新手，
          深海圈都能帮你实现从想法到产品的跨越
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/courses">
            <Button size="lg" className="btn-gradient">
              开始学习
            </Button>
          </Link>
          <Link href="/feed">
            <Button size="lg" variant="outline">
              加入社区
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}