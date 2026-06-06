import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { WordsPullUp } from './WordsPullUp'
import { profile } from '../data/profile'

const navItems = [
  { label: '关于', href: '#about' },
  { label: '项目', href: '#projects' },
  { label: '技能', href: '#skills' },
  { label: '联系', href: '#contact' },
]

const HERO_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4'

export function Hero() {
  return (
    <section className="h-screen p-4 md:p-6">
      <div className="relative h-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[10px] transition-colors sm:text-xs md:text-sm"
                style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#E1E0CC'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)'
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-10 lg:p-12">
          <div className="grid grid-cols-12 items-end gap-6">
            <div className="col-span-12 lg:col-span-8">
              <WordsPullUp
                text={profile.name}
                className="text-5xl font-medium leading-[0.9] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl"
                style={{ color: '#E1E0CC' }}
              />
              <motion.p
                className="mt-3 text-xs text-primary/60 sm:text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {profile.education.school} · {profile.jobIntent}
              </motion.p>
            </div>

            <div className="col-span-12 flex flex-col gap-5 lg:col-span-4">
              <motion.p
                className="text-xs text-primary/70 sm:text-sm md:text-base"
                style={{ lineHeight: 1.2 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {profile.heroTagline}
              </motion.p>

              <motion.a
                href="#contact"
                className="group flex w-fit items-center gap-2 rounded-full bg-primary px-2 py-2 pl-5 pr-2 font-medium text-black transition-all hover:gap-3 sm:gap-2 sm:pl-6 sm:pr-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-sm sm:text-base">联系我</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
