import { profile } from '../data/profile'
import { useI18n } from '../i18n-context'
import { OrbitTrail } from './OrbitTrail'
import { Reveal } from './Reveal'

export function About() {
  const { lang } = useI18n()

  return (
    <section id="about" className="scroll-mt-24 px-4 py-4 md:px-6">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
        <div className="tilt-card glow-card h-full rounded-3xl border border-white/10 bg-[#10131a] p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
            {lang === 'zh' ? '关于' : 'About'}
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-[#f6f3e6] sm:text-4xl">
            {lang === 'zh' ? '学生，也在把项目做完。' : 'A student who ships the whole project.'}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-300">{profile.bio[lang]}</p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">{profile.intent[lang]}</p>
        </div>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.12}>
        <div className="tilt-card glow-card h-full rounded-3xl border border-white/10 bg-[#10131a] p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
            {lang === 'zh' ? '课程' : 'Coursework'}
          </p>
          <ul className="mt-5 space-y-3">
            {profile.courses.map((course) => (
              <li key={course.en} className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 text-sm last:border-b-0 last:pb-0">
                <span className="text-[#f3f0e2]">{course[lang]}</span>
                <span className="text-zinc-500" aria-hidden>
                  —
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {profile.languages.map((item) => (
              <span key={item.name.en} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200">
                {item.name[lang]} · {item.level[lang]}
              </span>
            ))}
          </div>
        </div>
        </Reveal>

        <Reveal className="lg:col-span-4" delay={0.08}>
        <div className="tilt-card glow-card h-full rounded-3xl border border-white/10 bg-[#10131a] p-6 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
            {lang === 'zh' ? '荣誉' : 'Honors'}
          </p>
          <ul className="mt-4 space-y-3">
            {profile.honors.map((honor) => (
              <li key={honor.en} className="text-sm leading-relaxed text-zinc-200">
                {honor[lang]}
              </li>
            ))}
          </ul>
        </div>
        </Reveal>

        <Reveal className="lg:col-span-5" delay={0.16}>
        <div className="tilt-card glow-card h-full rounded-3xl border border-white/10 bg-[#10131a] p-6 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
            {lang === 'zh' ? '学生工作' : 'Student role'}
          </p>
          <h3 className="mt-3 text-xl font-medium text-[#f3f0e2]">{profile.leadership.role[lang]}</h3>
          <p className="mt-1 text-sm text-zinc-400">{profile.leadership.period}</p>
          <ul className="mt-4 space-y-2">
            {profile.leadership.highlights.map((item) => (
              <li key={item.en} className="text-sm leading-relaxed text-zinc-300">
                {item[lang]}
              </li>
            ))}
          </ul>
        </div>
        </Reveal>

        <Reveal className="lg:col-span-3" delay={0.24}>
        <div className="tilt-card glow-card h-full rounded-3xl border border-white/10 bg-[#10131a] p-6 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
            {lang === 'zh' ? '此外' : 'Also'}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-300">{profile.hobby[lang]}</p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            {profile.degree[lang]} · {profile.location[lang]}
          </p>
        </div>
        </Reveal>

        <OrbitTrail />
      </div>
    </section>
  )
}
