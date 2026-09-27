import { AnimatePresence, motion } from 'framer-motion'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { ArrowRight, Clock3 } from 'lucide-react'
import { profile } from './data/profile'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'
import { Contact } from './components/Contact'
import { GithubProjects } from './components/GithubProjects'
import { SpaceDivider } from './components/SpaceDivider'
import { Starfield } from './components/Starfield'
import { useI18n } from './i18n'

const copy = {
  zh: {
    recent: '最近更新：把个人网站改成了博客式布局，保留暗色背景并调整为更像 mmguo.dev 的分栏卡片结构。',
    blogTitle: '写给自己的更新日志',
    blogDesc: '这里会放技术笔记、生活记录和一些碎碎念。点击每一篇，可以进入单独页面继续看。',
    articleLabel: '更新',
    detailLabel: '文章详情',
    back: '返回文章列表',
    notFound: '文章不存在',
  },
  en: {
    recent: 'Recent update: the site is now more blog-like, while keeping the dark theme and a card-based layout inspired by mmguo.dev.',
    blogTitle: 'A log for myself',
    blogDesc: 'This space will hold tech notes, life updates, and random thoughts. Click any post to open its own page.',
    articleLabel: 'Post',
    detailLabel: 'Post details',
    back: 'Back to posts',
    notFound: 'Post not found',
  },
} as const

function Shell() {
  const { lang, toggleLang } = useI18n()
  const c = copy[lang]
  return (
    <main className="relative z-10">
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-white/5 bg-black/70 px-4 py-2 backdrop-blur sm:px-6">
        <p className="text-[10px] text-primary/70 sm:text-xs">{c.recent}</p>
        <button
          onClick={toggleLang}
          className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-gray-300 transition-colors hover:bg-white/[0.06] sm:text-xs"
        >
          {lang === 'zh' ? '中 / EN' : 'EN / 中'}
        </button>
      </div>
      <Hero />
      <SpaceDivider variant="video-a" />
      <div className="mx-auto max-w-7xl space-y-4 pb-8 md:space-y-6 md:pb-12">
        <About />
        <SpaceDivider variant="stars" />
        <GithubProjects />
        <SpaceDivider variant="orbit" />
        <Projects />
        <SpaceDivider variant="video-b" />
        <Skills />
        <SpaceDivider variant="astronaut" />
        <Contact />
      </div>
    </main>
  )
}

function PostListPage() {
  const { lang } = useI18n()
  const c = copy[lang]
  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-4 md:px-6">
      <div className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40">{lang === 'zh' ? '博客文章' : 'Blog posts'}</p>
        <h1 className="mt-4 text-4xl font-medium text-[#E1E0CC] sm:text-5xl">{c.blogTitle}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
          {c.blogDesc}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {profile.latestPosts.map((post, index) => (
          <Link
            key={post.title}
            to={`/post/${index + 1}`}
            className="group rounded-[1.75rem] border border-white/5 bg-black/30 p-5 transition-colors hover:border-primary/20 hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">{c.articleLabel} {index + 1}</p>
                <h2 className="mt-3 text-xl text-primary">{post.title}</h2>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">{post.summary}</p>
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-500">
              <Clock3 className="h-3.5 w-3.5" />
              {post.date}
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}

function PostDetailPage({ id }: { id: number }) {
  const { lang } = useI18n()
  const c = copy[lang]
  const post = profile.latestPosts[id - 1]

  if (!post) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <div className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-8 text-center">
          <h1 className="text-2xl text-primary">{c.notFound}</h1>
          <Link className="mt-6 inline-block text-sm text-gray-400 underline" to="/posts">
            {c.back}
          </Link>
        </div>
      </main>
    )
  }

  const bodyMap: Record<number, string[]> = {
    1: [
      '这次改版最想做的事情，其实很简单：让首页不再像一份简历，而像一个会持续更新的地方。',
      '我保留了暗色背景和整体气质，但把布局换成了更适合阅读的卡片结构。以后这里会继续加上分类、归档和单篇文章页。',
      '如果你是偶然点进来的，希望你能在这里看到一点真实的生活痕迹，而不是只有“项目清单”。',
    ],
    2: [
      '我最近在整理学习方式，发现最有效的办法不是记很多，而是把内容写成可以回看的短文。',
      '这样做的好处是，过一段时间再看会很快知道自己当时在想什么，也更容易继续往下补。',
      '博客对我来说不是展示，而是一个慢慢长大的笔记本。',
    ],
    3: [
      '我一直很喜欢那种打开就能马上进入状态的博客，页面不复杂，但每个块都知道自己该放什么。',
      '所以这个站接下来会继续朝这个方向长：更少的“介绍感”，更多的“内容感”。',
      '我想把这里做成一个会让我愿意常回来看的地方。',
    ],
  }

  const bodyMapEn: Record<number, string[]> = {
    1: [
      'The main goal of this redesign was simple: make the home page feel like an active blog instead of a résumé.',
      'I kept the dark atmosphere, but switched to a more readable card-based layout. Next, I want to add categories, archives, and more post pages.',
      'If you just happened to land here, I hope you can find something personal, not just a project list.',
    ],
    2: [
      'Recently I have been reorganizing the way I study. The most useful method is not taking more notes, but writing things in a way that I can revisit later.',
      'That makes it much easier to remember what I was thinking at the time, and much easier to keep building on top of it.',
      'For me, this blog is less about presentation and more about becoming a notebook that grows over time.',
    ],
    3: [
      'I have always liked blogs that feel immediate when you open them. They are simple, but every section knows exactly what it should do.',
      'That is the direction I want this site to grow in: fewer “about me” vibes, and more actual content.',
      'I want this to become a place I actually look forward to coming back to.',
    ],
  }

  const body = lang === 'zh' ? bodyMap[id] : bodyMapEn[id]

  return (
    <main className="mx-auto max-w-4xl px-4 py-4 md:px-6">
      <div className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-6 sm:p-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-primary/40">{c.detailLabel}</p>
        <h1 className="mt-4 text-3xl font-medium text-[#E1E0CC] sm:text-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-gray-500">{post.date}</p>

        <div className="mt-8 space-y-5 text-sm leading-relaxed text-gray-400 sm:text-base">
          {body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <Link
          to="/posts"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-black transition-all hover:gap-3"
        >
          {c.back}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  )
}

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.985, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -18, scale: 0.99, filter: 'blur(10px)' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative will-change-transform"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_55%)] opacity-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9 }}
      />
      {children}
    </motion.div>
  )
}

function App() {
  const location = useLocation()
  const { lang } = useI18n()

  return (
    <>
      <Starfield />
      <AnimatePresence mode="wait">
      <Routes location={location} key={`${location.pathname}-${lang}`}>
        <Route path="/" element={<AnimatedPage><Shell /></AnimatedPage>} />
        <Route path="/posts" element={<AnimatedPage><PostListPage /></AnimatedPage>} />
        <Route path="/post/1" element={<AnimatedPage><PostDetailPage id={1} /></AnimatedPage>} />
        <Route path="/post/2" element={<AnimatedPage><PostDetailPage id={2} /></AnimatedPage>} />
        <Route path="/post/3" element={<AnimatedPage><PostDetailPage id={3} /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
    </>
  )
}

export default App
