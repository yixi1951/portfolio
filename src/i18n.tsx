import type { ReactNode } from 'react'
import { I18nContext, type Lang } from './i18n-context'

export function I18nProvider({
  lang,
  toggleLang,
  children,
}: {
  lang: Lang
  toggleLang: () => void
  children: ReactNode
}) {
  return <I18nContext.Provider value={{ lang, toggleLang }}>{children}</I18nContext.Provider>
}
