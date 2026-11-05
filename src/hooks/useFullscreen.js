import { useCallback, useEffect, useState } from 'react'

export function useFullscreen(targetRef) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const enter = useCallback(async () => {
    const node = targetRef.current
    if (!node || document.fullscreenElement) return
    try {
      await node.requestFullscreen()
    } catch {
      // Browser may deny without gesture; ignore.
    }
  }, [targetRef])

  const exit = useCallback(async () => {
    if (!document.fullscreenElement) return
    try {
      await document.exitFullscreen()
    } catch {
      // ignore
    }
  }, [])

  const toggle = useCallback(async () => {
    if (document.fullscreenElement) await exit()
    else await enter()
  }, [enter, exit])

  return { isFullscreen, enter, exit, toggle }
}
