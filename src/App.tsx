import { About } from './components/About'
import { Contact } from './components/Contact'
import { GithubProjects } from './components/GithubProjects'
import { Hero } from './components/Hero'
import { SiteHeader } from './components/SiteHeader'
import { Skills } from './components/Skills'
import { SpaceDivider } from './components/SpaceDivider'
import { Starfield } from './components/Starfield'
import { useI18n } from './i18n-context'

function App() {
  const { lang } = useI18n()

  return (
    <>
      <Starfield />
      <a
        href="#top"
        className="skip-link"
      >
        {lang === 'zh' ? '跳到内容' : 'Skip to content'}
      </a>
      <div className="relative z-10">
        <SiteHeader />
        <main>
          <Hero />
          <SpaceDivider variant="stars" />
          <About />
          <GithubProjects />
          <SpaceDivider variant="orbit" />
          <Skills />
          <SpaceDivider variant="astronaut" />
          <Contact />
        </main>
      </div>
    </>
  )
}

export default App
