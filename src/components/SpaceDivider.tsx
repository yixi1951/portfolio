import { useI18n } from '../i18n-context'
import { BlackHoleView } from './BlackHoleView'
import { SpacewalkView } from './SpacewalkView'

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
    <div className="px-4 py-3 md:px-6">
      <div
        className={`relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#07080d] ${
          variant === 'astronaut' ? 'h-80 sm:h-[28rem]' : variant === 'orbit' ? 'h-72 sm:h-96' : 'h-44 sm:h-52'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(228,224,204,0.12),transparent_55%)]" />
        <p className="absolute left-5 top-4 z-10 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </p>

        {variant === 'stars' && (
          <svg viewBox="0 0 420 180" className="absolute inset-0 h-full w-full" aria-hidden>
            <path d={galaxyPath} className="galaxy-arm" />
            <circle cx="210" cy="90" r="3" fill="#f4f1e4" />
            {[40, 90, 150, 280, 330, 370].map((x, index) => (
              <circle key={x} cx={x} cy={30 + ((index * 37) % 120)} r={index % 2 ? 1.2 : 1.8} fill="#f7f4ea" className="twinkle" />
            ))}
          </svg>
        )}

        {variant === 'orbit' && <BlackHoleView />}

        {variant === 'astronaut' && <SpacewalkView />}

        {(variant === 'orbit' || variant === 'astronaut') && (
          <p className="pointer-events-none absolute bottom-3 right-4 z-10 text-[11px] tracking-wide text-zinc-500">
            {variant === 'orbit'
              ? lang === 'zh'
                ? '拖动环绕 · 滚动拉近'
                : 'Drag to orbit · scroll to zoom'
              : lang === 'zh'
                ? '拖动旋转 · 悬停反光'
                : 'Drag to rotate · hover for gleam'}
          </p>
        )}
      </div>
    </div>
  )
}
