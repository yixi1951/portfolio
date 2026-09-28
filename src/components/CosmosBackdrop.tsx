import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n-context'

type Api = { destroy: () => void; setLang: (lang: 'zh' | 'en') => void }

export function CosmosBackdrop() {
  const hostRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<Api | null>(null)
  const { lang } = useI18n()
  const [caption, setCaption] = useState<string | null>(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let dead = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mobile = window.matchMedia('(max-width: 768px)').matches
    setNarrow(mobile)
    import('../space/cosmos').then(({ mountCosmos }) => {
      if (dead) return
      apiRef.current = mountCosmos(host, {
        mobile,
        reduced,
        lang,
        onLabel: setCaption,
      })
    })
    return () => {
      dead = true
      apiRef.current?.destroy()
      apiRef.current = null
    }
    // Language updates go through setLang so the WebGL scene is not rebuilt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    apiRef.current?.setLang(lang)
  }, [lang])

  const hint = narrow
    ? lang === 'zh'
      ? '滚动飞行 · 轻点行星'
      : 'Scroll to fly · tap a planet'
    : lang === 'zh'
      ? '滚动飞行 · 拖动环绕 · 点击行星'
      : 'Scroll to fly · drag to orbit · click a planet'

  return (
    <div ref={hostRef} className="cosmos-host fixed inset-0 z-0">
      <p className="pointer-events-none absolute bottom-4 left-1/2 z-[2] -translate-x-1/2 text-[11px] tracking-[0.16em] text-zinc-400">
        {caption ?? hint}
      </p>
    </div>
  )
}
