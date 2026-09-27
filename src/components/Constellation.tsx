import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { skillGroups } from '../data/profile'

const positions = [
  [8, 46],
  [20, 24],
  [18, 68],
  [6, 82],
  [34, 32],
  [42, 58],
  [36, 80],
  [50, 28],
  [62, 18],
  [70, 42],
  [64, 66],
  [80, 30],
  [88, 54],
  [78, 78],
] as const

const links: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [5, 6],
  [4, 7],
  [7, 8],
  [8, 9],
  [9, 10],
  [9, 11],
  [11, 12],
  [10, 13],
  [7, 9],
]

export function Constellation() {
  const reduce = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hot, setHot] = useState<number | null>(null)
  const skills = skillGroups.flatMap((group) => group.items)

  useEffect(() => {
    const node = rootRef.current
    if (!node || reduce) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduce])

  return (
    <div
      ref={rootRef}
      className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/40"
      aria-hidden
      onMouseLeave={() => setHot(null)}
    >
      <svg viewBox="0 0 100 100" className="h-56 w-full sm:h-72">
        {links.map(([from, to], index) => {
          const a = positions[from]
          const b = positions[to]
          if (!a || !b) return null
          const lit = hot === from || hot === to
          return (
            <line
              key={`${from}-${to}`}
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              pathLength={1}
              stroke={lit ? '#f7f4ea' : 'rgba(190,205,255,0.55)'}
              strokeWidth={lit ? 1.15 : 0.45}
              className={!reduce && visible ? 'constellation-draw' : undefined}
              style={
                reduce
                  ? undefined
                  : visible
                    ? { animationDelay: `${index * 0.06}s` }
                    : { strokeDasharray: 1, strokeDashoffset: 1 }
              }
            />
          )
        })}
        {skills.map((skill, index) => {
          const point = positions[index]
          if (!point) return null
          const active = hot === index
          return (
            <g
              key={skill.name}
              className={reduce ? undefined : 'star-float'}
              style={reduce ? undefined : { animationDelay: `${(index % 6) * 0.18}s` }}
              onMouseEnter={() => setHot(index)}
            >
              <circle
                cx={point[0]}
                cy={point[1]}
                r={active ? 5.2 : 3.4}
                fill={active ? 'rgba(244,241,228,0.55)' : 'rgba(160,180,255,0.28)'}
                className={reduce ? undefined : 'star-halo'}
                style={reduce ? undefined : { animationDelay: `${index * 0.11}s` }}
              />
              <circle
                cx={point[0]}
                cy={point[1]}
                r="1.45"
                fill="#fffaf0"
                className={reduce ? undefined : 'twinkle-strong'}
                style={reduce ? undefined : { animationDelay: `${index * 0.13}s` }}
              />
              <circle cx={point[0]} cy={point[1]} r="4.5" fill="transparent" />
              <text x={point[0] + 2.2} y={point[1] - 1.6} fill="#f4f1e4" fontSize="3.4" className="hidden sm:inline">
                {skill.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
