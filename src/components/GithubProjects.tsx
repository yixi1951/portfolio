import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { profile } from '../data/profile'
import { useI18n, type Lang } from '../i18n-context'
import { fetchNonForkRepos, toDisplayRepos, type DisplayRepo } from '../lib/githubRepos'
import { languageColor } from '../lib/languages'

const copy = {
  zh: {
    label: '项目',
    title: '公开仓库',
    desc: '精选是近期比较完整的原创仓库，以及站内的考研数学学习页。其余原创仓库列在后面。Fork，以及名为 portfolio 的本站仓库，没有放进来。',
    featured: '精选',
    more: '其他原创仓库',
    pushed: '推送于',
    viewRepo: 'GitHub',
    openSite: '打开学习站',
    homepage: '主页',
    allOnGithub: '在 GitHub 查看全部',
    live: '星标和推送时间来自 GitHub',
    saved: '展示已核对的仓库资料。实时星标暂时没有取到。',
    noDescription: '仓库没有填写简介',
  },
  en: {
    label: 'Projects',
    title: 'Public repositories',
    desc: 'Featured cards are the more complete original repos, plus the Kaoyan math study page on this site. Other original work follows. Forks, and the portfolio repo for this site, are left out.',
    featured: 'Featured',
    more: 'Other original repos',
    pushed: 'Pushed',
    viewRepo: 'GitHub',
    openSite: 'Open study site',
    homepage: 'Homepage',
    allOnGithub: 'See everything on GitHub',
    live: 'Stars and push times come from GitHub',
    saved: 'Showing checked repo details. Live star counts are unavailable right now.',
    noDescription: 'This repository has no description',
  },
} as const

function formatDate(iso: string, lang: Lang) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function LanguageBadge({ language }: { language: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs text-zinc-100">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor(language) }} aria-hidden />
      {language}
    </span>
  )
}

function ProjectCard({
  repo,
  lang,
  featured,
  index,
}: {
  repo: DisplayRepo
  lang: Lang
  featured: boolean
  index: number
}) {
  const c = copy[lang]
  const reduce = useReducedMotion()
  const pushed = formatDate(repo.pushed_at, lang)
  const internal = repo.html_url.startsWith('/')

  return (
    <motion.article
      className="glow-card flex h-full flex-col rounded-3xl border border-white/10 bg-[#0c0e14] p-5 sm:p-6"
      style={{ transformPerspective: 900 }}
      initial={reduce ? false : { opacity: 0, y: 64, scale: 0.88, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      whileHover={
        reduce
          ? undefined
          : {
              rotateX: 8,
              rotateY: -10,
              y: -10,
              scale: 1.03,
              boxShadow: '0 24px 48px rgba(0,0,0,0.45), 0 0 42px rgba(150,170,255,0.45)',
              transition: { duration: 0.28, delay: 0 },
            }
      }
      viewport={{ once: true, margin: '0px 0px -48px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {repo.language && <LanguageBadge language={repo.language} />}
          {repo.also.slice(0, 2).map((language) => (
            <span key={language} className="text-xs text-zinc-400">
              {language}
            </span>
          ))}
        </div>
        {repo.period && <span className="text-xs text-zinc-400">{repo.period}</span>}
      </div>

      <h3 className={`mt-4 font-medium tracking-tight text-[#f6f3e6] ${featured ? 'text-2xl' : 'text-xl'}`}>
        {repo.title[lang]}
      </h3>
      {!internal && repo.title[lang] !== repo.name && (
        <p className="mt-1 font-mono text-xs text-zinc-400">{repo.name}</p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{repo.summary[lang] || c.noDescription}</p>

      {featured && repo.highlights.length > 0 && (
        <ul className="mt-4 space-y-2">
          {repo.highlights.map((item) => (
            <li key={item.en} className="flex gap-2 text-sm leading-relaxed text-zinc-400">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#e4e0cc]" aria-hidden />
              <span>{item[lang]}</span>
            </li>
          ))}
        </ul>
      )}

      {repo.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {repo.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-zinc-300">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-sm">
        <a
          href={repo.html_url}
          target={internal ? undefined : '_blank'}
          rel={internal ? undefined : 'noopener noreferrer'}
          className="inline-flex min-h-11 items-center gap-1 rounded-full text-[#e4e0cc] underline-offset-4 hover:underline"
        >
          {internal ? c.openSite : c.viewRepo}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1 text-zinc-300 underline-offset-4 hover:text-[#f3f0e2] hover:underline"
          >
            {c.homepage}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
        {repo.stargazers_count > 0 && (
          <span className="inline-flex items-center gap-1 text-zinc-400">
            <Star className="h-3.5 w-3.5" aria-hidden />
            {repo.stargazers_count}
          </span>
        )}
        {pushed && (
          <span className="text-zinc-400">
            {c.pushed} {pushed}
          </span>
        )}
      </div>
    </motion.article>
  )
}

export function GithubProjects() {
  const { lang } = useI18n()
  const c = copy[lang]
  const [repos, setRepos] = useState<DisplayRepo[]>(() => toDisplayRepos([]))
  const [source, setSource] = useState<'pending' | 'saved' | 'live'>('pending')

  useEffect(() => {
    let cancelled = false
    fetchNonForkRepos()
      .then((list) => {
        if (cancelled) return
        setRepos(toDisplayRepos(list))
        setSource('live')
      })
      .catch(() => {
        if (!cancelled) setSource('saved')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const featured = repos.filter((repo) => repo.featured)
  const rest = repos.filter((repo) => !repo.featured)

  return (
    <section id="projects" className="scroll-mt-24 px-4 py-4 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">{c.label}</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight text-[#f6f3e6] sm:text-4xl">{c.title}</h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">{c.desc}</p>
        </div>
        {source !== 'pending' && (
          <p className="mt-3 text-xs text-zinc-400">{source === 'live' ? c.live : c.saved}</p>
        )}

        <h3 className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">{c.featured}</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {featured.map((repo, index) => (
            <ProjectCard key={repo.name} repo={repo} lang={lang} featured index={index} />
          ))}
        </div>

        {rest.length > 0 && (
          <>
            <h3 className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">{c.more}</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {rest.map((repo, index) => (
                <ProjectCard key={repo.name} repo={repo} lang={lang} featured={false} index={index} />
              ))}
            </div>
          </>
        )}

        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-100 transition-colors hover:border-[#e4e0cc]/40 hover:bg-white/[0.05]"
        >
          {c.allOnGithub}
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  )
}
