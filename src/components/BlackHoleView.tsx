import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export function BlackHoleView() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cleanup = () => {}
    let cancelled = false
    const mobile = window.matchMedia('(max-width: 768px)').matches

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        io.disconnect()
        void import('../space/blackHole')
          .then(({ mountBlackHole }) => {
            if (cancelled || !hostRef.current) return
            cleanup = mountBlackHole(hostRef.current, {
              reduced: Boolean(reduce),
              mobile,
              onError: () => setFallback(true),
            })
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
  }, [reduce])

  return (
    <div ref={hostRef} className="scene-host absolute inset-0">
      {fallback && (
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2">
          <div className="bh-ring" />
          <div className="bh-core" />
        </div>
      )}
    </div>
  )
}
