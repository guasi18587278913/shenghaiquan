import axios from 'axios';

interface UserTokenConfig {
  userAccessToken: string;
}

export class FeishuUserAPI {
  private config: UserTokenConfig;

  constructor(config: UserTokenConfig) {
    this.config = config;
  }

  // 获取文档内容（使用用户token）
  async getDocumentContent(documentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/raw_content`,
        {
          headers: {
            Authorization: `Bearer ${this.config.userAccessToken}`,
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
    try {
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/docx/v1/documents/${documentId}/blocks`,
        {
          headers: {
            Authorization: `Bearer ${this.config.userAccessToken}`,
          },
          params: {
            page_size: 500,
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
    try {
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/drive/v1/medias/${fileToken}/download`,
        {
          headers: {
            Authorization: `Bearer ${this.config.userAccessToken}`,
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

  // 解析文档块为 Markdown（与之前相同）
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
          break;
      }
    });

    return { content: markdown.trim(), images };
  }

  private parseTextElements(elements: any[]): string {
    return elements.map(element => {
      const content = element.text_run?.content || '';
      const style = element.text_run?.text_element_style;

      if (!style) return content;

      let styledContent = content;

      if (style.bold) {
        styledContent = `**${styledContent}**`;
      }

      if (style.italic) {
        styledContent = `*${styledContent}*`;
      }

      if (style.inline_code) {
        styledContent = `\`${content}\``;
      }

      if (style.link?.url) {
        styledContent = `[${content}](${style.link.url})`;
      }

      return styledContent;
    }).join('');
  }
}

// 获取用户 Access Token 的说明
export const getUserTokenInstructions = `
获取用户 Access Token 的方法：

1. 访问飞书开放平台的 API 调试台：
   https://open.feishu.cn/api-explorer/

2. 选择任意一个 API（如 获取用户信息）

3. 点击"获取 user_access_token"

4. 使用飞书扫码授权

5. 复制生成的 token

注意：用户 token 有效期较短（约2小时），需要定期更新。
`;