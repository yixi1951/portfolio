import { motion, useReducedMotion } from 'framer-motion'
import { FloatingAstronaut } from './FloatingAstronaut'
import { useI18n } from '../i18n-context'

export function SpaceDivider({ variant = 'orbit' }: { variant?: 'orbit' | 'astronaut' | 'stars' }) {
  const reduce = useReducedMotion()
  const { lang } = useI18n()
  const label =
    variant === 'astronaut'
      ? lang === 'zh'
        ? '舱外'
        : 'Outside'
      : variant === 'stars'
        ? lang === 'zh'
          ? '星野'
          : 'Starfield'
        : lang === 'zh'
          ? '轨道'
          : 'Orbit'

  return (
    <div className="px-4 py-3 md:px-6" aria-hidden>
      <div
        className={`relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#10131a] ${
          variant === 'astronaut' ? 'h-48 sm:h-56' : 'h-36 sm:h-44'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(228,224,204,0.12),transparent_55%)]" />
        <p className="absolute left-5 top-4 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">{label}</p>

        {variant === 'stars' &&
          [18, 32, 47, 61, 74, 28, 55, 82].map((left, index) => (
            <motion.span
              key={left}
              className="absolute rounded-full bg-white"
              style={{
                left: `${left}%`,
                top: `${22 + ((index * 13) % 55)}%`,
                width: index % 3 === 0 ? 3 : 2,
                height: index % 3 === 0 ? 3 : 2,
              }}
              initial={{ opacity: 0.45 }}
              animate={reduce ? undefined : { opacity: [0.25, 0.95, 0.35] }}
              transition={{ duration: 2.4 + index * 0.25, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

        {variant === 'orbit' && (
          <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 sm:h-32 sm:w-32">
            <div className="absolute inset-0 rounded-full border border-white/15" />
            <div className="absolute inset-3 rounded-full border border-dashed border-white/15" />
            <motion.div
              className="absolute inset-0"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            >
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#e4e0cc] shadow-[0_0_16px_rgba(228,224,204,0.8)]" />
            </motion.div>
            <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
        )}

        {variant === 'astronaut' && (
          <div className="absolute inset-y-0 right-6 flex items-center sm:right-16">
            <FloatingAstronaut size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}
