import { About } from './components/About'
import { Contact } from './components/Contact'
import { CosmosBackdrop } from './components/CosmosBackdrop'
import { GithubProjects } from './components/GithubProjects'
import { Hero } from './components/Hero'
import { SiteHeader } from './components/SiteHeader'
import { Skills } from './components/Skills'
import { useI18n } from './i18n-context'

function App() {
  const { lang } = useI18n()

  return (
    <>
      <CosmosBackdrop />
      <a href="#top" className="skip-link">
        {lang === 'zh' ? '跳到内容' : 'Skip to content'}
      </a>
      <div className="pointer-events-none relative z-10">
        <SiteHeader />
        <main className="pointer-events-none">
          <Hero />
          <About />
          <GithubProjects />
          <Skills />
          <Contact />
        </main>
      </div>
    </>
  )
}

export default App
