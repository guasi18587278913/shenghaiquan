import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Code2, Globe, TrendingUp, Users, Rocket, Target, FileText, Palette, Gamepad2 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 深海渐变 + 微光对比 */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* 深海渐变背景 */}
        <div className="absolute inset-0" style={{ background: 'var(--gradient-ocean)' }}>
          {/* 云朵噪点 */}
          <div className="cloud-noise" />
          {/* 高光晕染 - 右上角 */}
          <div className="accent-glow top-0 right-0" />
          {/* 海浪层叠效果 */}
          <div className="ocean-wave">
            <svg width="200%" height="100%" viewBox="0 0 2880 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#5FDCE6', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#17B8C4', stopOpacity: 0.5 }} />
                </linearGradient>
              </defs>
              <path 
                d="M0,100 C240,60 480,140 720,100 C960,60 1200,140 1440,100 C1680,60 1920,140 2160,100 C2400,60 2640,140 2880,100 L2880,200 L0,200 Z" 
                fill="url(#wave-gradient-1)"
              />
            </svg>
          </div>
          <div className="ocean-wave-2">
            <svg width="200%" height="100%" viewBox="0 0 2880 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#17B8C4', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#0891A1', stopOpacity: 0.4 }} />
                </linearGradient>
              </defs>
              <path 
                d="M0,120 C360,60 720,140 1080,80 C1440,140 1800,60 2160,120 C2520,60 2880,140 2880,120 L2880,200 L0,200 Z" 
                fill="url(#wave-gradient-2)"
              />
            </svg>
          </div>
          <div className="ocean-wave-3">
            <svg width="200%" height="100%" viewBox="0 0 2880 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#0891A1', stopOpacity: 0.1 }} />
                  <stop offset="100%" style={{ stopColor: '#006B7D', stopOpacity: 0.3 }} />
                </linearGradient>
              </defs>
              <path 
                d="M0,140 C480,80 960,160 1440,100 C1920,160 2400,80 2880,140 L2880,200 L0,200 Z" 
                fill="url(#wave-gradient-3)"
              />
            </svg>
          </div>
          {/* 水波纹效果 */}
          <div className="ripple" style={{ bottom: '20%', left: '10%' }} />
          <div className="ripple" style={{ bottom: '30%', right: '20%', animationDelay: '1s' }} />
          <div className="ripple" style={{ bottom: '15%', left: '50%', animationDelay: '2s' }} />
          {/* 海浪底部填充层 */}
          <div className="ocean-bottom-fill" />
        </div>

        {/* 激光束动画 */}
        <div className="laser-beam" />

        {/* 主内容 */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">

            {/* 中心内容 */}
            <div className="text-center text-white">
              {/* 主标题 */}
              <h1 className="hero-title text-6xl md:text-7xl lg:text-8xl mb-6 animate-fadeInUp">
                海外 AI 产品
              </h1>
              
              {/* 副标题 */}
              <p className="hero-subtitle text-2xl md:text-3xl mb-8 animate-fadeInUp animate-delay-100">
                IDEA TO BUSINESS
              </p>
              
              {/* 描述文字 */}
              <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-3xl mx-auto animate-fadeInUp animate-delay-200">
                用 AI 编程，兑现你的创意
              </p>
              
              {/* CTA按钮组 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp animate-delay-300">
                <Link href="/courses">
                  <button className="btn-primary text-lg">
                    开始学习 →
                  </button>
                </Link>
                <Link href="/feed">
                  <button className="btn-glass text-lg">
                    加入社区
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why 选择深海圈 - 三列玻璃卡片 */}
      <section className="py-24 md:py-40 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--c-primary-900)' }}>
              为什么选择深海圈
            </h2>
            <p className="text-xl text-gray-600">三大核心优势，助你快速成长</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Rocket className="w-8 h-8" />,
                title: "实战派导师",
                desc: "刘小排老师8年AI行业经验，一人打造多款赚钱AI应用",
                color: "var(--c-primary-500)"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "系统化课程",
                desc: "从基础到进阶，涵盖产品设计、AI实现到商业变现全流程",
                color: "var(--c-primary-500)"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "活跃社区",
                desc: "与1000+同频圈友深度交流，紧跟海外AI产品趋势",
                color: "var(--c-primary-500)"
              }
            ].map((item, index) => (
              <div key={index} className="group relative bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* 装饰性背景 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5FDCE6]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* 图标 - 增大尺寸，添加渐变背景 */}
                <div className="relative mb-8">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto transform group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}30 100%)`,
                      boxShadow: `0 8px 24px ${item.color}20`
                    }}
                  >
                    <div className="text-white w-12 h-12 flex items-center justify-center rounded-xl" style={{ background: item.color }}>
                      {item.icon}
                    </div>
                  </div>
                </div>
                
                {/* 标题 - 居中对齐，加强字重 */}
                <h3 className="text-2xl font-bold mb-4 text-center" style={{ 
                  color: 'var(--c-primary-900)'
                }}>
                  {item.title}
                </h3>
                
                {/* 描述 - 居中对齐 */}
                <p className="text-gray-600 leading-relaxed text-center">
                  {item.desc}
                </p>
                
                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[#0891A1]/20 to-transparent group-hover:via-[#0891A1]/40 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 学习路线 - 网格背景 + 进度条 */}
      <section className="py-24 md:py-40 relative bg-white">
        {/* 网格背景 */}
        <div className="grid-overlay" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--c-primary-900)' }}>
              清晰的学习路径
            </h2>
            <p className="text-xl text-gray-600">四步进阶，从小白到大神</p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            {/* 步骤进度条 */}
            <div className="relative mb-20">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
              <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#0891A1] to-[#5FDCE6] -translate-y-1/2 transition-all duration-1000" style={{ width: '75%' }} />
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { 
                  step: "01", 
                  title: "基础篇", 
                  desc: "10分钟搞定产品雏形",
                  duration: "1周",
                  progress: 100,
                  color: '#0891A1'
                },
                { 
                  step: "02", 
                  title: "认知篇", 
                  desc: "构建产品思维体系",
                  duration: "2周",
                  progress: 75,
                  color: '#17B8C4'
                },
                { 
                  step: "03", 
                  title: "内功篇", 
                  desc: "补齐技术硬实力",
                  duration: "4周",
                  progress: 50,
                  color: '#3BCBD6'
                },
                { 
                  step: "04", 
                  title: "进阶篇", 
                  desc: "打造持续盈利产品",
                  duration: "持续",
                  progress: 25,
                  color: '#5FDCE6'
                }
              ].map((item, index, array) => (
                <div key={index} className="relative">
                  {/* 连接箭头 */}
                  {index < array.length - 1 && (
                    <div className="hidden md:block absolute top-16 -right-4 z-10">
                      <svg width="32" height="24" viewBox="0 0 32 24" className="text-gray-300">
                        <path d="M0 12 L24 12 M24 12 L18 6 M24 12 L18 18" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    {/* 步骤指示器 */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                        style={{ background: item.color }}
                      >
                        {item.step}
                      </div>
                      {/* 连接线 */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-10 bg-gray-200" />
                    </div>
                    
                    <div className="pt-14 pb-6 px-6">
                      {/* 标题 */}
                      <h3 className="text-xl font-bold mb-3 text-center" style={{ color: 'var(--c-primary-900)' }}>
                        {item.title}
                      </h3>
                      
                      {/* 描述 */}
                      <p className="text-gray-600 mb-4 text-center text-sm">{item.desc}</p>
                      
                      {/* 时长和进度 */}
                      <div className="space-y-3">
                        <div className="text-sm text-center" style={{ color: item.color }}>
                          预计时长：{item.duration}
                        </div>
                        
                        {/* 进度条 */}
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                            style={{ 
                              width: `${item.progress}%`,
                              background: `linear-gradient(90deg, ${item.color}80, ${item.color})`
                            }}
                          />
                        </div>
                        
                        <div className="text-xs text-gray-500 text-center">
                          进度: {item.progress}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 成功案例 - 纯文字 + 彩边 */}
      <section className="py-24 md:py-40 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--c-primary-900)' }}>
              圈友案例
            </h2>
            <p className="text-xl text-gray-600">真实数据，真实成长</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "AI Resume Builder",
                author: "@吴自由",
                desc: "AI智能简历优化工具",
                stats: { users: "523", revenue: "$156/月" },
                tags: ["正式上线", "SaaS"],
                color: "#0891A1"
              },
              {
                name: "Palette AI",
                author: "@赵小美",
                desc: "AI配色方案生成器",
                stats: { users: "1.2K", rating: "4.8分" },
                tags: ["Chrome插件", "热门"],
                color: "#0891A1"
              },
              {
                name: "Game Asset Generator",
                author: "@韩游戏",
                desc: "游戏素材AI生成工具",
                stats: { users: "280+", revenue: "$800+/月" },
                tags: ["Unity插件", "Beta"],
                color: "#0891A1"
              }
            ].map((project, index) => (
              <div key={index} className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* 产品封面 - 品牌色渐变 + 关键词 */}
                <div className="relative h-48 overflow-hidden">
                  {/* 渐变背景 - 使用品牌色系 */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: index === 0 
                        ? 'linear-gradient(135deg, #0891A1 0%, #17B8C4 100%)' // 深青到浅青
                        : index === 1
                        ? 'linear-gradient(135deg, #006B7D 0%, #0891A1 100%)' // 更深的青色
                        : 'linear-gradient(135deg, #17B8C4 0%, #5FDCE6 100%)' // 浅青到更浅
                    }}
                  />
                  
                  {/* 网格纹理背景 */}
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern id={`grid-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#grid-${index})`} />
                    </svg>
                  </div>
                  
                  {/* 几何装饰 - 波浪 */}
                  <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ height: '30%' }}>
                    <path d="M0,80 C200,60 400,100 600,80 C800,60 1000,100 1200,80 L1200,120 L0,120 Z" 
                      fill="rgba(255,255,255,0.08)"
                    />
                  </svg>
                  
                  {/* 产品名称展示 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
                    {/* 产品名 */}
                    <h3 className="text-2xl md:text-3xl font-bold text-white text-center leading-tight">
                      {project.name}
                    </h3>
                    
                    {/* 分隔线 */}
                    <div className="w-16 h-0.5 bg-white/30 my-3" />
                    
                    {/* 作者 */}
                    <p className="text-white/70 text-sm font-medium">
                      {project.author}
                    </p>
                  </div>
                  
                  {/* 点阵装饰 */}
                  <div className="absolute top-4 right-4">
                    <div className="grid grid-cols-3 gap-1">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-white/30 rounded-full" />
                      ))}
                    </div>
                  </div>
                  
                  {/* 悬浮效果 - 发光边框 */}
                  <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 transition-all duration-300" />
                  
                  {/* 标签 - 更融合的样式 */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {project.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-black/20 backdrop-blur-sm text-white/80 text-xs font-medium rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-6">
                  {/* 项目信息 */}
                  <h3 className="text-xl font-bold mb-1 group-hover:text-[#0891A1] transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{project.author}</p>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">{project.desc}</p>
                  
                  {/* 核心数据展示 */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {Object.entries(project.stats).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold" style={{ color: project.color }}>
                          {value}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{
                          key === 'users' ? '用户数' :
                          key === 'revenue' ? '月收入' :
                          key === 'rating' ? '用户评分' : key
                        }</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 操作按钮 */}
                  <button className="w-full py-3 border-2 border-gray-200 rounded-lg text-gray-700 font-medium hover:border-[#0891A1] hover:text-[#0891A1] transition-all duration-300 group-hover:shadow-md">
                    查看详情 →
                  </button>
                </div>
                
                {/* 彩色装饰线 */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ 
                  background: `linear-gradient(90deg, ${project.color}, ${project.color}80, transparent)`
                }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA - 深海渐变 + 动态效果 */}
      <section className="relative py-24 md:py-32 overflow-visible">
        {/* 深海渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D2538] via-[#0891A1] to-[#0B1929] overflow-visible">
          {/* 光晕效果 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#0891A1] rounded-full blur-[200px] opacity-30" />
          
          {/* 海浪层叠效果 - 借鉴首页设计 */}
          <div className="ocean-wave">
            <svg width="200%" height="100%" viewBox="0 0 2880 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="footer-wave-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#5FDCE6', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: '#17B8C4', stopOpacity: 0.5 }} />
                </linearGradient>
              </defs>
              <path 
                d="M0,100 C240,60 480,140 720,100 C960,60 1200,140 1440,100 C1680,60 1920,140 2160,100 C2400,60 2640,140 2880,100 L2880,200 L0,200 Z" 
                fill="url(#footer-wave-gradient-1)"
              />
            </svg>
          </div>
          <div className="ocean-wave-2">
            <svg width="200%" height="100%" viewBox="0 0 2880 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="footer-wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#17B8C4', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#0891A1', stopOpacity: 0.4 }} />
                </linearGradient>
              </defs>
              <path 
                d="M0,120 C360,60 720,140 1080,80 C1440,140 1800,60 2160,120 C2520,60 2880,140 2880,120 L2880,200 L0,200 Z" 
                fill="url(#footer-wave-gradient-2)"
              />
            </svg>
          </div>
          <div className="ocean-wave-3">
            <svg width="200%" height="100%" viewBox="0 0 2880 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="footer-wave-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#0891A1', stopOpacity: 0.1 }} />
                  <stop offset="100%" style={{ stopColor: '#006B7D', stopOpacity: 0.3 }} />
                </linearGradient>
              </defs>
              <path 
                d="M0,140 C480,80 960,160 1440,100 C1920,160 2400,80 2880,140 L2880,200 L0,200 Z" 
                fill="url(#footer-wave-gradient-3)"
              />
            </svg>
          </div>
          
          {/* 浮动圆点装饰 */}
          <div className="absolute top-20 left-20 w-3 h-3 bg-[#5FDCE6] rounded-full animate-float" />
          <div className="absolute top-40 right-32 w-2 h-2 bg-[#17B8C4] rounded-full animate-float-delay-1" />
          <div className="absolute bottom-40 left-1/4 w-4 h-4 bg-[#0891A1] rounded-full animate-float-delay-2" />
          <div className="absolute bottom-20 right-1/4 w-2 h-2 bg-[#5FDCE6] rounded-full animate-float-delay-3" />
          
          {/* 海浪底部填充层 - 修复底部断层 */}
          <div className="ocean-bottom-fill" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* 主标题 - 强化核心，弱化辅助 */}
            <h2 className="mb-8">
              <span className="block text-2xl md:text-3xl lg:text-4xl font-light text-[#5FDCE6]/60 mb-2 animate-fadeInUp">
                准备开始你的
              </span>
              <span className="block text-6xl md:text-7xl lg:text-8xl font-black animate-fadeInUp animate-delay-100" style={{
                color: '#FFFFFF',
                textShadow: '0 0 40px rgba(95, 220, 230, 0.8), 0 0 80px rgba(95, 220, 230, 0.4), 0 10px 40px rgba(0, 0, 0, 0.5)',
                letterSpacing: '-0.02em'
              }}>
                AI产品之旅？
              </span>
            </h2>
            
            {/* 副标题 - 弱化处理 */}
            <p className="text-base md:text-lg mb-16 text-white/60 animate-fadeInUp animate-delay-200">
              加入深海圈，和1000+学员一起，用AI编程改变世界
            </p>
            
            {/* CTA按钮 - 聚焦唯一行动 */}
            <div className="animate-fadeInUp animate-delay-300">
              <Link href="/register">
                <button className="group relative px-12 py-6 bg-gradient-to-r from-[#5FDCE6] to-[#17B8C4] text-[#0B1929] text-xl font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(95,220,230,0.8)] mx-auto">
                  <span className="relative z-10 flex items-center gap-3">
                    立即加入
                    <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  {/* 按钮光波效果 */}
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 -skew-x-12 group-hover:animate-shimmer" />
                  </div>
                </button>
              </Link>
              
              {/* 次要链接 - 极度弱化 */}
              <div className="mt-8 text-center">
                <Link href="/success-stories" className="text-sm text-white/40 hover:text-white/60 transition-colors underline underline-offset-4 decoration-white/20">
                  查看成功案例
                </Link>
              </div>
            </div>
            
            {/* 信任指标 - 极度弱化，作为支撑而非焦点 */}
            <div className="mt-20 flex flex-wrap justify-center gap-12 animate-fadeInUp animate-delay-500">
              <div className="text-center">
                <div className="text-lg font-normal text-white/50">1000+</div>
                <div className="text-xs text-white/40">活跃学员</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-normal text-white/50">50+</div>
                <div className="text-xs text-white/40">成功案例</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-normal text-white/50">95%</div>
                <div className="text-xs text-white/40">好评率</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}