import { motion, useReducedMotion } from 'framer-motion'

type Props = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FloatingAstronaut({ className = '', size = 'md' }: Props) {
  const reduce = useReducedMotion()
  const dim = size === 'sm' ? 'h-40 w-40' : size === 'lg' ? 'h-80 w-80' : 'h-56 w-56'
  const loop = reduce ? undefined : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' as const }

  return (
    <motion.div
      className={`relative ${dim} ${className}`}
      animate={reduce ? undefined : { y: [0, -36, 0], rotate: [-14, 12, -14] }}
      transition={loop}
    >
      <div className="absolute inset-0 rounded-full border border-white/15 bg-black/25 backdrop-blur-[1px]">
        <div className="absolute inset-5 rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,rgba(225,224,204,0.22),transparent_42%)]" />
        <motion.div
          className="absolute left-1/2 top-[42%] h-[38%] w-[32%] -translate-x-1/2 rounded-[42%_42%_48%_48%] border border-white/20 bg-[#f2efe2]/15 shadow-[0_0_40px_rgba(225,224,204,0.28)]"
          animate={reduce ? undefined : { scale: [1, 1.06, 1], rotate: [-4, 4, -4] }}
          transition={reduce ? undefined : { duration: 2.8, repeat: Infinity }}
        />
        <div className="absolute left-1/2 top-[38%] h-[18%] w-[28%] -translate-x-1/2 rounded-[38%] border border-white/25 bg-black/55" />
        <div className="absolute left-1/2 top-[54%] h-[6%] w-[36%] -translate-x-1/2 rounded-full border border-white/10 bg-white/5" />
        <motion.div
          className="absolute -right-1 top-[28%] h-[22%] w-[22%] rounded-full border border-white/15 bg-white/[0.06]"
          animate={reduce ? undefined : { rotate: 360 }}
          transition={reduce ? undefined : { duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -left-2 top-[32%] h-[18%] w-[18%] rounded-full border border-white/15 bg-white/[0.05]"
          animate={reduce ? undefined : { rotate: -360 }}
          transition={reduce ? undefined : { duration: 11, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute left-[18%] top-[22%] h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.95)]"
          animate={reduce ? undefined : { opacity: [0.2, 1, 0.2], scale: [0.7, 1.4, 0.7] }}
          transition={reduce ? undefined : { duration: 1.1, repeat: Infinity }}
        />
        <motion.span
          className="absolute right-[20%] bottom-[28%] h-2.5 w-2.5 rounded-full bg-primary/80 shadow-[0_0_18px_rgba(225,224,204,0.85)]"
          animate={reduce ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.8, 1.35, 0.8] }}
          transition={reduce ? undefined : { duration: 1.4, repeat: Infinity, delay: 0.35 }}
        />
      </div>
      <motion.div
        className="absolute -bottom-2 left-1/2 h-8 w-32 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(225,224,204,0.28),transparent_70%)] blur-md"
        animate={reduce ? undefined : { scaleX: [0.75, 1.25, 0.75], opacity: [0.35, 0.85, 0.35] }}
        transition={loop}
      />
    </motion.div>
  )
}
