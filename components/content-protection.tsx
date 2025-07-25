"use client"

import { useEffect } from "react"

interface ContentProtectionProps {
  children: React.ReactNode
  disableSelect?: boolean
  disableCopy?: boolean
  disableRightClick?: boolean
  disablePrint?: boolean
  disableScreenshot?: boolean
}

export function ContentProtection({
  children,
  disableSelect = true,
  disableCopy = true,
  disableRightClick = true,
  disablePrint = true,
  disableScreenshot = false,
}: ContentProtectionProps) {
  useEffect(() => {
    // 禁用选择
    const handleSelectStart = (e: Event) => {
      if (disableSelect) {
        e.preventDefault()
        return false
      }
    }

    // 禁用复制
    const handleCopy = (e: ClipboardEvent) => {
      if (disableCopy) {
        e.preventDefault()
        alert("内容受保护，禁止复制")
        return false
      }
    }

    // 禁用右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      if (disableRightClick) {
        e.preventDefault()
        return false
      }
    }

    // 禁用打印
    const handleBeforePrint = (e: Event) => {
      if (disablePrint) {
        e.preventDefault()
        alert("内容受保护，禁止打印")
        return false
      }
    }

    // 禁用键盘快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      // 禁用 Ctrl+A (全选)
      if (disableSelect && e.ctrlKey && e.key === "a") {
        e.preventDefault()
        return false
      }
      
      // 禁用 Ctrl+C (复制)
      if (disableCopy && e.ctrlKey && e.key === "c") {
        e.preventDefault()
        return false
      }
      
      // 禁用 Ctrl+X (剪切)
      if (disableCopy && e.ctrlKey && e.key === "x") {
        e.preventDefault()
        return false
      }
      
      // 禁用 Ctrl+P (打印)
      if (disablePrint && e.ctrlKey && e.key === "p") {
        e.preventDefault()
        return false
      }
      
      // 禁用 F12 (开发者工具)
      if (e.key === "F12") {
        e.preventDefault()
        return false
      }
      
      // 禁用 Ctrl+Shift+I (开发者工具)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault()
        return false
      }
    }

    // 添加事件监听器
    document.addEventListener("selectstart", handleSelectStart)
    document.addEventListener("copy", handleCopy)
    document.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("beforeprint", handleBeforePrint)
    document.addEventListener("keydown", handleKeyDown)

    // 禁用拖拽
    const images = document.querySelectorAll("img")
    images.forEach(img => {
      img.draggable = false
    })

    // 清理函数
    return () => {
      document.removeEventListener("selectstart", handleSelectStart)
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("beforeprint", handleBeforePrint)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [disableSelect, disableCopy, disableRightClick, disablePrint])

  return (
    <div 
      className="select-none"
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        KhtmlUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  )
}