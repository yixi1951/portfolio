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

export function BlackHoleView() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduce = Boolean(useReducedMotion())
  const mobile = useMobile()
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    if (fallback) return
    const host = hostRef.current
    if (!host) return
    let cleanup = () => {}
    let cancelled = false
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        io.disconnect()
        void import('../space/kerrHole')
          .then(({ mountKerrHole }) => {
            if (cancelled || !hostRef.current) return
            cleanup = mountKerrHole(hostRef.current, {
              mobile,
              reduced: reduce,
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
  }, [fallback, mobile, reduce])

  return (
    <div ref={hostRef} className="scene-host absolute inset-0 touch-none">
      {fallback && (
        <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2">
          <div className="bh-ring" />
          <div className="bh-core" />
        </div>
      )}
    </div>
  )
}
