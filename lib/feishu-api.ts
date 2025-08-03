import axios from 'axios';

interface FeishuConfig {
  appId: string;
  appSecret: string;
}

interface TokenResponse {
  code: number;
  msg: string;
  tenant_access_token: string;
  expire: number;
}

export class FeishuAPI {
  private config: FeishuConfig;
  private accessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(config: FeishuConfig) {
    this.config = config;
  }

  // 获取 tenant_access_token
  private async getTenantAccessToken(): Promise<string> {
    // 如果 token 还在有效期内，直接返回
    if (this.accessToken && Date.now() < this.tokenExpireTime) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<TokenResponse>(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
          app_id: this.config.appId,
          app_secret: this.config.appSecret,
        }
      );

      if (response.data.code === 0) {
        this.accessToken = response.data.tenant_access_token;
        // 设置过期时间，提前5分钟刷新
        this.tokenExpireTime = Date.now() + (response.data.expire - 300) * 1000;
        return this.accessToken;
      } else {
        throw new Error(`获取 token 失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('获取飞书 token 失败:', error);
      throw error;
    }
  }

  // 获取文档内容
  async getDocumentContent(documentId: string): Promise<any> {
    const token = await this.getTenantAccessToken();

    try {
      // 获取文档原始内容
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/raw_content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.code === 0) {
        return response.data.data;
      } else {
        throw new Error(`获取文档失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('获取飞书文档失败:', error);
      throw error;
    }
  }

  // 获取文档中的所有块
  async getDocumentBlocks(documentId: string): Promise<any> {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/blocks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page_size: 500, // 一次获取最多500个块
          }
        }
      );

      if (response.data.code === 0) {
        return response.data.data;
      } else {
        throw new Error(`获取文档块失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('获取文档块失败:', error);
      throw error;
    }
  }

  // 下载图片
  async downloadImage(fileToken: string): Promise<Buffer> {
    const token = await this.getTenantAccessToken();

    try {
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/drive/v1/medias/${fileToken}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      console.error('下载图片失败:', error);
      throw error;
    }
  }

  // 解析文档块为 Markdown
  parseBlocksToMarkdown(blocks: any[]): { content: string; images: string[] } {
    let markdown = '';
    const images: string[] = [];

    blocks.forEach(block => {
      switch (block.block_type) {
        case 1: // 文本段落
          const text = this.parseTextElements(block.text?.elements || []);
          markdown += text + '\n\n';
          break;

        case 2: // 标题1
          markdown += `# ${this.parseTextElements(block.heading1?.elements || [])}\n\n`;
          break;

        case 3: // 标题2
          markdown += `## ${this.parseTextElements(block.heading2?.elements || [])}\n\n`;
          break;

        case 4: // 标题3
          markdown += `### ${this.parseTextElements(block.heading3?.elements || [])}\n\n`;
          break;

        case 5: // 项目符号列表
          markdown += `- ${this.parseTextElements(block.bullet?.elements || [])}\n`;
          break;

        case 6: // 有序列表
          markdown += `1. ${this.parseTextElements(block.ordered?.elements || [])}\n`;
          break;

        case 11: // 代码块
          markdown += `\`\`\`${block.code?.language || ''}\n${block.code?.elements?.[0]?.text_run?.content || ''}\n\`\`\`\n\n`;
          break;

        case 17: // 图片
          const imageToken = block.image?.token;
          if (imageToken) {
            images.push(imageToken);
            markdown += `![图片](image_${images.length - 1})\n\n`;
          }
          break;

        default:
          // 其他类型暂不处理
          break;
      }
    });

    return { content: markdown.trim(), images };
  }

  // 解析文本元素
  private parseTextElements(elements: any[]): string {
    return elements.map(element => {
      const content = element.text_run?.content || '';
      const style = element.text_run?.text_element_style;

      if (!style) return content;

      let styledContent = content;

      // 加粗
      if (style.bold) {
        styledContent = `**${styledContent}**`;
      }

      // 斜体
      if (style.italic) {
        styledContent = `*${styledContent}*`;
      }

      // 代码
      if (style.inline_code) {
        styledContent = `\`${content}\``;
      }

      // 链接
      if (style.link?.url) {
        styledContent = `[${content}](${style.link.url})`;
      }

      return styledContent;
    }).join('');
  }
}

// 从文档URL中提取文档ID
export function extractDocumentId(url: string): string | null {
  // 飞书文档URL格式：https://xxx.feishu.cn/docx/xxxxxx
  const match = url.match(/\/docx\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}