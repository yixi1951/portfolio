import { useEffect, useRef } from 'react'

type Dot = { x: number; y: number; life: number }

export function StarCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(max-width: 768px)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = canvas.getContext('2d')
    if (!context) return

    const dots: Dot[] = []
    let frame = 0
    let stopped = false
    const pointer = { x: -100, y: -100, on: false }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const loop = () => {
      if (stopped) return
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (pointer.on && dots.length < 16) {
        dots.push({ x: pointer.x, y: pointer.y, life: 1 })
      }
      for (let index = dots.length - 1; index >= 0; index -= 1) {
        const dot = dots[index]
        dot.life -= 0.045
        if (dot.life <= 0) {
          dots.splice(index, 1)
          continue
        }
        context.globalAlpha = dot.life * 0.8
        context.fillStyle = '#f4f1e4'
        context.beginPath()
        context.arc(dot.x, dot.y, 1.4 * dot.life, 0, Math.PI * 2)
        context.fill()
      }
      context.globalAlpha = 1
      frame = window.requestAnimationFrame(loop)
    }

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.on = true
    }
    const onLeave = () => {
      pointer.on = false
    }

    resize()
    frame = window.requestAnimationFrame(loop)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)

    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-30" aria-hidden />
}
