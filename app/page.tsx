import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, BookOpen, Trophy, MessageCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with gradient background */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text">深海圈</h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-8 text-foreground">海外AI产品开发学习社区</h2>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              从 Idea to Business，用 AI 编程，兑现你的创意。<br />
              跟随刘小排老师，掌握从产品开发到商业变现的全流程。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" className="btn-gradient w-full sm:w-auto px-8">
                  开始学习
                </Button>
              </Link>
              <Link href="/feed">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                  加入社区
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 数据统计 */}
      <section className="py-16 md:py-20 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">10,000+</div>
              <div className="text-sm md:text-base text-muted-foreground">注册学员</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">28</div>
              <div className="text-sm md:text-base text-muted-foreground">精品课程</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">50+</div>
              <div className="text-sm md:text-base text-muted-foreground">成功案例</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3">24/7</div>
              <div className="text-sm md:text-base text-muted-foreground">社区支持</div>
            </div>
          </div>
        </div>
      </section>

      {/* 核心特色 */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16">为什么选择深海圈？</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <Card className="hover-card h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                  <Trophy className="h-6 w-6 md:h-7 md:w-7 text-primary flex-shrink-0" />
                  实战派导师
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  刘小排老师8年AI行业经验，一人打造多款赚钱AI应用，
                  用真实盈利产品经验来教学，专注于落地实践技能。
                </p>
              </CardContent>
            </Card>

            <Card className="hover-card h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                  <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-primary flex-shrink-0" />
                  系统化课程
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  从基础篇到进阶篇，涵盖需求挖掘、产品设计、AI实现、
                  用户获取、产品迭代及商业变现的完整流程。
                </p>
              </CardContent>
            </Card>

            <Card className="hover-card h-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg md:text-xl">
                  <Users className="h-6 w-6 md:h-7 md:w-7 text-primary flex-shrink-0" />
                  活跃社区
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  与同频圈友深度交流，专属社群答疑服务，
                  紧跟海外AI产品趋势，成长为独当一面的开发者。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 学习路径 */}
      <section className="py-16 md:py-20 bg-secondary/10">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16">清晰的学习路径</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl md:text-2xl shadow-lg">
                1
              </div>
              <h3 className="font-semibold mb-3 text-lg md:text-xl">基础篇</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                10分钟搞定产品雏形，快速上手AI编程
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl md:text-2xl shadow-lg">
                2
              </div>
              <h3 className="font-semibold mb-3 text-lg md:text-xl">认知篇</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                构建产品思维，理解商业本质
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl md:text-2xl shadow-lg">
                3
              </div>
              <h3 className="font-semibold mb-3 text-lg md:text-xl">内功篇</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                补齐技术硬实力，掌握核心技术栈
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl md:text-2xl shadow-lg">
                4
              </div>
              <h3 className="font-semibold mb-3 text-lg md:text-xl">进阶篇</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                打造持续盈利的成熟产品
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 成功案例 */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-12 md:mb-16">学员成功案例</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <Card className="hover-card h-full">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">AI Resume Builder</CardTitle>
                <CardDescription className="text-sm md:text-base">@吴自由 · 自由职业者</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                  使用AI自动优化简历内容，支持多种模板选择，一键导出PDF。
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">注册用户</span>
                    <span className="font-semibold">523人</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">付费转化</span>
                    <span className="font-semibold">12%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">MRR</span>
                    <span className="font-semibold text-primary">$156</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-card h-full">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Palette AI</CardTitle>
                <CardDescription className="text-sm md:text-base">@赵小美 · 设计师</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                  AI配色方案生成器，输入描述即可生成专业配色，支持Figma插件。
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">日活用户</span>
                    <span className="font-semibold">200+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">好评率</span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">插件安装</span>
                    <span className="font-semibold text-primary">1.2K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-card h-full">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Game Asset Generator</CardTitle>
                <CardDescription className="text-sm md:text-base">@韩游戏 · 游戏策划</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                  专为独立游戏开发者打造的AI素材生成工具，支持多种风格。
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">日活用户</span>
                    <span className="font-semibold">200+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">月收入</span>
                    <span className="font-semibold">$800+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unity插件</span>
                    <span className="font-semibold text-primary">开发中</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-8">
            <Link href="/feed">
              <Button variant="outline">查看更多案例</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 gradient-bg text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8">准备开始你的AI产品之旅？</h2>
          <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto leading-relaxed">
            加入深海圈，和10000+学员一起，用AI编程改变世界
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 py-4">
                立即加入
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-4 text-white border-white hover:bg-white/20">
                常见问题
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}