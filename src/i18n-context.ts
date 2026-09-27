import { createContext, useContext } from 'react'

export type Lang = 'zh' | 'en'

export const I18nContext = createContext<{ lang: Lang; toggleLang: () => void } | null>(null)

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
