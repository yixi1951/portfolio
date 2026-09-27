import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

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

function AstronautPoster({ reduced }: { reduced: boolean }) {
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const image = imageRef.current
    if (!image || reduced) return
    let yaw = 18
    let dragging = false
    let lastX = 0
    const paint = (x = 0, y = 0) => {
      image.style.transform = `perspective(900px) rotateY(${yaw}deg) translate3d(${x}px, ${y}px, 0)`
    }
    paint()
    const onDown = (event: PointerEvent) => {
      dragging = true
      lastX = event.clientX
      image.setPointerCapture(event.pointerId)
    }
    const onUp = (event: PointerEvent) => {
      dragging = false
      if (image.hasPointerCapture(event.pointerId)) image.releasePointerCapture(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      const rect = image.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 16
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10
      if (dragging) {
        yaw += (event.clientX - lastX) * 0.45
        lastX = event.clientX
      }
      paint(x, y)
    }
    image.addEventListener('pointerdown', onDown)
    image.addEventListener('pointerup', onUp)
    image.addEventListener('pointermove', onMove)
    return () => {
      image.removeEventListener('pointerdown', onDown)
      image.removeEventListener('pointerup', onUp)
      image.removeEventListener('pointermove', onMove)
    }
  }, [reduced])

  return (
    <img
      ref={imageRef}
      src="/models/astronaut-poster.webp"
      alt=""
      width={960}
      height={540}
      className="absolute inset-0 h-full w-full object-cover object-center touch-none"
      draggable={false}
    />
  )
}

export function SpacewalkView() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduce = Boolean(useReducedMotion())
  const mobile = useMobile()
  const light = reduce || mobile

  useEffect(() => {
    if (light) return
    const host = hostRef.current
    if (!host) return
    let cleanup = () => {}
    let cancelled = false
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        io.disconnect()
        void import('../space/spacewalk').then(({ mountSpacewalk }) => {
          if (cancelled || !hostRef.current) return
          cleanup = mountSpacewalk(hostRef.current, { reduced: false })
        })
      },
      { rootMargin: '280px' },
    )
    io.observe(host)
    return () => {
      cancelled = true
      io.disconnect()
      cleanup()
    }
  }, [light])

  if (light) return <AstronautPoster reduced={reduce} />
  return <div ref={hostRef} className="scene-host absolute inset-0" />
}
