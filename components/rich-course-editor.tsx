'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Image as ImageIcon, 
  Video, 
  Code, 
  Quote,
  Heading1,
  Heading2,
  Link,
  Undo,
  Redo,
  Save,
  Eye,
  Loader2
} from 'lucide-react'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// 动态导入Markdown编辑器
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
)

interface RichCourseEditorProps {
  initialContent?: string
  onSave?: (content: string) => void
  lessonId?: string
}

export function RichCourseEditor({ 
  initialContent = '', 
  onSave,
  lessonId 
}: RichCourseEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [preview, setPreview] = useState<'edit' | 'live' | 'preview'>('live')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const editorRef = useRef<any>(null)

  // 处理图片上传
  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'course')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const data = await response.json()
      
      // 在光标位置插入图片
      const imageMarkdown = `\n![${file.name}](${data.url})\n`
      setContent(prev => {
        // 获取当前光标位置并插入
        // 这里简化处理，直接追加到末尾
        return prev + imageMarkdown
      })
      
    } catch (error) {
      console.error('图片上传失败:', error)
      alert('图片上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }, [])

  // 处理文件拖放
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files)
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        handleImageUpload(file)
      }
    })
  }, [handleImageUpload])

  // 处理粘贴事件
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    
    items.forEach(item => {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          e.preventDefault()
          handleImageUpload(file)
        }
      }
    })
  }, [handleImageUpload])

  // 保存内容
  const handleSave = useCallback(async () => {
    if (!onSave) return
    
    setSaving(true)
    try {
      await onSave(content)
      // 显示保存成功提示
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }, [content, onSave])

  // 快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl/Cmd + S 保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }, [handleSave])

  // 插入模板文本
  const insertTemplate = useCallback((template: string) => {
    setContent(prev => prev + '\n' + template + '\n')
  }, [])

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* 工具栏 */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 左侧工具 */}
          <div className="flex items-center gap-2">
            {/* 格式化工具 */}
            <div className="flex items-center gap-1 pr-2 border-r">
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('# 标题')}
                title="一级标题"
              >
                <Heading1 className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('## 二级标题')}
                title="二级标题"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('**粗体文本**')}
                title="粗体"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('*斜体文本*')}
                title="斜体"
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>

            {/* 插入工具 */}
            <div className="flex items-center gap-1 pr-2 border-r">
              <label className="p-2 hover:bg-gray-100 rounded cursor-pointer tooltip" title="插入图片">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                  disabled={uploading}
                />
                <ImageIcon className="w-4 h-4" />
              </label>
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('[链接文本](https://example.com)')}
                title="插入链接"
              >
                <Link className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('```javascript\n// 代码\n```')}
                title="代码块"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('> 引用文本')}
                title="引用"
              >
                <Quote className="w-4 h-4" />
              </button>
            </div>

            {/* 列表工具 */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('- 列表项1\n- 列表项2\n- 列表项3')}
                title="无序列表"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded tooltip"
                onClick={() => insertTemplate('1. 列表项1\n2. 列表项2\n3. 列表项3')}
                title="有序列表"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 右侧工具 */}
          <div className="flex items-center gap-2">
            {/* 视图切换 */}
            <div className="flex items-center gap-1 pr-2 border-r">
              <button
                className={`px-3 py-1 rounded text-sm ${
                  preview === 'edit' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => setPreview('edit')}
              >
                编辑
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  preview === 'live' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => setPreview('live')}
              >
                实时预览
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  preview === 'preview' ? 'bg-gray-200' : 'hover:bg-gray-100'
                }`}
                onClick={() => setPreview('preview')}
              >
                预览
              </button>
            </div>

            {/* 保存按钮 */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存
                </>
              )}
            </button>
          </div>
        </div>

        {/* 上传状态 */}
        {uploading && (
          <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            正在上传图片...
          </div>
        )}
      </div>

      {/* 编辑器主体 */}
      <div 
        className="min-h-[600px]"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
      >
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          preview={preview}
          height={600}
          data-color-mode="light"
          commands={[
            // 可以自定义更多命令
          ]}
          extraCommands={[
            // 可以添加额外的命令
          ]}
        />
      </div>

      {/* 提示信息 */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="text-sm text-gray-600 space-y-1">
          <p>💡 使用提示：</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>支持拖拽或粘贴图片直接上传</li>
            <li>使用 Ctrl/Cmd + S 快速保存</li>
            <li>支持 Markdown 语法和实时预览</li>
            <li>图片会自动上传到云端存储</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// 课程内容模板
export const courseTemplates = {
  basicLesson: `# 课时标题

## 学习目标

- 目标1
- 目标2
- 目标3

## 正文内容

### 第一部分

这里是正文内容...

![示例图片](图片URL)

### 第二部分

更多内容...

## 代码示例

\`\`\`javascript
// 示例代码
function example() {
  console.log('Hello World')
}
\`\`\`

## 总结

本节课我们学习了...

## 作业

1. 作业1
2. 作业2
`,
  
  videoLesson: `# 课时标题

## 视频内容

[视频将在此处显示]

## 文字讲义

### 重点内容

1. **重点一**
   - 详细说明
   
2. **重点二**
   - 详细说明

### 补充说明

更多内容...

## 相关资源

- [资源链接1](URL)
- [资源链接2](URL)
`
}