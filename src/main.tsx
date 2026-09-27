import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { I18nProvider, type Lang } from './i18n'

function Root() {
  const [lang, setLang] = useState<Lang>('zh')
  return (
    <I18nProvider lang={lang} toggleLang={() => setLang((v) => (v === 'zh' ? 'en' : 'zh'))}>
      <App />
    </I18nProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  </StrictMode>,
)
