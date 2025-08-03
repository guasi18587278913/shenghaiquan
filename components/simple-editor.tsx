'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface SimpleEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function SimpleEditor({ content, onChange }: SimpleEditorProps) {
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        const imageMarkdown = `\n![图片](${data.data.url})\n`;
        
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newContent = 
            content.substring(0, start) + 
            imageMarkdown + 
            content.substring(end);
          onChange(newContent);
        }
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

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
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-gray-50 p-2 flex items-center gap-4">
        <label className="flex items-center gap-2 px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 cursor-pointer">
          <ImageIcon className="w-4 h-4" />
          <span>插入图片</span>
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
        {uploading && (
          <span className="text-sm text-gray-500">上传中...</span>
        )}
      </div>
      
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onPaste={handlePaste}
        className="w-full p-4 min-h-[400px] resize-none focus:outline-none font-mono text-sm"
        placeholder={`在这里粘贴飞书文档内容...

支持的格式：
- Markdown 语法
- 直接粘贴图片
- 多级标题（# ## ###）
- 列表（- 或 1.）
- 代码块（\`\`\`）
- 链接 [文字](URL)
- 粗体 **文字**
- 斜体 *文字*`}
      />
      
      <div className="border-t bg-gray-50 p-3 text-xs text-gray-600">
        💡 提示：可以直接从飞书复制内容粘贴，或粘贴/拖拽图片
      </div>
    </div>
  );
}