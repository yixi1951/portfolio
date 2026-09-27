import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'
import { profile } from '../data/profile'
import { useI18n } from '../i18n-context'

export function Contact() {
  const { lang } = useI18n()
  const subject = encodeURIComponent(lang === 'zh' ? '你好，来自个人网站' : 'Hello from your site')

  const items = [
    {
      icon: Mail,
      label: lang === 'zh' ? '邮箱' : 'Email',
      value: profile.email,
      href: `mailto:${profile.email}?subject=${subject}`,
    },
    {
      icon: Phone,
      label: lang === 'zh' ? '电话' : 'Phone',
      value: profile.phone,
      href: profile.phoneHref,
    },
    {
      icon: ArrowUpRight,
      label: 'GitHub',
      value: profile.githubUsername,
      href: profile.githubUrl,
      external: true,
    },
    {
      icon: MapPin,
      label: lang === 'zh' ? '所在地' : 'Location',
      value: profile.location[lang],
    },
  ]

  return (
    <section id="contact" className="scroll-mt-24 px-4 py-4 pb-10 md:px-6 md:pb-16">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-[#10131a] p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-400">
            {lang === 'zh' ? '联系' : 'Contact'}
          </p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-[#f6f3e6] sm:text-4xl">
            {lang === 'zh' ? '想聊聊项目，直接写信。' : 'If a project is interesting, write.'}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            {lang === 'zh'
              ? `${profile.nameEn} · ${profile.school[lang]}`
              : `${profile.name} · ${profile.school[lang]}`}
          </p>
          <a
            href={`mailto:${profile.email}?subject=${subject}`}
            className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e4e0cc] px-5 py-2.5 text-sm font-medium text-[#14140f] transition-colors hover:bg-[#f4f1e4]"
          >
            {lang === 'zh' ? '发邮件' : 'Send an email'}
            <Mail className="h-4 w-4" aria-hidden />
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon
            const body = (
              <div className="h-full rounded-3xl border border-white/10 bg-[#10131a] p-5 transition-colors hover:border-[#e4e0cc]/25 hover:bg-white/[0.03]">
                <Icon className="h-5 w-5 text-[#e4e0cc]" aria-hidden />
                <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">{item.label}</p>
                <p className="mt-2 break-all text-sm text-[#f3f0e2]">{item.value}</p>
              </div>
            )
            if (!item.href) {
              return <div key={item.label}>{body}</div>
            }
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="block min-h-11"
              >
                {body}
              </a>
            )
          })}
        </div>
      </div>
      <footer className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-2 px-1 text-xs text-zinc-500">
        <p>
          {profile.name} · {profile.nameEn}
        </p>
        <p>yixi1951</p>
      </footer>
    </section>
  )
}
