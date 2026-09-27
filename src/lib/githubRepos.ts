import { githubProjectMeta, hiddenGithubRepos, type ProjectMeta } from '../data/githubProjects'
import { profile } from '../data/profile'
import type { Localized } from '../data/types'

function repoUrl(name: string) {
  return `${profile.githubUrl}/${encodeURIComponent(name)}`
}

export type GithubRepo = {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  updated_at: string
  pushed_at: string
  fork: boolean
  homepage: string | null
  topics?: string[]
  archived?: boolean
}

export type DisplayRepo = {
  name: string
  html_url: string
  language: string | null
  also: string[]
  stargazers_count: number
  pushed_at: string
  homepage: string | null
  title: Localized
  summary: Localized
  highlights: Localized[]
  tags: string[]
  period: string
  order: number
  featured: boolean
}

const CACHE_KEY = 'github-repos-cache-v3'
const CACHE_TTL_MS = 1000 * 60 * 30

type CachePayload = { at: number; repos: GithubRepo[] }

function readCache(username: string): GithubRepo[] | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_KEY}:${username}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachePayload
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null
    return parsed.repos
  } catch {
    return null
  }
}

function writeCache(username: string, repos: GithubRepo[]) {
  try {
    const payload: CachePayload = { at: Date.now(), repos }
    sessionStorage.setItem(`${CACHE_KEY}:${username}`, JSON.stringify(payload))
  } catch {
    /* ignore quota / private mode */
  }
}

export async function fetchNonForkRepos(username = profile.githubUsername): Promise<GithubRepo[]> {
  const cached = readCache(username)
  if (cached) return cached

  const res = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
    { headers: { Accept: 'application/vnd.github+json' } },
  )

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`)
  }

  const data = (await res.json()) as GithubRepo[]
  const repos = data.filter(
    (repo) => !repo.fork && !repo.archived && !hiddenGithubRepos.has(repo.name) && repo.name.trim() !== '-',
  )
  writeCache(username, repos)
  return repos
}

function cleanHomepage(homepage: string | null | undefined) {
  if (!homepage) return null
  const trimmed = homepage.trim()
  if (!trimmed.startsWith('http')) return null
  return trimmed
}

function fromMeta(name: string, meta: ProjectMeta, live?: GithubRepo): DisplayRepo {
  const liveTopics = (live?.topics ?? []).filter((topic) => !meta.tags.includes(topic))
  return {
    name,
    html_url: meta.sitePath ?? live?.html_url ?? repoUrl(name),
    language: live?.language ?? meta.language,
    also: meta.also.filter((lang) => lang !== (live?.language ?? meta.language)),
    stargazers_count: live?.stargazers_count ?? 0,
    pushed_at: live?.pushed_at || live?.updated_at || '',
    homepage: cleanHomepage(live?.homepage),
    title: meta.title,
    summary: meta.summary,
    highlights: meta.highlights,
    tags: [...meta.tags, ...liveTopics],
    period: meta.period,
    order: meta.order,
    featured: meta.featured,
  }
}

export function toDisplayRepos(repos: GithubRepo[]): DisplayRepo[] {
  const byName = new Map(repos.map((repo) => [repo.name, repo]))

  const curated = Object.entries(githubProjectMeta).map(([name, meta]) => fromMeta(name, meta, byName.get(name)))

  const extras = repos
    .filter((repo) => !githubProjectMeta[repo.name])
    .map((repo) => ({
      name: repo.name,
      html_url: repo.html_url,
      language: repo.language,
      also: [],
      stargazers_count: repo.stargazers_count,
      pushed_at: repo.pushed_at || repo.updated_at,
      homepage: cleanHomepage(repo.homepage),
      title: { zh: repo.name, en: repo.name },
      summary: {
        zh: repo.description || '仓库没有填写简介',
        en: repo.description || 'This repository has no description',
      },
      highlights: [],
      tags: repo.topics ?? [],
      period: '',
      order: 100,
      featured: false,
    }))

  return [...curated, ...extras].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    if (a.order !== b.order) return a.order - b.order
    return +new Date(b.pushed_at) - +new Date(a.pushed_at)
  })
}
