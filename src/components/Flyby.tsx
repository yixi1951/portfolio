import { useReducedMotion } from 'framer-motion'

function Rocket({ className = '', id = 'flame' }: { className?: string; id?: string }) {
  return (
    <svg className={className} viewBox="0 0 168 48" fill="none">
      <defs>
        <radialGradient id={id} cx="0.72" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff4d8" stopOpacity="0.9" />
          <stop offset="32%" stopColor="#ffb15a" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ff7a3a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="exhaust" cx="46" cy="24" rx="34" ry="10" fill={`url(#${id})`} />
      <path d="M58 24 L148 24 L132 16.5 L108 18.5 L92 12 L78 20 Z" fill="#f4efe2" />
      <path d="M58 24 L148 24 L132 31.5 L108 29.5 L92 36 L78 28 Z" fill="#c5d0e6" />
      <path d="M86 24 L102 17.5 L112 24 L102 30.5 Z" fill="#9eb0d4" />
      <path d="M122 24 L134 19.5 L142 24 L134 28.5 Z" fill="#1c1e28" />
    </svg>
  )
}

export function Flyby() {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden" aria-hidden>
      <Rocket className="flyby-rocket" id="flame-a" />
      <Rocket className="flyby-rocket alt" id="flame-b" />
    </div>
  )
}
