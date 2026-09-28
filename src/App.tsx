import { About } from './components/About'
import { Contact } from './components/Contact'
import { GithubProjects } from './components/GithubProjects'
import { Hero } from './components/Hero'
import { SiteHeader } from './components/SiteHeader'
import { Skills } from './components/Skills'
import { SpaceDivider } from './components/SpaceDivider'
import { Flyby } from './components/Flyby'
import { StarCursor } from './components/StarCursor'
import { Starfield } from './components/Starfield'
import { SectionPass } from './components/SectionPass'
import { useI18n } from './i18n-context'

function App() {
  const { lang } = useI18n()

  return (
    <>
      <Starfield />
      <StarCursor />
      <Flyby />
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
          <SectionPass kind="ship">
            <About />
          </SectionPass>
          <SectionPass kind="streaks">
            <GithubProjects />
          </SectionPass>
          <SpaceDivider variant="orbit" />
          <SectionPass kind="warp">
            <Skills />
          </SectionPass>
          <SpaceDivider variant="astronaut" />
          <SectionPass kind="ship">
            <Contact />
          </SectionPass>
        </main>
      </div>
    </>
  )
}

export default App
