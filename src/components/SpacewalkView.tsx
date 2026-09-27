import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n-context'

function useMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)')
    const onChange = () => setMobile(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return mobile
}

export function SpacewalkView() {
  const { lang } = useI18n()
  const reduce = Boolean(useReducedMotion())
  const mobile = useMobile()
  const light = reduce || mobile
  const rootRef = useRef<HTMLDivElement>(null)
  const earthRef = useRef<HTMLImageElement>(null)
  const astroRef = useRef<HTMLImageElement>(null)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (light) return
    const root = rootRef.current
    const earth = earthRef.current
    const astro = astroRef.current
    if (!root || !earth || !astro) return

    let frame = 0
    let stopped = false
    let dragging = false
    let lastX = 0
    let lastY = 0
    let tx = 0
    let ty = 0
    let px = 0
    let py = 0
    let nx = 0
    let ny = 0
    let rot = 0
    let vx = 0
    let vy = 0
    let vr = 0
    const started = performance.now()

    const paint = (now: number) => {
      if (stopped) return
      px += (tx - px) * 0.08
      py += (ty - py) * 0.08
      if (!dragging) {
        nx += vx
        ny += vy
        rot += vr
        vx *= 0.92
        vy *= 0.92
        vr *= 0.9
        nx *= 0.985
        ny *= 0.985
        rot *= 0.985
      }
      const floatY = Math.sin((now - started) / 900) * 8
      earth.style.transform = `translate(-50%, -50%) translate(${(px * 16).toFixed(2)}px, ${(py * 10).toFixed(2)}px) scale(1.12)`
      astro.style.transform = `translate(-50%, -50%) translate(${(px * 28 + nx).toFixed(2)}px, ${(py * 16 + ny + floatY).toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`
      frame = window.requestAnimationFrame(paint)
    }
    frame = window.requestAnimationFrame(paint)

    const onDown = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      vx = 0
      vy = 0
      vr = 0
      root.setPointerCapture(event.pointerId)
    }
    const onUp = (event: PointerEvent) => {
      dragging = false
      if (root.hasPointerCapture(event.pointerId)) root.releasePointerCapture(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      tx = (event.clientX - rect.left) / rect.width - 0.5
      ty = (event.clientY - rect.top) / rect.height - 0.5
      if (!dragging) return
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      nx = Math.max(-56, Math.min(56, nx + dx * 0.55))
      ny = Math.max(-36, Math.min(36, ny + dy * 0.4))
      rot = Math.max(-8, Math.min(8, rot + dx * 0.045))
      vx = dx * 0.45
      vy = dy * 0.3
      vr = dx * 0.04
    }
    const onLeave = () => {
      dragging = false
      tx = 0
      ty = 0
    }

    root.addEventListener('pointerdown', onDown)
    root.addEventListener('pointerup', onUp)
    root.addEventListener('pointermove', onMove)
    root.addEventListener('pointerleave', onLeave)
    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      root.removeEventListener('pointerdown', onDown)
      root.removeEventListener('pointerup', onUp)
      root.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
    }
  }, [light])

  const caption =
    lang === 'zh'
      ? '1984年 STS-41-B，布鲁斯·麦坎德利斯二世使用载人机动装置进行出舱活动。NASA S84-27017'
      : 'STS-41-B, 1984. Bruce McCandless II on the Manned Maneuvering Unit. NASA S84-27017'
  const alt = lang === 'zh' ? '布鲁斯·麦坎德利斯二世在舱外活动' : 'Bruce McCandless II during an EVA'
  const showCaption = light || hover

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 touch-none"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <img
        ref={earthRef}
        src="/media/earth-limb.webp"
        alt=""
        width={1920}
        height={1078}
        loading="lazy"
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full max-w-none object-cover"
        style={{ objectPosition: 'center 32%', transform: 'translate(-50%, -50%) scale(1.12)' }}
      />
      <img
        ref={astroRef}
        src="/media/mccandless.webp"
        alt={alt}
        width={2184}
        height={1200}
        loading="lazy"
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-[46%] h-auto w-auto max-h-[78%] max-w-[68%] select-none"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <p
        className={`pointer-events-none absolute bottom-10 left-5 z-10 max-w-[70%] rounded-md bg-black/60 px-3 py-2 text-[11px] leading-relaxed text-zinc-100 transition-opacity duration-300 ${
          showCaption ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {caption}
      </p>
    </div>
  )
}
