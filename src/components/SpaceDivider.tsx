import { SolarSystem } from './SolarSystem'
import { FloatingAstronaut } from './FloatingAstronaut'
import { useI18n } from '../i18n-context'

const galaxyPath = (() => {
  const commands: string[] = []
  for (let index = 0; index < 90; index += 1) {
    const progress = index / 90
    const angle = progress * Math.PI * 5.2
    const radius = 6 + progress * 78
    const x = 210 + Math.cos(angle) * radius
    const y = 90 + Math.sin(angle) * radius * 0.42
    commands.push(`${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return commands.join(' ')
})()

export function SpaceDivider({ variant = 'orbit' }: { variant?: 'orbit' | 'astronaut' | 'stars' }) {
  const { lang } = useI18n()
  const label =
    variant === 'astronaut'
      ? lang === 'zh'
        ? '舱外'
        : 'Outside'
      : variant === 'stars'
        ? lang === 'zh'
          ? '星系'
          : 'Galaxy'
        : lang === 'zh'
          ? '黑洞'
          : 'Black hole'

  return (
    <div className="px-4 py-3 md:px-6" aria-hidden>
      <div
        className={`relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#10131a] ${
          variant === 'astronaut' ? 'h-56 sm:h-64' : 'h-40 sm:h-48'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(228,224,204,0.12),transparent_55%)]" />
        <p className="absolute left-5 top-4 z-10 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </p>

        {variant === 'stars' && (
          <svg viewBox="0 0 420 180" className="absolute inset-0 h-full w-full">
            <path d={galaxyPath} className="galaxy-arm" />
            <circle cx="210" cy="90" r="3" fill="#f4f1e4" />
            {[40, 90, 150, 280, 330, 370].map((x, index) => (
              <circle key={x} cx={x} cy={30 + ((index * 37) % 120)} r={index % 2 ? 1.2 : 1.8} fill="#f7f4ea" className="twinkle" />
            ))}
          </svg>
        )}

        {variant === 'orbit' && (
          <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 sm:h-40 sm:w-40">
            <div className="bh-ring" />
            <div className="bh-core" />
          </div>
        )}

        {variant === 'astronaut' && (
          <div className="absolute inset-0 flex items-center justify-end pr-2 sm:pr-16">
            <SolarSystem>
              <FloatingAstronaut size="sm" className="scale-[0.78]" />
            </SolarSystem>
          </div>
        )}
      </div>
    </div>
  )
}
