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
  const skills = skillGroups.flatMap((group) => group.items)

  return (
    <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/30" aria-hidden>
      <svg viewBox="0 0 100 100" className="h-52 w-full sm:h-64">
        {links.map(([from, to]) => {
          const a = positions[from]
          const b = positions[to]
          if (!a || !b) return null
          return (
            <line
              key={`${from}-${to}`}
              x1={a[0]}
              y1={a[1]}
              x2={b[0]}
              y2={b[1]}
              stroke="rgba(228,224,204,0.35)"
              strokeWidth="0.35"
              className={reduce ? undefined : 'constellation-line'}
            />
          )
        })}
        {skills.map((skill, index) => {
          const point = positions[index]
          if (!point) return null
          return (
            <g key={skill.name}>
              <circle cx={point[0]} cy={point[1]} r="1.15" fill="#f4f1e4" className={reduce ? undefined : 'twinkle'} />
              <text x={point[0] + 1.8} y={point[1] - 1.4} fill="#d6d3c4" fontSize="3.2" className="hidden sm:inline">
                {skill.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
