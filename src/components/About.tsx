import { motion } from 'framer-motion'
import { profile } from '../data/profile'
import { useI18n } from '../i18n'

export function About() {
  const { lang } = useI18n()
  return (
    <section id="about" className="px-4 py-4 md:px-6">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          drag
          dragElastic={0.08}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          whileDrag={{ scale: 1.01 }}
          className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-5 sm:p-7"
        >
          <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40 sm:text-[10px]">
            {lang === 'zh' ? '关于' : 'About'}
          </p>
          <h2 className="mt-4 text-2xl font-medium leading-tight text-[#E1E0CC] sm:text-3xl">
            {lang === 'zh'
              ? '一个不太正式、但会认真更新的个人博客。'
              : 'A personal blog that is informal, but updated with care.'}
          </h2>
          <p className="mt-4 text-xs leading-relaxed text-gray-400 sm:text-sm">
            {lang === 'zh'
              ? profile.bio
              : 'I like breaking down complex things and writing down what I learn along the way.'}
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            drag
            dragElastic={0.08}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            whileDrag={{ scale: 1.01 }}
            className="rounded-[1.75rem] border border-white/5 bg-black/30 p-6"
          >
            <p className="text-[10px] uppercase tracking-[0.28em] text-primary/40">
              {lang === 'zh' ? '写点什么' : 'What I write'}
            </p>
            <div className="mt-4 space-y-4">
              {profile.aboutBlocks.map((item) => (
                <p key={item} className="text-sm leading-relaxed text-gray-400 sm:text-base">
                  {item}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            drag
            dragElastic={0.08}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            whileDrag={{ scale: 1.01 }}
            className="rounded-[1.75rem] border border-white/5 bg-primary p-6 text-black"
          >
            <p className="text-[10px] uppercase tracking-[0.28em] text-black/50">
              {lang === 'zh' ? '我在记录' : 'I keep notes on'}
            </p>
            <ul className="mt-4 space-y-3">
              {profile.notes.map((note) => (
                <li key={note} className="text-sm leading-relaxed sm:text-base">
                  {note}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
