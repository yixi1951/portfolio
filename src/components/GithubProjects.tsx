import { motion } from 'framer-motion'
import { Code2, ExternalLink, Loader2, Rocket, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { useI18n } from '../i18n'
import { fetchNonForkRepos, toDisplayRepos, type DisplayRepo } from '../lib/githubRepos'

const copy = {
  zh: {
    label: '开源项目',
    title: '我做过的项目',
    desc: '自己写的作品：舆情选股、农业 AI 和表格核验。点卡片打开仓库。',
    stars: '星标',
    updated: '更新',
    viewRepo: '打开仓库',
    allOnGithub: '在 GitHub 查看全部',
  },
  en: {
    label: 'Open source',
    title: 'Things I have built',
    desc: 'My own work: sentiment-driven stock research, crop-disease AI, and spreadsheet recon. Click a card to open the repo.',
    stars: 'Stars',
    updated: 'Updated',
    viewRepo: 'Open repo',
    allOnGithub: 'See all on GitHub',
  },
} as const

function formatDate(iso: string, lang: 'zh' | 'en') {
  const d = new Date(iso)
  return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function GithubProjects() {
  const { lang } = useI18n()
  const c = copy[lang]
  const [repos, setRepos] = useState<DisplayRepo[]>([])
  const [status, setStatus] = useState<'loading' | 'ok'>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    fetchNonForkRepos()
      .then((list) => {
        if (!cancelled) {
          setRepos(toDisplayRepos(list))
          setStatus('ok')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRepos(toDisplayRepos([]))
          setStatus('ok')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="github-projects" className="relative px-4 py-4 md:px-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/5 bg-[#101010] p-5 sm:p-7 md:p-9">
        <motion.div
          className="pointer-events-none absolute -right-8 top-8 opacity-40 md:opacity-70"
          animate={{ x: [0, 12, 0], y: [0, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Rocket className="h-16 w-16 rotate-45 text-primary/30" />
        </motion.div>
        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40 sm:text-[10px]">{c.label}</p>
            <h2 className="mt-3 text-2xl font-medium text-[#E1E0CC] sm:text-3xl">{c.title}</h2>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-gray-400 sm:text-sm">{c.desc}</p>
        </div>

        {status === 'loading' && (
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
            <span>{lang === 'zh' ? '正在对接空间站…' : 'Docking with the station…'}</span>
          </div>
        )}

        {status === 'ok' && (
          <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, index) => (
              <motion.a
                key={repo.html_url + repo.name}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                drag
                dragElastic={0.06}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                whileHover={{ y: -4, borderColor: 'rgba(225,224,204,0.25)' }}
                whileDrag={{ scale: 1.02 }}
                className="group relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-black/35 p-5 transition-colors hover:bg-white/[0.04]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.36) }}
              >
                <motion.div
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full border border-primary/10 bg-primary/5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                />
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-medium text-primary group-hover:text-[#f5f4e0]">
                      {repo.title[lang]}
                    </h3>
                    {repo.title[lang] !== repo.name && (
                      <p className="mt-1 font-mono text-[11px] text-gray-600">{repo.name}</p>
                    )}
                  </div>
                  <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-3 min-h-[4.5rem] text-sm leading-relaxed text-gray-400">
                  {repo.summary[lang]}
                </p>
                {repo.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {repo.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-0.5 text-[10px] tracking-wide text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  {repo.language && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-2 py-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-primary/50" />
                      {repo.stargazers_count} {c.stars}
                    </span>
                  )}
                  {repo.updated_at && (
                    <span>
                      {c.updated} {formatDate(repo.updated_at, lang)}
                    </span>
                  )}
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary/70 opacity-0 transition-opacity group-hover:opacity-100">
                  {c.viewRepo} →
                </span>
              </motion.a>
            ))}
          </div>
        )}

        <motion.a
          href={profile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-300 transition-colors hover:border-primary/25 hover:bg-white/[0.06] hover:text-primary"
          whileHover={{ gap: 12 }}
        >
          <Code2 className="h-4 w-4" />
          {c.allOnGithub}
        </motion.a>
      </div>
    </section>
  )
}
