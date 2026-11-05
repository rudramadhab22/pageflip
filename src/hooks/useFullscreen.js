import { useCallback, useEffect, useState } from 'react'

function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement ||
    null
  )
}

async function requestFs(node) {
  if (node.requestFullscreen) return node.requestFullscreen()
  if (node.webkitRequestFullscreen) return node.webkitRequestFullscreen()
  if (node.msRequestFullscreen) return node.msRequestFullscreen()
  throw new Error('Fullscreen API unavailable')
}

async function exitFs() {
  if (document.exitFullscreen) return document.exitFullscreen()
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen()
  if (document.msExitFullscreen) return document.msExitFullscreen()
}

export function useFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(getFullscreenElement()))
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  const enter = useCallback(async () => {
    const node = targetRef.current
    if (!node || getFullscreenElement()) return false
    try {
      await requestFs(node)
      return true
    } catch {
      return false
    }
  }, [targetRef])

  const exit = useCallback(async () => {
    if (!getFullscreenElement()) return false
    try {
      await exitFs()
      return true
    } catch {
      return false
    }
  }, [])

  const toggle = useCallback(async () => {
    if (getFullscreenElement()) return exit()
    return enter()
  }, [enter, exit])

  return { isFullscreen, enter, exit, toggle }
}
