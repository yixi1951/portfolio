import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Award, Check, Users } from 'lucide-react'
import { WordsPullUpMultiStyle } from './WordsPullUpMultiStyle'
import { profile } from '../data/profile'

const FEATURE_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4'

interface SkillCardProps {
  index: number
  children: React.ReactNode
  className?: string
}

function SkillCard({ index, children, className = '' }: SkillCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  )
}

interface InfoCardProps {
  index: number
  number: string
  title: string
  icon: React.ReactNode
  items: string[]
}

function InfoCard({ index, number, title, icon, items }: InfoCardProps) {
  return (
    <SkillCard
      index={index}
      className="flex h-full min-h-[320px] flex-col bg-[#212121] p-5 sm:min-h-[360px] sm:p-6"
    >
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2a2a2a] sm:h-12 sm:w-12">
        {icon}
      </div>

      <div className="mb-6">
        <span className="text-xs text-gray-500">{number}</span>
        <h3 className="mt-1 text-lg text-primary sm:text-xl">{title}</h3>
      </div>

      <ul className="mb-auto space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-gray-400">{item}</span>
          </li>
        ))}
      </ul>
    </SkillCard>
  )
}

export function Skills() {
  return (
    <section id="skills" className="relative min-h-screen bg-black px-4 py-20 sm:px-6 md:py-28">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-12 text-center md:mb-16">
          <WordsPullUpMultiStyle
            className="mb-3 text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
            segments={[{ text: '技能、荣誉与学生工作。', className: 'text-primary' }]}
          />
          <WordsPullUpMultiStyle
            className="text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
            segments={[{ text: '数学基础 + 工程落地能力。', className: 'text-gray-500' }]}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:grid-cols-4 lg:h-[480px]">
          <SkillCard index={0} className="min-h-[320px] lg:min-h-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={FEATURE_VIDEO} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 sm:bottom-6 sm:left-6">
              <p className="text-lg font-medium sm:text-xl" style={{ color: '#E1E0CC' }}>
                AI · 数据 · 视觉
              </p>
              <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                {profile.languages.map((l) => `${l.name} ${l.level}`).join(' · ')}
              </p>
            </div>
          </SkillCard>

          <InfoCard
            index={1}
            number="01"
            title="技术技能"
            icon={<Check className="h-5 w-5 text-primary" />}
            items={profile.skills.map((s) => `${s.name} — ${s.level}`)}
          />

          <InfoCard
            index={2}
            number="02"
            title="荣誉奖项"
            icon={<Award className="h-5 w-5 text-primary" />}
            items={profile.honors}
          />

          <InfoCard
            index={3}
            number="03"
            title={profile.leadership.role}
            icon={<Users className="h-5 w-5 text-primary" />}
            items={[
              ...profile.leadership.highlights,
              `任期 ${profile.leadership.period}`,
              `爱好：${profile.hobbies[0]}`,
            ]}
          />
        </div>
      </div>
    </section>
  )
}
