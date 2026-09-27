import type { ReactNode } from 'react'

const rings = [
  { size: '54%', duration: '5.5s', reverse: false, hue: '#fff6d8', planet: 12 },
  { size: '76%', duration: '8s', reverse: true, hue: '#8eb0ff', planet: 16 },
  { size: '100%', duration: '11s', reverse: false, hue: '#f0b48a', planet: 13 },
]

export function SolarSystem({ children, className = 'h-64 w-64' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      {rings.map((ring) => (
        <div
          key={ring.size}
          className="orbit"
          style={{
            width: ring.size,
            height: ring.size,
            animationDuration: ring.duration,
            animationDirection: ring.reverse ? 'reverse' : 'normal',
            borderColor: ring.hue,
          }}
        >
          <span
            className="planet"
            style={{
              width: ring.planet,
              height: ring.planet,
              background: `radial-gradient(circle at 35% 35%, #fff, ${ring.hue} 55%, #2a2418)`,
              boxShadow: `0 0 12px ${ring.hue}, 0 0 28px ${ring.hue}`,
            }}
          >
            <span
              className="planet-trail"
              style={{
                background: `linear-gradient(90deg, transparent, ${ring.hue})`,
                ...(ring.reverse ? { left: '75%' } : { right: '75%' }),
              }}
            />
          </span>
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
