'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Code, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Loader2,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Quote
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface EnhancedMarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function EnhancedMarkdownEditor({ content, onChange }: EnhancedMarkdownEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 插入文本的通用函数
  const insertText = useCallback((before: string, after: string = '', defaultText: string = '文本') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    onChange(newContent);
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  }, [content, onChange]);

  // 处理图片上传
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'course');
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        const imageMarkdown = `\n![图片描述](${data.data.url})\n`;
        
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const newContent = 
            content.substring(0, start) + 
            imageMarkdown + 
            content.substring(start);
          onChange(newContent);
        }
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // 处理图片粘贴
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
        return;
      }
    }

    // 处理HTML内容（从飞书等富文本编辑器复制）
    const htmlData = e.clipboardData?.getData('text/html');
    if (htmlData) {
      e.preventDefault();
      
      // 转换HTML到Markdown
      const markdown = convertHtmlToMarkdown(htmlData);
      
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const newContent = 
          content.substring(0, start) + 
          markdown + 
          content.substring(start);
        onChange(newContent);
      }
    }
  };

  // 简单的HTML到Markdown转换
  const convertHtmlToMarkdown = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    let markdown = '';
    
    const processNode = (node: Node, depth: number = 0): string => {
      let result = '';
      
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
          case 'h1':
            result += `# ${element.textContent}\n\n`;
            break;
          case 'h2':
            result += `## ${element.textContent}\n\n`;
            break;
          case 'h3':
            result += `### ${element.textContent}\n\n`;
            break;
          case 'p':
            result += `${processChildren(element)}\n\n`;
            break;
          case 'strong':
          case 'b':
            result += `**${processChildren(element)}**`;
            break;
          case 'em':
          case 'i':
            result += `*${processChildren(element)}*`;
            break;
          case 'ul':
            element.querySelectorAll('li').forEach(li => {
              result += `- ${li.textContent}\n`;
            });
            result += '\n';
            break;
          case 'ol':
            element.querySelectorAll('li').forEach((li, index) => {
              result += `${index + 1}. ${li.textContent}\n`;
            });
            result += '\n';
            break;
          case 'code':
            if (element.parentElement?.tagName === 'PRE') {
              result += `\`\`\`\n${element.textContent}\n\`\`\`\n\n`;
            } else {
              result += `\`${element.textContent}\``;
            }
            break;
          case 'img':
            const src = element.getAttribute('src');
            const alt = element.getAttribute('alt') || '图片';
            if (src) {
              result += `![${alt}](${src})\n\n`;
            }
            break;
          case 'a':
            const href = element.getAttribute('href');
            if (href) {
              result += `[${processChildren(element)}](${href})`;
            }
            break;
          case 'blockquote':
            result += `> ${processChildren(element)}\n\n`;
            break;
          default:
            result += processChildren(element);
        }
      }
      
      return result;
    };
    
    const processChildren = (element: HTMLElement): string => {
      let result = '';
      element.childNodes.forEach(child => {
        result += processNode(child);
      });
      return result;
    };
    
    doc.body.childNodes.forEach(node => {
      markdown += processNode(node);
    });
    
    return markdown.trim();
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b bg-gray-50 p-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertText('**', '**', '粗体文本')}
            className="p-2 rounded hover:bg-gray-200"
            title="粗体 (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText('*', '*', '斜体文本')}
            className="p-2 rounded hover:bg-gray-200"
            title="斜体 (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => insertText('# ', '', '标题')}
            className="p-2 rounded hover:bg-gray-200"
            title="标题 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText('## ', '', '标题')}
            className="p-2 rounded hover:bg-gray-200"
            title="标题 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => insertText('- ', '', '列表项')}
            className="p-2 rounded hover:bg-gray-200"
            title="无序列表"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText('1. ', '', '列表项')}
            className="p-2 rounded hover:bg-gray-200"
            title="有序列表"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertText('> ', '', '引用文本')}
            className="p-2 rounded hover:bg-gray-200"
            title="引用"
          >
            <Quote className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => insertText('`', '`', '代码')}
            className="p-2 rounded hover:bg-gray-200"
            title="行内代码"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const url = prompt('输入链接地址:');
              if (url) {
                insertText('[', `](${url})`, '链接文本');
              }
            }}
            className="p-2 rounded hover:bg-gray-200"
            title="插入链接"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <label className="p-2 rounded hover:bg-gray-200 cursor-pointer" title="插入图片">
            <ImageIcon className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              disabled={uploading}
            />
          </label>
          {uploading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
        </div>
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? '编辑' : '预览'}
        </button>
      </div>

      {/* 编辑区/预览区 */}
      <div className="bg-white">
        {showPreview ? (
          <div className="p-4 prose prose-sm max-w-none min-h-[400px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content || '*开始输入内容...*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            className="w-full p-4 min-h-[400px] resize-none focus:outline-none font-mono text-sm"
            placeholder={`在这里粘贴飞书文档内容，或直接输入 Markdown...

支持：
- 从飞书直接复制粘贴（自动转换格式）
- 粘贴或拖拽图片（自动上传）
- Markdown 语法
- 实时预览`}
          />
        )}
      </div>

      {/* 提示信息 */}
      <div className="border-t bg-gray-50 p-3 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>💡 可以直接从飞书复制内容粘贴</span>
          <span>🖼️ 支持粘贴图片自动上传</span>
          <span>👁️ 点击预览查看效果</span>
        </div>
      </div>
    </div>
  );
}