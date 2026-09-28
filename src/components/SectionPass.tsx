import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react'

type Kind = 'ship' | 'streaks' | 'warp'

function Ship() {
  const uid = useId().replace(/:/g, '')
  const trail = `ship-trail-${uid}`
  const glow = `ship-glow-${uid}`
  return (
    <svg className="pass-ship" viewBox="0 0 180 56" fill="none" aria-hidden>
      <defs>
        <linearGradient id={trail} x1="0" y1="28" x2="96" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffb27a" stopOpacity="0" />
          <stop offset="70%" stopColor="#ffd7ae" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff1d4" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id={glow} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff6df" stopOpacity="0.95" />
          <stop offset="35%" stopColor="#ffb15a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ff7a3a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M6 28 C36 26 68 28 98 28" stroke={`url(#${trail})`} strokeWidth="3.2" strokeLinecap="round" />
      <ellipse cx="104" cy="28" rx="22" ry="9" fill={`url(#${glow})`} />
      <path d="M108 28 L168 28 L154 18.5 L132 21 L120 14 L112 24 Z" fill="#f4efe2" />
      <path d="M108 28 L168 28 L154 37.5 L132 35 L120 42 L112 32 Z" fill="#c5d0e6" />
      <path d="M146 28 L156 23.5 L162 28 L156 32.5 Z" fill="#1c1e28" />
      <path d="M118 28 L128 22 L134 28 L128 34 Z" fill="#9eb0d4" />
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
