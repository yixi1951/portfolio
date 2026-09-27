import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { profile } from '../data/profile'
import { useI18n } from '../i18n'

const articles = [
  {
    title: { zh: '把个人网站改成博客了', en: 'Turning my personal site into a blog' },
    category: { zh: '网站更新', en: 'Site update' },
    date: '2026-06-08',
    summary: {
      zh: '保留暗色背景，但改成更像个人博客的分栏布局，方便以后继续加文章页。',
      en: 'Kept the dark atmosphere, but switched to a more blog-like split layout that is easier to extend.',
    },
  },
  {
    title: { zh: '最近在折腾我的学习记录方式', en: 'Reworking how I take study notes' },
    category: { zh: '方法记录', en: 'Notes' },
    date: '2026-06-05',
    summary: {
      zh: '我开始把笔记从零散文档整理成更容易检索的文章形式。',
      en: 'I started turning scattered notes into articles that are easier to revisit.',
    },
  },
  {
    title: { zh: '我喜欢的博客长什么样', en: 'What kind of blogs I like' },
    category: { zh: '设计想法', en: 'Design idea' },
    date: '2026-06-01',
    summary: {
      zh: '干净、留白多、可点进去继续看内容，这是我很想做的方向。',
      en: 'Clean layouts, generous whitespace, and pages you can keep opening — that is the direction I want.',
    },
  },
]

export function Projects() {
  const { lang } = useI18n()
  return (
    <section id="projects" className="px-4 py-4 md:px-6">
      <div className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-5 sm:p-7 md:p-9">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40 sm:text-[10px]">
              {lang === 'zh' ? '文章' : 'Posts'}
            </p>
            <h2 className="mt-3 text-2xl font-medium text-[#E1E0CC] sm:text-3xl">
              {lang === 'zh' ? '最近写了什么' : 'What I have been writing'}
            </h2>
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-gray-400 sm:text-sm">
            {lang === 'zh'
              ? profile.heroTagline
              : 'A calm little space for tech notes, life snippets, and design thoughts.'}
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {articles.map((article, index) => (
            <motion.div
              key={lang === 'zh' ? article.title.zh : article.title.en}
              drag
              dragElastic={0.08}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              whileDrag={{ scale: 1.01 }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
            <Link
              to="/posts"
              className="group block rounded-[1.5rem] border border-white/5 bg-black/30 p-5 transition-colors hover:border-primary/20 hover:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">{lang === 'zh' ? article.category.zh : article.category.en}</p>
                  <h3 className="mt-3 text-xl text-primary">{lang === 'zh' ? article.title.zh : article.title.en}</h3>
                </div>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">{lang === 'zh' ? article.summary.zh : article.summary.en}</p>
              <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
                <span>{article.date}</span>
                <span className="inline-flex items-center gap-1 text-primary/70">
                  {lang === 'zh' ? '查看详情' : 'Read more'} <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
