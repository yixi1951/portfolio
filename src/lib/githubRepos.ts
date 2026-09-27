import { githubProjectMeta, hiddenGithubRepos, type Localized } from '../data/githubProjects'
import { profile } from '../data/profile'

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
  fork: boolean
  homepage: string | null
}

export type DisplayRepo = GithubRepo & {
  title: Localized
  summary: Localized
  tags: string[]
  order: number
}

const CACHE_KEY = 'github-repos-cache-v2'
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
    /* ignore */
  }
}

export async function fetchNonForkRepos(username = profile.githubUsername): Promise<GithubRepo[]> {
  const cached = readCache(username)
  if (cached) return cached

  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, {
    headers: { Accept: 'application/vnd.github+json' },
  })

  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}`)
  }

  const data = (await res.json()) as GithubRepo[]
  const repos = data.filter((r) => !r.fork && !hiddenGithubRepos.has(r.name) && r.name.trim() !== '-')
  writeCache(username, repos)
  return repos
}

export function toDisplayRepos(repos: GithubRepo[]): DisplayRepo[] {
  const byName = new Map(repos.map((repo) => [repo.name, repo]))

  const curated = Object.entries(githubProjectMeta).map(([name, meta]) => {
    const live = byName.get(name)
    return {
      name,
      description: live?.description ?? meta.summary.zh,
      html_url: live?.html_url ?? repoUrl(name),
      language: live?.language ?? meta.language,
      stargazers_count: live?.stargazers_count ?? 0,
      updated_at: live?.updated_at ?? '',
      fork: false,
      homepage: live?.homepage ?? null,
      title: meta.title,
      summary: meta.summary,
      tags: meta.tags,
      order: meta.order,
    } satisfies DisplayRepo
  })

  const extras = repos
    .filter((repo) => !githubProjectMeta[repo.name])
    .map((repo) => ({
      ...repo,
      title: { zh: repo.name, en: repo.name },
      summary: {
        zh: repo.description || '暂无简介',
        en: repo.description || 'No description',
      },
      tags: [],
      order: 99,
    }))

  return [...curated, ...extras].sort(
    (a, b) => a.order - b.order || +new Date(b.updated_at) - +new Date(a.updated_at),
  )
}