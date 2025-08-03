'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, FileText, Video, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EnhancedEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function EnhancedEditor({ 
  value, 
  onChange, 
  placeholder = '在这里粘贴飞书文档内容，图片会自动上传...',
  minHeight = '200px'
}: EnhancedEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // 处理图片上传
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.data?.url || data.url;
      }
    } catch (error) {
      console.error('图片上传失败:', error);
    }
    return null;
  };

  // 处理粘贴事件
  const handlePaste = useCallback(async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length === 0) return; // 如果没有图片，使用默认粘贴行为
    
    e.preventDefault();
    setUploading(true);
    setUploadProgress('正在处理内容...');
    
    try {
      const textarea = textareaRef.current!;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const textBefore = value.substring(0, start);
      const textAfter = value.substring(end);
      
      // 获取HTML内容以保留格式
      const htmlContent = e.clipboardData.getData('text/html');
      const textContent = e.clipboardData.getData('text/plain');
      
      // 处理文本内容（转换格式）
      let processedText = textContent;
      if (htmlContent) {
        // 简单的HTML到Markdown转换
        processedText = htmlContent
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
          .replace(/<ul[^>]*>/gi, '\n')
          .replace(/<\/ul>/gi, '\n')
          .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<br[^>]*>/gi, '\n')
          .replace(/<[^>]+>/g, ''); // 移除其他HTML标签
      }
      
      let newContent = textBefore + processedText;
      let cursorPosition = newContent.length;
      
      // 处理所有图片
      for (let i = 0; i < imageItems.length; i++) {
        const item = imageItems[i];
        const file = item.getAsFile();
        if (!file) continue;
        
        setUploadProgress(`正在上传图片 ${i + 1}/${imageItems.length}...`);
        
        const imageUrl = await uploadImage(file);
        if (imageUrl) {
          const imageMarkdown = `\n![图片](${imageUrl})\n`;
          newContent += imageMarkdown;
          cursorPosition = newContent.length;
        }
      }
      
      // 添加剩余文本
      newContent += textAfter;
      
      // 更新内容
      onChange(newContent);
      
      // 设置光标位置
      setTimeout(() => {
        textarea.setSelectionRange(cursorPosition, cursorPosition);
        textarea.focus();
      }, 0);
      
      setUploadProgress('上传完成！');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error) {
      console.error('处理粘贴内容失败:', error);
      setUploadProgress('处理失败');
    } finally {
      setUploading(false);
    }
  }, [value, onChange]);

  // 处理拖放
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress('正在上传图片...');
    
    try {
      let insertText = '';
      
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`正在上传图片 ${i + 1}/${files.length}...`);
        const imageUrl = await uploadImage(files[i]);
        if (imageUrl) {
          insertText += `\n![${files[i].name}](${imageUrl})\n`;
        }
      }
      
      // 在光标位置插入
      const textarea = textareaRef.current!;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = value.substring(0, start) + insertText + value.substring(end);
      onChange(newContent);
      
      setUploadProgress('上传完成！');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error) {
      console.error('上传失败:', error);
      setUploadProgress('上传失败');
    } finally {
      setUploading(false);
    }
  }, [value, onChange]);

  // 文件选择上传
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setUploading(true);
    setUploadProgress('正在上传...');
    
    try {
      let insertText = '';
      
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`正在上传 ${i + 1}/${files.length}...`);
        const imageUrl = await uploadImage(files[i]);
        if (imageUrl) {
          insertText += `\n![${files[i].name}](${imageUrl})\n`;
        }
      }
      
      const textarea = textareaRef.current!;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = value.substring(0, start) + insertText + value.substring(end);
      onChange(newContent);
      
      setUploadProgress('上传完成！');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setUploading(false);
      e.target.value = ''; // 清空选择
    }
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
              onClick={(e) => e.currentTarget.previousElementSibling?.click()}
            >
              <ImageIcon className="w-4 h-4" />
              上传图片
            </button>
          </label>
          
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" />
            {showPreview ? '编辑' : '预览'}
          </button>
        </div>
        
        {uploadProgress && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            {uploadProgress}
          </div>
        )}
      </div>

      {/* 编辑器/预览区 */}
      {showPreview ? (
        <div 
          className="prose prose-sm max-w-none p-4 border rounded-lg bg-gray-50"
          style={{ minHeight }}
        >
          <ReactMarkdown>{value || '*暂无内容*'}</ReactMarkdown>
        </div>
      ) : (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            placeholder={placeholder}
            className={`w-full px-4 py-3 border rounded-lg font-mono text-sm resize-none transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : ''
            } ${uploading ? 'opacity-75' : ''}`}
            style={{ minHeight }}
            disabled={uploading}
          />
          
          {dragOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg pointer-events-none">
              <div className="text-blue-600 font-medium">
                <Upload className="w-8 h-8 mx-auto mb-2" />
                拖放图片到这里
              </div>
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 支持功能：</p>
        <ul className="ml-4 space-y-0.5">
          <li>• 从飞书/Word直接粘贴，自动保留格式并上传图片</li>
          <li>• 拖拽图片文件到编辑器</li>
          <li>• 点击"上传图片"按钮选择文件</li>
          <li>• 支持 Markdown 格式编写</li>
        </ul>
      </div>
    </div>
  );
}