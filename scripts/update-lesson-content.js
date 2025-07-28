// 更新课时内容的脚本
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

// 使用方法：
// node scripts/update-lesson-content.js --lesson "1.1 为什么选择AI产品赛道" --file "content/lesson-1-1.md"
// 或者直接在脚本中定义内容

async function updateLessonContent() {
  try {
    // 方式1：通过命令行参数
    const args = process.argv.slice(2);
    let lessonTitle = null;
    let contentFile = null;
    let content = null;

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--lesson' && args[i + 1]) {
        lessonTitle = args[i + 1];
        i++;
      }
      if (args[i] === '--file' && args[i + 1]) {
        contentFile = args[i + 1];
        i++;
      }
    }

    // 方式2：直接在这里定义要更新的内容
    const lessonsToUpdate = [
      {
        title: "1.1 为什么选择AI产品赛道",
        content: `# 为什么选择AI产品赛道

## 1. AI时代的机遇窗口

### 1.1 技术成熟度到达临界点
- GPT-4、Claude等大模型能力突破
- API成本大幅下降（较2年前降低90%+）
- 开发工具完善（Cursor、V0等）

### 1.2 市场需求爆发
- 全球数字化转型加速
- 中小企业AI工具需求旺盛
- 个人生产力工具市场巨大

### 1.3 个人开发者的黄金时代
- 一个人可以做出完整产品
- 无需大团队和巨额投资
- 快速验证，快速迭代

## 2. 为什么是你

### 2.1 门槛真的降低了
- 不需要深厚的编程基础
- AI可以帮你写80%的代码
- 重点是产品思维和执行力

### 2.2 你的优势
- 理解用户需求
- 快速学习能力
- 愿意尝试新事物

## 3. 成功案例分享

### 3.1 个人开发者案例
- **案例1**：某独立开发者用ChatGPT API做的写作工具，月收入$5000+
- **案例2**：两人团队开发的AI客服工具，6个月达到$30000 MRR
- **案例3**：深海圈学员的翻译工具，第一个月就有付费用户

### 3.2 他们的共同点
1. 选择细分市场
2. 快速推出MVP
3. 持续迭代优化
4. 重视用户反馈

## 4. 你需要准备什么

### 4.1 心态准备
- 接受不完美，快速行动
- 保持学习，持续进化
- 用户至上，价值导向

### 4.2 技能准备
- 基础的产品思维
- 简单的设计能力
- 基本的营销知识

### 4.3 资源准备
- 每月$50-100的工具费用
- 每天2-3小时的学习时间
- 一台能上网的电脑

## 5. 下一步行动

1. **确定你的第一个产品方向**
2. **学习使用AI工具**
3. **加入深海圈社区**
4. **开始你的第一个项目**

> 💡 记住：完成比完美更重要。先做出来，再优化。

## 课后思考

1. 你最想解决什么问题？
2. 这个问题影响多少人？
3. 你准备如何开始？

---

*下一课：1.2 认识主流AI工具*`
      },
      {
        title: "1.2 认识主流AI工具",
        content: `# 认识主流AI工具

## 1. AI工具全景图

### 1.1 大语言模型
- **ChatGPT/GPT-4**：最强大的通用AI
- **Claude**：擅长长文本和分析
- **Gemini**：Google的多模态AI
- **国产大模型**：文心一言、通义千问等

### 1.2 编程辅助工具
- **Cursor**：AI编程IDE（重点学习）
- **GitHub Copilot**：代码补全
- **V0**：UI组件生成
- **Bolt**：全栈应用生成

### 1.3 设计工具
- **Midjourney**：图像生成
- **DALL-E 3**：OpenAI的图像生成
- **Figma AI**：设计辅助
- **Canva AI**：营销素材生成

### 1.4 其他实用工具
- **Perplexity**：AI搜索引擎
- **Claude Artifacts**：交互式内容创建
- **NotebookLM**：知识管理
- **Zapier AI**：自动化工作流

## 2. 核心工具深度解析

### 2.1 ChatGPT - 你的AI助手
**优势**：
- 理解能力最强
- 支持多轮对话
- 插件生态丰富

**最佳实践**：
- 清晰描述需求
- 分步骤提问
- 提供上下文

**实用技巧**：
\`\`\`
提示词模板：
我想要[具体目标]
当前情况是[背景信息]
请帮我[具体任务]
输出格式：[期望格式]
\`\`\`

### 2.2 Cursor - AI编程神器
**核心功能**：
- Tab自动补全
- Cmd+K重写代码
- Cmd+L对话编程
- Composer多文件编辑

**使用流程**：
1. 描述你想要的功能
2. AI生成代码
3. 测试和调试
4. 迭代优化

### 2.3 V0 - 快速生成UI
**适用场景**：
- 落地页设计
- 组件原型
- 界面布局

**工作流程**：
1. 描述界面需求
2. 选择生成方案
3. 复制代码使用
4. 在Cursor中调整

## 3. 工具组合拳

### 3.1 产品开发组合
- ChatGPT（产品设计）
- Cursor（代码实现）
- V0（界面设计）
- Midjourney（图片素材）

### 3.2 内容创作组合
- Claude（长文写作）
- ChatGPT（创意生成）
- Midjourney（配图）
- Canva（排版设计）

### 3.3 学习研究组合
- Perplexity（信息搜索）
- NotebookLM（知识整理）
- ChatGPT（问题解答）

## 4. 选择建议

### 4.1 新手必备
1. **ChatGPT Plus**（$20/月）
2. **Cursor Pro**（$20/月）
3. **V0**（免费版即可）

### 4.2 进阶配置
- 加入Midjourney（$10/月起）
- GitHub Copilot（$10/月）
- Claude Pro（$20/月）

### 4.3 预算方案
- **最小配置**：ChatGPT + Cursor = $40/月
- **标准配置**：上述 + V0 + Midjourney = $50/月
- **完整配置**：全套工具 = $100/月

## 5. 实操练习

### 练习1：ChatGPT基础对话
1. 让ChatGPT帮你写一个产品介绍
2. 请它生成5个产品名称
3. 让它分析竞品优劣势

### 练习2：Cursor初体验
1. 安装Cursor
2. 创建一个简单的网页
3. 用AI添加一个功能

### 练习3：V0生成界面
1. 描述一个落地页
2. 生成并预览效果
3. 导出代码

## 6. 学习资源

### 官方文档
- [ChatGPT文档](https://platform.openai.com/docs)
- [Cursor文档](https://cursor.sh/docs)
- [V0教程](https://v0.dev/docs)

### 社区资源
- 深海圈AI工具交流群
- YouTube教程合集
- 实战案例分享

## 本课小结

- AI工具是效率倍增器
- 选择适合自己的工具组合
- 重在实践，边用边学
- 工具只是手段，产品价值是目的

## 课后作业

1. 注册并体验ChatGPT
2. 下载安装Cursor
3. 用V0生成一个简单页面
4. 在社区分享你的体验

---

*下一课：1.3 实战：用ChatGPT做翻译工具*`
      }
      // 可以继续添加更多课程内容
    ];

    // 如果通过命令行指定了课程
    if (lessonTitle && contentFile) {
      content = fs.readFileSync(contentFile, 'utf-8');
      lessonsToUpdate.push({ title: lessonTitle, content });
    }

    // 更新课程内容
    for (const lesson of lessonsToUpdate) {
      // 查找课时
      const foundLesson = await prisma.lesson.findFirst({
        where: {
          title: lesson.title
        }
      });

      if (foundLesson) {
        // 更新内容
        await prisma.lesson.update({
          where: { id: foundLesson.id },
          data: { content: lesson.content }
        });
        console.log(`✅ 已更新课时内容：${lesson.title}`);
      } else {
        console.log(`❌ 未找到课时：${lesson.title}`);
      }
    }

    console.log('\n📚 内容更新完成！');

  } catch (error) {
    console.error('更新失败：', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行更新
updateLessonContent();