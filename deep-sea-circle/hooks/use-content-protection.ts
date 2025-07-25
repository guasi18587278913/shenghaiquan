import { useEffect } from 'react'

export function useContentProtection() {
  useEffect(() => {
    // 1. 禁用右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // 2. 禁用文本选择
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // 3. 禁用复制
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // 4. 禁用剪切
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // 5. 禁用拖拽
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // 6. 禁用F12和开发者工具快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+I (开发者工具)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+Shift+J (控制台)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+U (查看源代码)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        return false
      }
      
      // Ctrl+S (保存)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        return false
      }
    }

    // 7. 检测开发者工具
    let devtools = { open: false, orientation: null }
    const threshold = 160
    const emitEvent = (state: any) => {
      if (state.open) {
        console.clear()
        document.body.innerHTML = '<h1 style="text-align:center;margin-top:20%;">请关闭开发者工具</h1>'
      }
    }

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          emitEvent(devtools)
        }
      } else {
        devtools.open = false
      }
    }, 500)

    // 添加事件监听器
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCut)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('keydown', handleKeyDown)

    // 清理函数
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCut)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}

// CSS样式，防止文本选择
export const protectionStyles = `
  .content-protected {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-user-drag: none;
  }
  
  .content-protected::selection {
    background: transparent;
  }
  
  .content-protected::-moz-selection {
    background: transparent;
  }
`