"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"

interface WatermarkProps {
  content?: string
  opacity?: number
  fontSize?: number
  angle?: number
  gap?: number
}

export function Watermark({ 
  content, 
  opacity = 0.15,
  fontSize = 14,
  angle = -20,
  gap = 100
}: WatermarkProps) {
  const { data: session } = useSession()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布大小
    const width = gap * 4
    const height = gap * 4
    canvas.width = width
    canvas.height = height

    // 设置样式
    ctx.globalAlpha = opacity
    ctx.font = `${fontSize}px Arial, sans-serif`
    ctx.fillStyle = '#000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 旋转画布
    ctx.translate(width / 2, height / 2)
    ctx.rotate((angle * Math.PI) / 180)

    // 获取水印文本
    const watermarkText = content || 
      (session ? `${session.user.name || session.user.phone} 专属` : '深海圈专属')

    // 绘制文本
    ctx.fillText(watermarkText, 0, 0)
    
    // 添加时间戳
    ctx.font = `${fontSize - 2}px Arial, sans-serif`
    ctx.fillText(new Date().toLocaleDateString(), 0, fontSize + 5)

    // 将画布转为图片
    const base64Url = canvas.toDataURL()

    // 设置为背景
    if (containerRef.current) {
      containerRef.current.style.backgroundImage = `url(${base64Url})`
      containerRef.current.style.backgroundRepeat = 'repeat'
      containerRef.current.style.backgroundPosition = '0 0'
      containerRef.current.style.backgroundSize = `${width}px ${height}px`
    }

    // 防止水印被删除
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'style' &&
            containerRef.current) {
          containerRef.current.style.backgroundImage = `url(${base64Url})`
        }
      })
    })

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        attributes: true,
        attributeFilter: ['style']
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [content, opacity, fontSize, angle, gap, session])

  return (
    <div 
      ref={containerRef}
      className="watermark-container fixed inset-0 pointer-events-none z-50"
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    />
  )
}

// 文字水印组件 - 用于文本内容
export function TextWatermark({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  
  return (
    <div className="relative">
      {children}
      <div 
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 100px,
            rgba(0, 0, 0, 0.03) 100px,
            rgba(0, 0, 0, 0.03) 200px
          )`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-5 text-6xl font-bold text-gray-500 rotate-[-20deg]">
          {session?.user.name || '深海圈'}
        </div>
      </div>
    </div>
  )
}

// 图片水印组件
export function ImageWatermark({ 
  src, 
  alt,
  className 
}: { 
  src: string
  alt: string
  className?: string 
}) {
  const { data: session } = useSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [watermarkedSrc, setWatermarkedSrc] = useState<string>(src)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height

      // 绘制原图
      ctx.drawImage(img, 0, 0)

      // 添加水印
      ctx.globalAlpha = 0.3
      ctx.font = 'bold 20px Arial'
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const text = session?.user.name || '深海圈'
      
      // 重复绘制水印
      for (let x = 0; x < canvas.width; x += 150) {
        for (let y = 0; y < canvas.height; y += 150) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(-Math.PI / 6)
          ctx.fillText(text, 0, 0)
          ctx.restore()
        }
      }

      setWatermarkedSrc(canvas.toDataURL())
    }
  }, [src, session])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <img 
        src={watermarkedSrc} 
        alt={alt}
        className={className}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
      />
    </>
  )
}