'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Bold, Italic, List, ListOrdered, Code, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

const lowlight = createLowlight(common);

interface RichFeishuEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichFeishuEditor({ content, onChange }: RichFeishuEditorProps) {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // 修复 SSR 错误
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4',
      },
      handlePaste: async (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        // 处理图片粘贴
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) {
              await handleImageUpload(file);
            }
            return true;
          }
        }

        // 处理HTML内容（从飞书复制的富文本）
        const htmlData = event.clipboardData?.getData('text/html');
        if (htmlData) {
          event.preventDefault();
          
          // 清理并转换飞书HTML
          const cleanedHtml = cleanFeishuHtml(htmlData);
          
          // 插入处理后的内容
          editor?.commands.insertContent(cleanedHtml);
          return true;
        }

        return false;
      },
      handleDrop: async (view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const file = files[0];
        if (file.type.startsWith('image/')) {
          event.preventDefault();
          await handleImageUpload(file);
          return true;
        }

        return false;
      },
    },
  });

  // 清理飞书HTML的函数
  const cleanFeishuHtml = (html: string): string => {
    // 创建临时DOM来解析HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 移除飞书特有的样式和属性
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      // 保留必要的标签，移除不必要的属性
      el.removeAttribute('style');
      el.removeAttribute('class');
      el.removeAttribute('id');
      el.removeAttribute('data-feishu-id');
    });

    // 处理图片
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && (src.startsWith('data:') || src.startsWith('http'))) {
        img.setAttribute('class', 'max-w-full h-auto rounded-lg my-4');
      }
    });

    // 处理代码块
    const codeBlocks = doc.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
      pre.setAttribute('class', 'bg-gray-100 rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto');
    });

    return doc.body.innerHTML;
  };

  // 上传图片
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
        editor?.chain().focus().setImage({ src: data.data.url }).run();
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

  const addImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleImageUpload(file);
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('输入链接地址:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return <div className="h-[500px] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b bg-gray-50 p-2 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="粗体"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
          title="代码块"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="链接"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200"
          title="插入图片"
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
        </button>
        
        {/* 标题选择器 */}
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
            }
          }}
          className="ml-4 px-3 py-1 border rounded text-sm"
          value={
            editor.isActive('heading', { level: 1 }) ? 1 :
            editor.isActive('heading', { level: 2 }) ? 2 :
            editor.isActive('heading', { level: 3 }) ? 3 : 0
          }
        >
          <option value={0}>正文</option>
          <option value={1}>标题 1</option>
          <option value={2}>标题 2</option>
          <option value={3}>标题 3</option>
        </select>
      </div>

      {/* 编辑器内容区 */}
      <EditorContent editor={editor} />

      {/* 提示信息 */}
      <div className="border-t bg-gray-50 p-3 text-xs text-gray-600">
        <div className="flex items-center gap-4">
          <span>💡 支持从飞书直接复制粘贴，格式自动保留</span>
          <span>🖼️ 支持拖拽或粘贴图片</span>
          <span>📝 支持 Markdown 语法</span>
        </div>
      </div>
    </div>
  );
}