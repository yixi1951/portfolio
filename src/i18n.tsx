import { createContext, useContext } from 'react'

type Lang = 'zh' | 'en'

const I18nContext = createContext<{ lang: Lang; toggleLang: () => void } | null>(null)

export function I18nProvider({
  lang,
  toggleLang,
  children,
}: {
  lang: Lang
  toggleLang: () => void
  children: React.ReactNode
}) {
  return <I18nContext.Provider value={{ lang, toggleLang }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export type { Lang }
