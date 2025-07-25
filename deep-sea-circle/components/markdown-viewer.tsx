'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  return (
    <div className={`prose prose-slate max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
        // 自定义链接，在新标签页打开
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {children}
          </a>
        ),
        // 自定义代码块样式
        pre: ({ children }) => (
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            {children}
          </pre>
        ),
        // 自定义行内代码样式
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match
          
          if (isInline) {
            return (
              <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            )
          }
          
          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        // 自定义图片样式
        img: ({ src, alt }) => (
          <img 
            src={src} 
            alt={alt || ''} 
            className="rounded-lg max-w-full h-auto"
            loading="lazy"
          />
        ),
        // 自定义表格样式
        table: ({ children }) => (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              {children}
            </table>
          </div>
        ),
        // 自定义引用样式
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary pl-4 italic">
            {children}
          </blockquote>
        )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}