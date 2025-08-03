'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardPaste, Loader2, Check, AlertCircle } from 'lucide-react';

export default function SmartImportPage() {
  const router = useRouter();
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSlug, setSectionSlug] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [processedContent, setProcessedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>('');
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  // 处理粘贴事件
  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatus('正在处理粘贴内容...');

    try {
      // 获取 HTML 格式的内容
      const htmlContent = e.clipboardData.getData('text/html');
      const textContent = e.clipboardData.getData('text/plain');

      let finalContent = '';

      if (htmlContent) {
        // 处理 HTML 内容
        finalContent = await processHtmlContent(htmlContent);
        setStatus('内容处理完成！');
      } else if (textContent) {
        // 只有纯文本
        finalContent = textContent;
        setStatus('已粘贴纯文本内容');
      }

      // 同时处理剪贴板中的图片
      const items = e.clipboardData.items;
      let imageCount = 0;
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            setStatus(`正在上传图片 ${++imageCount}...`);
            const imageUrl = await uploadImage(file);
            if (imageUrl) {
              const imageMarkdown = `\n\n![图片](${imageUrl})\n\n`;
              finalContent += imageMarkdown;
            }
          }
        }
      }

      // 设置最终内容
      if (finalContent) {
        setLessonContent(finalContent);
        setProcessedContent(finalContent);
        console.log('设置内容成功，长度：', finalContent.length);
      }

      if (imageCount > 0) {
        setStatus(`成功处理 ${imageCount} 张图片`);
      } else if (finalContent) {
        setStatus('内容粘贴成功！');
      }
    } catch (error) {
      setStatus('处理失败：' + error);
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理 HTML 内容
  const processHtmlContent = async (html: string): Promise<string> => {
    // 创建临时 DOM 来解析 HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    let markdown = '';
    const images: { element: HTMLImageElement; placeholder: string }[] = [];

    // 递归处理节点
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        switch (tagName) {
          case 'p':
            return Array.from(element.childNodes).map(processNode).join('') + '\n\n';
          
          case 'h1':
            return `# ${element.textContent}\n\n`;
          case 'h2':
            return `## ${element.textContent}\n\n`;
          case 'h3':
            return `### ${element.textContent}\n\n`;
          
          case 'strong':
          case 'b':
            return `**${element.textContent}**`;
          
          case 'em':
          case 'i':
            return `*${element.textContent}*`;
          
          case 'a':
            const href = element.getAttribute('href') || '';
            return `[${element.textContent}](${href})`;
          
          case 'ul':
            return Array.from(element.children).map(li => 
              `- ${processNode(li)}`
            ).join('\n') + '\n\n';
          
          case 'ol':
            return Array.from(element.children).map((li, index) => 
              `${index + 1}. ${processNode(li)}`
            ).join('\n') + '\n\n';
          
          case 'img':
            const imgElement = element as HTMLImageElement;
            const placeholder = `[图片处理中${images.length + 1}]`;
            images.push({ element: imgElement, placeholder });
            return placeholder;
          
          case 'code':
            return `\`${element.textContent}\``;
          
          case 'pre':
            return `\`\`\`\n${element.textContent}\n\`\`\`\n\n`;
          
          case 'br':
            return '\n';
          
          default:
            return Array.from(element.childNodes).map(processNode).join('');
        }
      }

      return '';
    };

    // 处理主体内容
    markdown = processNode(doc.body);

    // 处理图片
    for (const { element, placeholder } of images) {
      const src = element.src;
      if (src) {
        try {
          setStatus(`正在处理图片...`);
          let imageUrl = src;
          
          // 如果是 base64 或 blob URL，需要上传
          if (src.startsWith('data:') || src.startsWith('blob:')) {
            const blob = await fetchImageAsBlob(src);
            if (blob) {
              imageUrl = await uploadImage(blob);
            }
          }
          // 如果是飞书的图片 URL，也可能需要下载后重新上传
          else if (src.includes('feishu') || src.includes('lark')) {
            try {
              const blob = await fetchImageAsBlob(src);
              if (blob) {
                imageUrl = await uploadImage(blob);
              }
            } catch {
              // 如果下载失败，保留原 URL
            }
          }
          
          markdown = markdown.replace(placeholder, `![图片](${imageUrl})`);
        } catch (error) {
          markdown = markdown.replace(placeholder, `![图片加载失败](${src})`);
        }
      }
    }

    return markdown.trim();
  };

  // 获取图片 Blob
  const fetchImageAsBlob = async (url: string): Promise<Blob | null> => {
    try {
      if (url.startsWith('data:')) {
        // 处理 base64
        const response = await fetch(url);
        return await response.blob();
      } else {
        // 处理外部 URL
        const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          return await response.blob();
        }
      }
    } catch (error) {
      console.error('Failed to fetch image:', error);
    }
    return null;
  };

  // 上传图片
  const uploadImage = async (file: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    
    return '';
  };

  const handleSave = async () => {
    if (!sectionTitle || !sectionSlug || !lessonTitle || !lessonContent) {
      alert('请填写所有必填字段');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/courses/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: sectionTitle,
          slug: sectionSlug,
          description: '从飞书导入的章节',
          lessons: [{
            title: lessonTitle,
            type: 'TEXT_ONLY',
            content: lessonContent,
            isFree: false,
            order: 1
          }]
        })
      });

      if (response.ok) {
        alert('导入成功！');
        router.push('/admin/courses');
      } else {
        throw new Error('导入失败');
      }
    } catch (error) {
      alert('导入失败：' + error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">智能课程导入</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：输入区域 */}
            <div className="space-y-6">
              {/* 章节信息 */}
              <div>
                <h2 className="text-lg font-semibold mb-4">章节信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      章节标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sectionTitle}
                      onChange={(e) => setSectionTitle(e.target.value)}
                      placeholder="例如：前言"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      URL标识 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sectionSlug}
                      onChange={(e) => setSectionSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="例如：preface"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 课时信息 */}
              <div>
                <h2 className="text-lg font-semibold mb-4">课时信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      课时标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="例如：你要学什么？"
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>
                  
                  {/* 智能粘贴区域 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      课时内容 <span className="text-red-500">*</span>
                    </label>
                    <div
                      ref={pasteAreaRef}
                      onPaste={handlePaste}
                      className="w-full min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-text focus:border-blue-500 focus:bg-white transition-colors"
                      contentEditable
                      suppressContentEditableWarning
                    >
                      {!processedContent ? (
                        <div className="text-gray-400 pointer-events-none">
                          <ClipboardPaste className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-center">在这里粘贴飞书文档内容</p>
                          <p className="text-center text-sm">支持图文混合内容</p>
                        </div>
                      ) : (
                        <div className="text-sm text-green-600">
                          ✓ 内容已粘贴（共 {lessonContent.length} 字符）
                        </div>
                      )}
                    </div>
                    
                    {/* 状态提示 */}
                    {status && (
                      <div className={`mt-2 p-2 rounded flex items-center gap-2 text-sm ${
                        isProcessing ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        {status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：预览区域 */}
            <div>
              <h2 className="text-lg font-semibold mb-4">内容预览</h2>
              <div className="border rounded-lg p-4 min-h-[400px] bg-gray-50 overflow-auto">
                {processedContent ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {processedContent}
                    </pre>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center">粘贴内容后这里会显示处理结果</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/courses')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                返回
              </button>
              
              {/* 显示缺失的字段和调试信息 */}
              <div className="text-sm">
                {(!sectionTitle || !sectionSlug || !lessonTitle || !lessonContent) ? (
                  <div className="text-red-500">
                    缺少必填字段：
                    {!sectionTitle && '章节标题 '}
                    {!sectionSlug && 'URL标识 '}
                    {!lessonTitle && '课时标题 '}
                    {!lessonContent && '课时内容 '}
                  </div>
                ) : (
                  <div className="text-green-600">
                    ✓ 所有字段已填写
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  内容长度: {lessonContent.length} 字符
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving || !sectionTitle || !sectionSlug || !lessonTitle || !lessonContent}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '保存课程'}
            </button>
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-amber-50 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            使用提示
          </h3>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• 在飞书中选中要导入的内容（包括文字和图片）</li>
            <li>• 使用 Ctrl+C (Windows) 或 Cmd+C (Mac) 复制</li>
            <li>• 点击灰色虚线框，使用 Ctrl+V 或 Cmd+V 粘贴</li>
            <li>• 系统会自动处理格式转换和图片上传</li>
            <li>• 右侧会实时显示处理后的 Markdown 内容</li>
          </ul>
        </div>
      </div>
    </div>
  );
}