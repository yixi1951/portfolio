import { motion, useMotionValue, useTransform } from 'framer-motion'

const PRIMARY_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4'
const SECONDARY_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260429_114316_1c7889ad-2885-410e-b493-98119fee0ddb.mp4'

export function SpaceDivider({ variant = 'orbit' }: { variant?: 'orbit' | 'astronaut' | 'stars' | 'video-a' | 'video-b' }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const fx = useTransform(x, [-0.5, 0.5], [-22, 22])
  const fy = useTransform(y, [-0.5, 0.5], [-14, 14])

  return (
    <motion.section
      className="px-4 py-4 md:px-6"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const nx = (e.clientX - rect.left) / rect.width - 0.5
        const ny = (e.clientY - rect.top) / rect.height - 0.5
        x.set(nx)
        y.set(ny)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] border border-white/5 bg-[#101010] sm:min-h-[340px]">
        <motion.div className="absolute inset-0 noise-overlay opacity-[0.16]" style={{ x: fx, y: fy }} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent" />
        <div className="absolute left-8 top-8 text-[9px] uppercase tracking-[0.32em] text-primary/35">Space break</div>

        {variant === 'video-a' && (
          <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
              <source src={PRIMARY_VIDEO} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.15)_75%)]" />
            <motion.div className="absolute left-6 top-6 h-20 w-20 rounded-full border border-white/10 bg-white/[0.03]" style={{ x: fx, y: fy }} />
            <motion.div className="absolute right-10 top-10 h-40 w-40 rounded-full border border-white/10 bg-primary/5" style={{ x: fy, y: fx }} />
          </div>
        )}

        {variant === 'video-b' && (
          <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
              <source src={SECONDARY_VIDEO} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/55" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,transparent_10%,rgba(0,0,0,0.22)_78%)]" />
            <motion.div className="absolute left-8 bottom-8 text-[9px] uppercase tracking-[0.3em] text-white/60" style={{ x: fx, y: fy }}>
              Astronaut loop
            </motion.div>
          </div>
        )}

        {variant === 'orbit' && (
          <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
              <source src={PRIMARY_VIDEO} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/55" />
            <motion.div className="absolute left-[10%] top-[18%] h-40 w-40 rounded-full border border-white/10 bg-white/[0.03] sm:h-52 sm:w-52" style={{ x: fx, y: fy }} />
            <motion.div className="absolute right-[14%] top-[16%] h-52 w-52 rounded-full border border-white/10 bg-black/20 sm:h-72 sm:w-72" style={{ x: fy, y: fx }} />
            <motion.div
              className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-36 sm:w-36"
              style={{ x: fx, y: fy }}
            >
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(225,224,204,0.14),transparent_55%)]" />
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_30px_rgba(225,224,204,0.6)]" />
            </motion.div>
          </div>
        )}

        {variant === 'stars' && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(225,224,204,0.08),transparent_55%)]">
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(to_top,rgba(0,0,0,0.65),transparent)]" />
            {[...Array(12)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${8 + (i * 7.3) % 84}%`,
                  top: `${12 + (i * 11.7) % 72}%`,
                  width: i % 3 === 0 ? 2 : 1,
                  height: i % 3 === 0 ? 2 : 1,
                }}
                animate={{ opacity: [0.2, 1, 0.25] }}
                transition={{ duration: 2 + (i % 4), delay: i * 0.15, repeat: Infinity }}
              />
            ))}
            <motion.span className="absolute left-[18%] top-[24%] h-1.5 w-1.5 rounded-full bg-white/70" style={{ x: fx, y: fy }} />
            <motion.span className="absolute left-[32%] top-[58%] h-2 w-2 rounded-full bg-primary/70" style={{ x: fy, y: fx }} />
            <motion.span className="absolute right-[24%] top-[22%] h-1 w-1 rounded-full bg-white/60" style={{ x: fy, y: fx }} />
            <motion.span className="absolute right-[40%] top-[48%] h-2.5 w-2.5 rounded-full border border-white/15 bg-white/5" style={{ x: fx, y: fy }} />
            <motion.div
              className="absolute left-[8%] top-1/2 hidden -translate-y-1/2 sm:block"
              style={{ x: fx, y: fy }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
            >
              <div className="relative h-28 w-28 rounded-full border border-white/10 bg-black/30">
                <div className="absolute inset-3 rounded-full border border-dashed border-white/15" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                >
                  <span className="absolute left-1/2 top-1 h-2 w-2 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_rgba(225,224,204,0.6)]" />
                </motion.div>
              </div>
            </motion.div>
            <motion.div className="absolute left-[42%] bottom-[28%] h-32 w-56 rounded-full bg-[radial-gradient(circle,rgba(225,224,204,0.10),transparent_70%)] blur-2xl" style={{ x: fx, y: fy }} />
          </div>
        )}

        {variant === 'astronaut' && (
          <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
              <source src={SECONDARY_VIDEO} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-black/10 to-black/45" />
            <motion.div className="absolute left-[8%] top-[18%] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(225,224,204,0.12),transparent_60%)] blur-2xl" style={{ x: fy, y: fx }} />
            <motion.div className="absolute left-[8%] bottom-[18%] h-24 w-80 rounded-full bg-[radial-gradient(circle,rgba(225,224,204,0.09),transparent_70%)] blur-2xl" style={{ x: fx, y: fy }} />
            <motion.div className="absolute right-[10%] bottom-[10%] hidden lg:block" style={{ x: fx, y: fy }}>
              <div className="relative h-64 w-64 rounded-[2rem] border border-white/10 bg-black/20 p-5 backdrop-blur-[1px]">
                <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
                <div className="absolute left-5 top-5 text-[9px] uppercase tracking-[0.3em] text-primary/30">Astronaut</div>
                <div className="absolute bottom-4 left-4 right-4 h-24 rounded-[999px] bg-[radial-gradient(circle_at_50%_45%,rgba(225,224,204,0.12),rgba(225,224,204,0.04)_55%,transparent_72%)]" />
                <div className="absolute left-1/2 top-1/2 h-28 w-22 -translate-x-1/2 -translate-y-1/2 rounded-[44%_44%_48%_48%] border border-white/15 bg-[#f2efe2]/12 shadow-[0_0_40px_rgba(225,224,204,0.10)]" />
                <div className="absolute left-1/2 top-[42%] h-11 w-14 -translate-x-1/2 rounded-[36%] border border-white/15 bg-black/60" />
                <div className="absolute left-1/2 top-[56%] h-4 w-16 -translate-x-1/2 rounded-full border border-white/10 bg-white/5" />
                <div className="absolute -left-2 top-10 h-16 w-16 rounded-full border border-white/10 bg-white/[0.03]" />
                <div className="absolute -right-2 top-16 h-14 w-14 rounded-full border border-white/10 bg-white/[0.02]" />
                <div className="absolute left-8 bottom-10 h-2 w-2 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.65)]" />
                <div className="absolute right-8 bottom-12 h-2.5 w-2.5 rounded-full bg-primary/80 shadow-[0_0_18px_rgba(225,224,204,0.5)]" />
              </div>
            </motion.div>
            <motion.div className="absolute left-[12%] top-[32%] h-2 w-2 rounded-full bg-white/70" style={{ x: fx, y: fy }} />
            <motion.div className="absolute left-[28%] top-[44%] h-1.5 w-1.5 rounded-full bg-primary/80" style={{ x: fy, y: fx }} />
          </div>
        )}
      </div>
    </motion.section>
  )
}
