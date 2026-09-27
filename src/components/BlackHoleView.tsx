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

function Still() {
  return (
    <img
      src="/media/black-hole-still.webp"
      alt=""
      width={1040}
      height={320}
      className="absolute inset-0 h-full w-full object-cover"
      draggable={false}
    />
  )
}

export function BlackHoleView() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduce = Boolean(useReducedMotion())
  const mobile = useMobile()
  const light = reduce || mobile
  const [fallback, setFallback] = useState(false)

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
        void import('../space/nasaHole')
          .then(({ mountNasaHole }) => {
            if (cancelled || !hostRef.current) return
            cleanup = mountNasaHole(hostRef.current, { onError: () => setFallback(true) })
          })
          .catch(() => {
            if (!cancelled) setFallback(true)
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

  if (light || fallback) return <Still />

  return (
    <div ref={hostRef} className="scene-host absolute inset-0 touch-none">
      <Still />
    </div>
  )
}
