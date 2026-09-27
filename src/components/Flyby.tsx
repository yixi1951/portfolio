import { useReducedMotion } from 'framer-motion'

export function Flyby() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      <svg className="flyby-rocket" viewBox="0 0 64 28" width="64" height="28">
        <path d="M4 16 L28 16 L36 8 L52 14 L36 20 L28 12 Z" fill="#e4e0cc" opacity="0.9" />
        <path d="M8 16 H2" stroke="#9aa7ff" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="40" cy="14" r="2" fill="#14140f" />
      </svg>
    </div>
  )
}
