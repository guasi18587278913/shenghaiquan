'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { useCallback, useState, useEffect } from 'react';
import { Upload, Video, Image as ImageIcon, Bold, Italic, List, Link } from 'lucide-react';

interface CourseContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onVideoUpload?: (fileId: string) => void;
}

export function CourseContentEditor({ content, onChange, onVideoUpload }: CourseContentEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false, // 修复 SSR 问题
  });

  const handleImageUpload = useCallback(async (file: File) => {
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
        editor?.chain().focus().setImage({ src: data.data.url }).run();
      }
    } catch (error) {
      console.error('图片上传失败:', error);
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
      }
    }
  }, [handleImageUpload]);

  // 处理粘贴事件
  useEffect(() => {
    if (editor?.view?.dom) {
      const dom = editor.view.dom;
      dom.addEventListener('paste', handlePaste);
      return () => {
        dom.removeEventListener('paste', handlePaste);
      };
    }
  }, [editor, handlePaste]);

  if (!editor) {
    return <div className="border rounded-lg p-4 text-gray-400">编辑器加载中...</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b bg-gray-50 p-2 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-200' : ''
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-200' : ''
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-200' : ''
          }`}
        >
          <List className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* 图片上传 */}
        <label className="p-2 rounded hover:bg-gray-200 cursor-pointer">
          <ImageIcon className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
          />
        </label>
        
        {/* 视频嵌入 */}
        <button
          onClick={() => {
            const url = prompt('请输入视频URL (YouTube/腾讯视频)');
            if (url) {
              editor.chain().focus().setYoutubeVideo({ src: url }).run();
            }
          }}
          className="p-2 rounded hover:bg-gray-200"
        >
          <Video className="w-4 h-4" />
        </button>
        
        {uploading && (
          <span className="text-sm text-gray-500 ml-2">上传中...</span>
        )}
      </div>

      {/* 编辑器内容 */}
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[400px] focus:outline-none"
      />
      
      {/* 提示信息 */}
      <div className="border-t bg-gray-50 p-3 text-sm text-gray-600">
        <p>💡 提示：</p>
        <ul className="text-xs mt-1 space-y-1">
          <li>• 直接粘贴飞书文档内容，格式会自动保留</li>
          <li>• 可以直接粘贴或拖拽图片到编辑器</li>
          <li>• 支持 Markdown 语法</li>
        </ul>
      </div>
    </div>
  );
}