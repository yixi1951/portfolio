import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

type Kind = 'ship' | 'streaks' | 'warp'

function Ship() {
  return (
    <svg className="pass-ship" viewBox="0 0 140 40" fill="none" aria-hidden>
      <path d="M38 20 L8 20" stroke="#d7e2ff" strokeWidth="6" strokeLinecap="round" />
      <path d="M30 20 L4 14" stroke="#9eb4ff" strokeWidth="2" strokeLinecap="round" />
      <path d="M36 20 L70 20 L82 8 L118 18 L82 32 L70 20 Z" fill="#f4f1e4" />
      <path d="M82 8 L96 20 L82 32 L90 20 Z" fill="#c9d4ff" />
      <circle cx="96" cy="20" r="3.2" fill="#14140f" />
      <path d="M58 20 L48 11 L62 18 Z" fill="#9eb0ff" />
      <path d="M58 20 L48 29 L62 22 Z" fill="#9eb0ff" />
    </svg>
  )
}

function Overlay({ kind, mobile, onDone }: { kind: Kind; mobile: boolean; onDone: () => void }) {
  const count = mobile ? 6 : 14
  const duration = kind === 'ship' ? 1400 : kind === 'warp' ? 1100 : 900

  useEffect(() => {
    const timer = window.setTimeout(onDone, duration)
    return () => window.clearTimeout(timer)
  }, [duration, onDone])

  if (kind === 'ship') {
    return (
      <div className="pass-layer" aria-hidden>
        <Ship />
      </div>
    )
  }

  if (kind === 'warp') {
    return (
      <div className="pass-layer" aria-hidden>
        <div className={mobile ? 'pass-warp pass-warp-lite' : 'pass-warp'} />
      </div>
    )
  }

  return (
    <div className="pass-layer" aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="pass-streak"
          style={
            {
              '--a': `${(index / count) * 170 - 85}deg`,
              animationDelay: `${(index % 4) * 0.04}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export function SectionPass({ children, kind }: { children: ReactNode; kind: Kind }) {
  const reduce = useReducedMotion()
  const [live, setLive] = useState(false)
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 768px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)')
    const onChange = () => setMobile(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  if (reduce) return <>{children}</>

  const initial =
    kind === 'warp'
      ? { opacity: 0, scale: 0.96 }
      : kind === 'streaks'
        ? { opacity: 0, scale: 1.025 }
        : { opacity: 0, y: mobile ? 16 : 28 }

  return (
    <motion.div
      className="section-pass"
      initial={initial}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: mobile ? 0.45 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      onViewportEnter={() => setLive(true)}
    >
      {children}
      {live && <Overlay kind={kind} mobile={mobile} onDone={() => setLive(false)} />}
    </motion.div>
  )
}
