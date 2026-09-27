import { motion } from 'framer-motion'

type Props = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function FloatingAstronaut({ className = '', size = 'md' }: Props) {
  const dim = size === 'sm' ? 'h-40 w-40' : size === 'lg' ? 'h-80 w-80' : 'h-56 w-56'

  return (
    <motion.div
      className={`relative ${dim} ${className}`}
      animate={{ y: [0, -14, 0], rotate: [-2, 2, -2] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="absolute inset-0 rounded-full border border-white/10 bg-black/25 backdrop-blur-[1px]">
        <div className="absolute inset-5 rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,rgba(225,224,204,0.16),transparent_40%)]" />
        <motion.div
          className="absolute left-1/2 top-[42%] h-[38%] w-[32%] -translate-x-1/2 rounded-[42%_42%_48%_48%] border border-white/15 bg-[#f2efe2]/12 shadow-[0_0_40px_rgba(225,224,204,0.12)]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="absolute left-1/2 top-[38%] h-[18%] w-[28%] -translate-x-1/2 rounded-[38%] border border-white/20 bg-black/55" />
        <div className="absolute left-1/2 top-[54%] h-[6%] w-[36%] -translate-x-1/2 rounded-full border border-white/10 bg-white/5" />
        <motion.div
          className="absolute -right-1 top-[28%] h-[22%] w-[22%] rounded-full border border-white/10 bg-white/[0.04]"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -left-2 top-[32%] h-[18%] w-[18%] rounded-full border border-white/10 bg-white/[0.03]"
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />
        <motion.span
          className="absolute left-[18%] top-[22%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        <motion.span
          className="absolute right-[20%] bottom-[28%] h-2 w-2 rounded-full bg-primary/80 shadow-[0_0_14px_rgba(225,224,204,0.55)]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 0.5 }}
        />
      </div>
      <motion.div
        className="absolute -bottom-2 left-1/2 h-8 w-32 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(225,224,204,0.15),transparent_70%)] blur-md"
        animate={{ scaleX: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
    </motion.div>
  )
}