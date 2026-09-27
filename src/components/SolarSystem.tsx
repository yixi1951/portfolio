import type { ReactNode } from 'react'

const rings = [
  { size: '58%', duration: '16s', reverse: false, hue: '#f4f1e4' },
  { size: '80%', duration: '26s', reverse: true, hue: '#9eb0ff' },
  { size: '100%', duration: '36s', reverse: false, hue: '#d7c4a3' },
]

export function SolarSystem({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`relative h-44 w-44 ${className}`} aria-hidden>
      {rings.map((ring) => (
        <div
          key={ring.size}
          className="orbit"
          style={{
            width: ring.size,
            height: ring.size,
            animationDuration: ring.duration,
            animationDirection: ring.reverse ? 'reverse' : 'normal',
          }}
        >
          <span className="planet" style={{ background: ring.hue, boxShadow: `0 0 10px ${ring.hue}` }} />
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
