import { profile } from '../data/profile'
import { useI18n } from '../i18n-context'

const links = {
  zh: [
    { href: '#about', label: '关于' },
    { href: '#projects', label: '项目' },
    { href: '#skills', label: '技能' },
    { href: '#contact', label: '联系' },
  ],
  en: [
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#skills', label: 'Skills' },
    { href: '#contact', label: 'Contact' },
  ],
} as const

export function SiteHeader() {
  const { lang, toggleLang } = useI18n()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07080d]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 md:px-6">
        <a href="#top" className="flex min-w-0 items-baseline gap-2">
          <span className="text-sm font-medium tracking-wide text-[#f3f0e2]">{profile.name}</span>
          <span className="hidden text-xs text-zinc-400 sm:inline">{profile.nameEn}</span>
        </a>
        <nav className="flex flex-wrap items-center gap-1" aria-label={lang === 'zh' ? '页内导航' : 'On this page'}>
          {links[lang].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-[#f3f0e2]"
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={toggleLang}
            className="ml-1 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-[#f3f0e2] transition-colors hover:border-[#e4e0cc]/40 hover:bg-white/[0.08]"
            aria-label={lang === 'zh' ? '切换到英文' : 'Switch to Chinese'}
          >
            {lang === 'zh' ? 'EN' : '中文'}
          </button>
        </nav>
      </div>
    </header>
  )
}
