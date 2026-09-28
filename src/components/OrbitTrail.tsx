import { githubProjectMeta } from '../data/githubProjects'
import { profile } from '../data/profile'
import { useI18n } from '../i18n-context'
import type { Localized } from '../data/types'

const stops: { when: string; label: Localized }[] = [
  { when: '2023.09', label: { zh: '入学', en: 'Enrolled' } },
  { when: '2026.01', label: githubProjectMeta.meisai.title },
  { when: '2026.03', label: githubProjectMeta.OpinionTradingWorkflow.title },
  { when: '2026.05', label: githubProjectMeta['Plant-Hazard-Risk-Assessment'].title },
  { when: '2026.06', label: githubProjectMeta.claudio.title },
  { when: '2026.07', label: githubProjectMeta['excel-checkout'].title },
  { when: '2027.06', label: { zh: '预计毕业', en: 'Expected graduation' } },
]

export function OrbitTrail() {
  const { lang } = useI18n()
  const width = 1000
  const height = 150
  const points = stops.map((_, index) => {
    const x = 36 + (index * (width - 72)) / (stops.length - 1)
    const y = 78 + Math.sin(index * 0.85) * 34
    return { x, y }
  })
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

  return (
    <div className="rounded-3xl border border-white/10 glass-panel p-6 sm:p-7 lg:col-span-12">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
        {lang === 'zh' ? '轨迹' : 'Trajectory'}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
        {lang === 'zh'
          ? `${profile.period} 的在读区间，以及公开仓库上的时间。`
          : `The study window ${profile.period}, with dates taken from the public repositories.`}
      </p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-28 w-full" aria-hidden>
        <path d={path} fill="none" stroke="rgba(228,224,204,0.45)" strokeWidth="2" className="trail-dash" />
        {points.map((point, index) => (
          <circle key={stops[index].when} cx={point.x} cy={point.y} r="5" fill="#e4e0cc" />
        ))}
      </svg>
      <ol className="mt-2 flex gap-3 overflow-x-auto pb-1">
        {stops.map((stop) => (
          <li key={stop.when} className="min-w-[8.5rem] shrink-0">
            <p className="text-xs text-zinc-400">{stop.when}</p>
            <p className="mt-1 text-sm leading-snug text-[#f3f0e2]">{stop.label[lang]}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
