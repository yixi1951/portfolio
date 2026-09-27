import { useReducedMotion } from 'framer-motion'

function Rocket({ className = '', id = 'flame' }: { className?: string; id?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 40" fill="none">
      <g className="exhaust">
        <path d="M38 20 L6 20" stroke={`url(#${id})`} strokeWidth="7" strokeLinecap="round" />
        <path d="M30 20 L2 14" stroke="#9eb4ff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        <path d="M28 20 L4 27" stroke="#f4f1e4" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
        <circle cx="10" cy="16" r="1.7" fill="#d7e2ff" />
        <circle cx="4" cy="22" r="1.3" fill="#f7f4ea" />
        <circle cx="14" cy="26" r="1.5" fill="#8ea6ff" />
      </g>
      <path d="M36 20 L70 20 L82 8 L118 18 L82 32 L70 20 Z" fill="#f4f1e4" />
      <path d="M82 8 L96 20 L82 32 L90 20 Z" fill="#c9d4ff" />
      <circle cx="96" cy="20" r="3.2" fill="#14140f" />
      <path d="M58 20 L48 11 L62 18 Z" fill="#9eb0ff" />
      <path d="M58 20 L48 29 L62 22 Z" fill="#9eb0ff" />
      <defs>
        <linearGradient id={id} x1="38" y1="20" x2="4" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f4f1e4" />
          <stop offset="0.45" stopColor="#9eb4ff" />
          <stop offset="1" stopColor="#9eb4ff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Flyby() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden>
      <Rocket className="flyby-rocket" id="flame-a" />
      <Rocket className="flyby-rocket alt" id="flame-b" />
    </div>
  )
}
