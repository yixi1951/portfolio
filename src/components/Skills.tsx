import { motion } from 'framer-motion'
import { BookOpen, PenLine, Star } from 'lucide-react'
import { profile } from '../data/profile'
import { useI18n } from '../i18n'

const stats = [
  { label: { zh: '文章分类', en: 'Categories' }, value: profile.categories.length, icon: BookOpen },
  { label: { zh: '已更新文章', en: 'Published posts' }, value: profile.latestPosts.length, icon: PenLine },
  { label: { zh: '博客风格', en: 'Tone' }, value: { zh: '轻松', en: 'Relaxed' }, icon: Star },
]

export function Skills() {
  const { lang } = useI18n()
  return (
    <section id="skills" className="px-4 py-4 md:px-6">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={lang === 'zh' ? item.label.zh : item.label.en}
                drag
                dragElastic={0.08}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                whileDrag={{ scale: 1.01 }}
                className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-5 sm:p-6"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Icon className="h-4 w-4 text-primary/80 sm:h-5 sm:w-5" />
                <p className="mt-6 text-2xl text-[#E1E0CC] sm:text-3xl">
                  {typeof item.value === 'number'
                    ? item.value
                    : typeof item.value === 'string'
                      ? item.value
                      : item.value[lang]}
                </p>
                <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                  {item.label[lang]}
                </p>
              </motion.div>
            )
          })}
        </div>

        <div className="rounded-[1.75rem] border border-white/5 bg-primary p-5 text-black sm:p-7">
          <p className="text-[9px] uppercase tracking-[0.3em] text-black/45 sm:text-[10px]">
            {lang === 'zh' ? '本周在想' : 'This week'}
          </p>
          <h3 className="mt-4 text-xl font-medium leading-tight sm:text-2xl">
            {lang === 'zh'
              ? '以后这里会放更多长文、短记和一些不太严肃但很真实的想法。'
              : 'This space will keep getting more long-form posts, short notes, and honest thoughts.'}
          </h3>
          <ul className="mt-6 space-y-3 text-xs sm:text-sm">
            {profile.notes.map((note) => (
              <li key={note} className="leading-relaxed">
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
