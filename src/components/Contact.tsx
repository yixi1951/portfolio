import { motion } from 'framer-motion'
import { ArrowRight, Code2, Mail, MessageSquareText, Globe } from 'lucide-react'
import { profile } from '../data/profile'
import { useI18n } from '../i18n'

const contactItems = [
  {
    icon: Mail,
    label: { zh: '邮箱', en: 'Email' },
    value: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    icon: MessageSquareText,
    label: { zh: '留言', en: 'Message' },
    value: { zh: '欢迎发邮件聊聊天', en: 'Feel free to email me anytime' },
    href: `mailto:${profile.email}?subject=来自博客的留言`,
  },
  {
    icon: Globe,
    label: { zh: '主页', en: 'Website' },
    value: profile.website.replace('https://', ''),
    href: profile.website,
  },
  {
    icon: Code2,
    label: { zh: 'GitHub', en: 'GitHub' },
    value: profile.githubUsername,
    href: profile.githubUrl,
  },
]

export function Contact() {
  const { lang } = useI18n()
  return (
    <section id="contact" className="px-4 py-4 md:px-6 pb-8 md:pb-12">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-white/5 bg-[#101010] p-5 sm:p-7">
          <p className="text-[9px] uppercase tracking-[0.3em] text-primary/40 sm:text-[10px]">
            {lang === 'zh' ? '联系' : 'Contact'}
          </p>
          <h2 className="mt-4 text-2xl font-medium leading-tight text-[#E1E0CC] sm:text-3xl">
            {lang === 'zh'
              ? '如果你也喜欢这种慢慢写、慢慢更新的感觉，欢迎来找我。'
              : 'If you like the slow-and-steady way of writing and updating, feel free to reach out.'}
          </h2>
          <motion.a
            href={`mailto:${profile.email}?subject=来自博客的留言`}
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-black transition-all hover:gap-3 sm:px-5 sm:py-3 sm:text-sm"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {lang === 'zh' ? '发封邮件' : 'Send email'}
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {contactItems.map((item, index) => {
            const Icon = item.icon
            const box = (
              <motion.div
                drag
                dragElastic={0.08}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                whileDrag={{ scale: 1.01 }}
                className="rounded-[1.75rem] border border-white/5 bg-black/30 p-5 transition-colors hover:bg-white/[0.04]"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Icon className="h-5 w-5 text-primary/80" />
                <p className="mt-6 text-[10px] uppercase tracking-[0.24em] text-gray-500">{item.label[lang]}</p>
                <p className="mt-2 text-sm text-primary">{typeof item.value === 'string' ? item.value : item.value[lang]}</p>
              </motion.div>
            )

            return item.href ? (
              <a key={item.label.zh} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                {box}
              </a>
            ) : (
              <div key={item.label.zh}>{box}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
