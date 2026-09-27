import { useEffect, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import App from './App'
import { I18nProvider } from './i18n'
import { type Lang } from './i18n-context'

export function Root() {
  const [lang, setLang] = useState<Lang>('zh')

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.title = lang === 'zh' ? '杨子烽 — 软件与 AI' : 'Yang Zifeng — Software & AI'
  }, [lang])

  return (
    <I18nProvider lang={lang} toggleLang={() => setLang((value) => (value === 'zh' ? 'en' : 'zh'))}>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </I18nProvider>
  )
}
