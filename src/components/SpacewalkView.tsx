import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function SpacewalkView() {
  const hostRef = useRef<HTMLDivElement>(null)
  const reduce = Boolean(useReducedMotion())

  useEffect(() => {
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
          cleanup = mountSpacewalk(hostRef.current, { reduced: reduce })
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

  return <div ref={hostRef} className="scene-host absolute inset-0 touch-none" />
}
