import { motion } from 'framer-motion'
import { useMemo } from 'react'

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

export function Starfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${seededRandom(i * 1.1) * 100}%`,
      top: `${seededRandom(i * 2.3) * 100}%`,
      size: seededRandom(i * 3.7) > 0.85 ? 2.5 : seededRandom(i * 4.1) > 0.6 ? 1.5 : 1,
      delay: seededRandom(i * 5.2) * 4,
      duration: 2 + seededRandom(i * 6.8) * 3,
    }))
  }, [])

  const shooting = useMemo(
    () => [
      { top: '12%', delay: 0, duration: 6 },
      { top: '38%', delay: 4, duration: 7 },
      { top: '62%', delay: 9, duration: 5.5 },
    ],
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            boxShadow: s.size > 1.5 ? '0 0 8px rgba(255,255,255,0.5)' : undefined,
          }}
          animate={{ opacity: [0.15, 0.9, 0.2] }}
          transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {shooting.map((m, i) => (
        <motion.div
          key={i}
          className="absolute h-px w-24 bg-gradient-to-r from-transparent via-primary/80 to-transparent"
          style={{ top: m.top, left: '-6rem' }}
          animate={{ left: ['-6rem', '110%'], opacity: [0, 1, 0] }}
          transition={{ duration: m.duration, delay: m.delay, repeat: Infinity, repeatDelay: 12, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(225,224,204,0.06),transparent_65%)] blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -left-24 bottom-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(120,140,255,0.05),transparent_70%)] blur-3xl"
        animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}