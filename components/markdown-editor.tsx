'use client'

import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  height?: number
  preview?: 'edit' | 'live' | 'preview'
  hideToolbar?: boolean
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
}

export function MarkdownEditor({
  value,
  onChange,
  height = 300,
  preview = 'live',
  hideToolbar = false,
  textareaProps
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        hideToolbar={hideToolbar}
        textareaProps={{
          placeholder: '支持 Markdown 语法，可以插入代码、图片、链接等...',
          ...textareaProps
        } as any}
      />
    </div>
  )
}