import { skillGroups } from '../data/profile'
import { useI18n } from '../i18n-context'
import { Constellation } from './Constellation'
import { Reveal } from './Reveal'

export function Skills() {
  const { lang } = useI18n()

  return (
    <section id="skills" className="pointer-events-none scroll-mt-24 px-4 py-10 md:px-6 md:py-20">
      <Reveal className="stage-copy">
      <div className="rounded-3xl border border-white/10 glass-panel p-6 sm:p-8 md:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
          {lang === 'zh' ? '技能' : 'Skills'}
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight text-[#f6f3e6] sm:text-4xl">
          {lang === 'zh' ? '仓库里实际在用的技术' : 'What the repositories actually use'}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
          {lang === 'zh'
            ? '每一项都能对上公开仓库，或对上原来的个人资料。没有单独做熟练度打分。'
            : 'Each item maps to a public repository or to the existing profile. There is no invented proficiency score.'}
        </p>

        <Constellation />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <div key={group.title.en}>
              <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-[#e4e0cc]">{group.title[lang]}</h3>
              <ul className="mt-4 space-y-4">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <p className="text-base text-[#f3f0e2]">{item.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{item.note[lang]}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      </Reveal>
    </section>
  )
}
