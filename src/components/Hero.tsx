import { motion, useMotionValue, useTransform } from 'framer-motion'
import { ArrowRight, Code2, Rocket } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FloatingAstronaut } from './FloatingAstronaut'
import { profile } from '../data/profile'
import { useI18n } from '../i18n'

const navItems = {
  zh: [
    { label: '关于', href: '#about' },
    { label: '项目', href: '#github-projects' },
    { label: '文章', href: '/posts' },
    { label: '记录', href: '#skills' },
    { label: '联系', href: '#contact' },
  ],
  en: [
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#github-projects' },
    { label: 'Posts', href: '/posts' },
    { label: 'Notes', href: '#skills' },
    { label: 'Contact', href: '#contact' },
  ],
} as const

function useParallax() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10])
  const floatX = useTransform(mouseX, [-0.5, 0.5], [-16, 16])
  const floatY = useTransform(mouseY, [-0.5, 0.5], [-12, 12])

  return { mouseX, mouseY, rotateX, rotateY, floatX, floatY }
}

export function Hero() {
  const { lang } = useI18n()
  const { mouseX, mouseY, rotateX, rotateY, floatX, floatY } = useParallax()

  return (
    <section className="px-4 py-4 md:px-6">
      <motion.div
        className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const x = (e.clientX - rect.left) / rect.width - 0.5
          const y = (e.clientY - rect.top) / rect.height - 0.5
          mouseX.set(x)
          mouseY.set(y)
        }}
        onMouseLeave={() => {
          mouseX.set(0)
          mouseY.set(0)
        }}
      >
        <motion.div
          drag
          dragElastic={0.08}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          whileDrag={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#101010] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8 md:min-h-[560px] md:p-10"
        >
          <motion.div
            className="absolute inset-0 noise-overlay opacity-[0.18]"
            style={{ x: floatX, y: floatY }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-transparent"
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
          />
          <motion.div
            className="absolute left-8 top-10 h-24 w-24 rounded-full border border-white/10 bg-white/[0.03]"
            style={{ x: floatX }}
          />
          <motion.div
            className="absolute right-12 top-14 h-44 w-44 rounded-full border border-white/10 bg-primary/5"
            style={{ x: floatY }}
          />
          <motion.div
            className="absolute right-20 top-24 h-3 w-3 rounded-full bg-primary/80 shadow-[0_0_35px_rgba(225,224,204,0.6)]"
            style={{ x: floatX, y: floatY }}
          />
          <motion.div
            className="absolute bottom-16 right-16 h-20 w-20 rounded-full border border-white/8 bg-white/[0.02]"
            style={{ x: floatY }}
          />
          <motion.div
            className="absolute left-10 bottom-20 h-2 w-2 rounded-full bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.55)]"
            style={{ x: floatX, y: floatY }}
          />
          <motion.div
            className="absolute left-16 top-28 h-1.5 w-1.5 rounded-full bg-white/70"
            style={{ x: floatX }}
          />
          <motion.div
            className="absolute left-24 top-40 h-1 w-1 rounded-full bg-primary/70"
            style={{ y: floatY }}
          />
          <motion.div
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 lg:block"
            style={{ x: floatX, y: floatY }}
          >
            <FloatingAstronaut size="lg" />
          </motion.div>
          <motion.div
            className="absolute right-[42%] top-[12%] hidden md:block"
            animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ x: floatY }}
          >
            <Rocket className="h-8 w-8 -rotate-45 text-primary/25" />
          </motion.div>

          <nav className="relative z-10 flex flex-wrap items-center gap-2">
            {navItems[lang].map((item) =>
              item.href.startsWith('#') ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-white/8 bg-black/25 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:text-primary sm:px-4 sm:py-2 sm:text-[10px]"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className="rounded-full border border-white/8 bg-black/25 px-3 py-1.5 text-[9px] uppercase tracking-[0.18em] text-gray-400 transition-colors hover:text-primary sm:px-4 sm:py-2 sm:text-[10px]"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="relative z-10 mt-16 max-w-3xl">
            <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40 sm:text-[10px]">
              {lang === 'zh' ? '个人博客' : 'Personal blog'}
            </p>
            <h1 className="mt-5 text-4xl font-medium leading-[0.9] text-[#E1E0CC] sm:text-5xl md:text-6xl lg:text-[5rem]">
              {profile.name}
            </h1>
            <p className="mt-5 max-w-2xl text-xs leading-relaxed text-gray-400 sm:text-sm md:text-base">
              {lang === 'zh'
                ? profile.heroTagline
                : 'A relaxed personal blog about tech, daily notes, and creative experiments.'}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#github-projects"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-black transition-all hover:gap-3 sm:px-5 sm:py-3 sm:text-sm"
              >
                {lang === 'zh' ? '看项目' : 'View projects'}
                <Rocket className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <Link
                to="/posts"
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs text-gray-300 transition-colors hover:bg-white/[0.04] sm:px-5 sm:py-3 sm:text-sm"
              >
                {lang === 'zh' ? '看文章' : 'Read posts'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs text-gray-300 transition-colors hover:border-primary/20 hover:bg-white/[0.04] sm:px-5 sm:py-3 sm:text-sm"
              >
                <Code2 className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4">
          <div className="rounded-[2rem] border border-white/5 bg-primary p-6 text-black">
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/45">
              {lang === 'zh' ? '最近更新' : 'Recent update'}
            </p>
            <p className="mt-4 text-2xl leading-tight sm:text-3xl">
              {lang === 'zh'
                ? '把个人网站改成了更像博客的样子。'
                : 'The site now feels more like a blog.'}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-black/70">
              {lang === 'zh'
                ? '这次改动的重点是布局，不是炫技。希望它更适合以后慢慢写东西。'
                : 'The focus this time was layout, not flashiness. It should be easier to write slowly over time.'}
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/5 bg-[#101010] p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40">
              {lang === 'zh' ? '本页导航' : 'On this page'}
            </p>
            <div className="mt-5 space-y-3">
              {profile.categories.map((item) => (
                <div key={item} className="flex items-center justify-between border-b border-white/5 pb-3 text-sm text-gray-400 last:border-b-0 last:pb-0">
                  <span>{lang === 'zh' ? item : translateCategory(item)}</span>
                  <span className="text-primary/60">→</span>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="rounded-[2rem] border border-white/5 bg-black/30 p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40">
              {lang === 'zh' ? '最新一句' : 'Latest note'}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              {lang === 'zh'
                ? profile.bio
                : 'A place for my study notes, creative experiments, and a few daily fragments.'}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function translateCategory(item: string) {
  const map: Record<string, string> = {
    技术笔记: 'Tech notes',
    生活日常: 'Daily life',
    读书记录: 'Reading log',
    项目更新: 'Project updates',
  }
  return map[item] ?? item
}
