import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, FolderGit2, Mail } from 'lucide-react'
import { TypeLine } from './TypeLine'
import { profile } from '../data/profile'
import { useI18n } from '../i18n-context'

export function Hero() {
  const { lang } = useI18n()
  const reduce = useReducedMotion()
  const name = lang === 'zh' ? profile.name : profile.nameEn

  return (
    <section id="top" className="pointer-events-none px-4 pb-8 pt-6 md:px-6 md:pb-16 md:pt-20">
      <div className="stage-copy flex min-h-[calc(100svh-6.5rem)] items-end">
        <motion.div
          className="w-full"
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="glass-panel relative rounded-3xl border border-white/10 p-6 sm:p-8 md:p-10">
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
                {profile.school[lang]} · {profile.role[lang]}
              </p>
              <h1
                className={`mt-5 text-5xl font-medium leading-[0.95] tracking-tight text-[#f6f3e6] sm:text-6xl md:text-7xl ${reduce ? '' : 'hero-title'}`}
              >
                {reduce ? (
                  name
                ) : (
                  Array.from(name).map((character, index) => (
                    <motion.span
                      key={`${character}-${index}`}
                      className="inline-block"
                      initial={{ opacity: 0, y: 28, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, delay: index * 0.06 }}
                    >
                      {character === ' ' ? '\u00A0' : character}
                    </motion.span>
                  ))
                )}
              </h1>
              <p className="mt-3 font-serif text-2xl italic text-[#e4e0cc]/80 sm:text-3xl">
                {lang === 'zh' ? profile.nameEn : profile.name}
              </p>
              <TypeLine
                text={profile.heroTagline[lang]}
                className="mt-6 max-w-lg text-base leading-relaxed text-zinc-300 sm:text-lg"
              />
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#projects"
                  className="glow-card inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e4e0cc] px-5 py-2.5 text-sm font-medium text-[#14140f] transition-colors hover:bg-[#f4f1e4]"
                >
                  {lang === 'zh' ? '看项目' : 'View projects'}
                  <FolderGit2 className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-100 transition-colors hover:border-[#e4e0cc]/40 hover:bg-white/[0.05]"
                >
                  GitHub
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-100 transition-colors hover:border-[#e4e0cc]/40 hover:bg-white/[0.05]"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {lang === 'zh' ? '邮件' : 'Email'}
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="stage-copy mt-4 grid gap-4 lg:grid-cols-5"
        initial={reduce ? false : { opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -8% 0px' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="pointer-events-auto flex flex-col justify-between rounded-3xl bg-[#e4e0cc] p-6 text-[#16160f] lg:col-span-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-black/70">
                {lang === 'zh' ? '在读' : 'Studying'}
              </p>
              <p className="mt-4 text-2xl font-medium leading-tight">{profile.school[lang]}</p>
              <p className="mt-2 text-sm leading-relaxed text-black/75">{profile.major[lang]}</p>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-black/70">{lang === 'zh' ? '时间' : 'Years'}</dt>
                <dd className="mt-1 font-medium">{profile.period}</dd>
              </div>
              <div>
                <dt className="text-black/70">GPA</dt>
                <dd className="mt-1 font-medium">
                  {profile.gpa}
                  <span className="mt-0.5 block text-xs font-normal text-black/70">{profile.gpaRank[lang]}</span>
                </dd>
              </div>
            </dl>
          </div>
        <div className="glass-panel rounded-3xl border border-white/10 p-6 lg:col-span-3">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
            {lang === 'zh' ? '最近推送' : 'Latest push'}
          </p>
          <p className="mt-4 text-lg font-medium leading-snug text-[#f3f0e2]">OpinionTradingWorkflow</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">
            {lang === 'zh'
              ? '2026 年 9 月 22 日仍在更新：六平台舆情、DeepSeek 打分，以及情绪 / 技术 / 基本面共识。'
              : 'Still moving on 22 Sep 2026: six-source opinion ingest, DeepSeek scoring, and a sentiment / technical / fundamental consensus.'}
          </p>
          <p className="mt-4 text-sm text-zinc-400">{profile.location[lang]}</p>
        </div>
      </motion.div>
    </section>
  )
}
