"use client"

import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

interface WatermarkProps {
  text?: string
  fontSize?: number
  color?: string
  opacity?: number
  rotate?: number
  gap?: number
}

export function Watermark({
  text,
  fontSize = 16,
  color = "rgba(0, 0, 0, 0.05)",
  opacity = 0.05,
  rotate = -45,
  gap = 100,
}: WatermarkProps) {
  const { data: session } = useSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const watermarkText = text || (session?.user?.name || session?.user?.phone || "深海圈")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布大小
    const width = 300
    const height = 200
    canvas.width = width
    canvas.height = height

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 设置样式
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = color
    ctx.globalAlpha = opacity
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // 旋转画布
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotate * Math.PI) / 180)

    // 绘制文字
    ctx.fillText(watermarkText, 0, 0)

    // 创建水印图案
    const pattern = ctx.createPattern(canvas, "repeat")
    if (!pattern) return

    // 创建水印容器
    const watermarkDiv = document.createElement("div")
    watermarkDiv.style.position = "fixed"
    watermarkDiv.style.top = "0"
    watermarkDiv.style.left = "0"
    watermarkDiv.style.width = "100%"
    watermarkDiv.style.height = "100%"
    watermarkDiv.style.pointerEvents = "none"
    watermarkDiv.style.zIndex = "9999"
    watermarkDiv.style.backgroundImage = `url(${canvas.toDataURL()})`
    watermarkDiv.style.backgroundRepeat = "repeat"
    watermarkDiv.style.backgroundSize = `${width}px ${height}px`
    watermarkDiv.className = "watermark-layer"

    document.body.appendChild(watermarkDiv)

    // 监听DOM变化，防止水印被删除
    const observer = new MutationObserver(() => {
      const existingWatermark = document.querySelector(".watermark-layer")
      if (!existingWatermark) {
        document.body.appendChild(watermarkDiv)
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      watermarkDiv.remove()
      observer.disconnect()
    }
  }, [watermarkText, fontSize, color, opacity, rotate])

  return <canvas ref={canvasRef} style={{ display: "none" }} />
}