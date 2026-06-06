import { motion } from 'framer-motion'
import { ArrowRight, Code2, Mail, MapPin, Phone } from 'lucide-react'
import { WordsPullUpMultiStyle } from './WordsPullUpMultiStyle'
import { profile } from '../data/profile'

const contactItems = [
  {
    icon: Mail,
    label: '邮箱',
    value: profile.email,
    href: `mailto:${profile.email}`,
  },
  {
    icon: Phone,
    label: '电话',
    value: profile.phone,
    href: `tel:${profile.phone.replace(/\s/g, '')}`,
  },
  {
    icon: MapPin,
    label: '所在地',
    value: profile.location,
    href: undefined,
  },
  {
    icon: Code2,
    label: 'GitHub',
    value: `@${profile.github}`,
    href: `https://github.com/${profile.github}`,
  },
]

export function Contact() {
  return (
    <section id="contact" className="bg-black px-4 py-20 sm:px-6 md:py-28 lg:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-[10px] text-primary sm:text-xs">Contact</p>
        <WordsPullUpMultiStyle
          className="mb-3 text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
          segments={[{ text: '期待与你合作。', className: 'text-primary' }]}
        />
        <WordsPullUpMultiStyle
          className="mb-12 text-xl font-normal sm:mb-16 sm:text-2xl md:text-3xl lg:text-4xl"
          segments={[
            {
              text: `${profile.jobIntent} · 实习 ${profile.internship.daysPerWeek} 天/周 · ${profile.internship.availableFrom} 起`,
              className: 'text-gray-500',
            },
          ]}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {contactItems.map((item, index) => {
            const Icon = item.icon
            const content = (
              <motion.div
                className="flex items-center gap-4 rounded-2xl bg-[#101010] p-5 text-left transition-colors hover:bg-[#161616] sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#212121]">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <div>
                  <p className="text-[10px] text-gray-500 sm:text-xs">{item.label}</p>
                  <p className="mt-0.5 text-sm text-primary sm:text-base">{item.value}</p>
                </div>
              </motion.div>
            )

            return item.href ? (
              <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <div key={item.label}>{content}</div>
            )
          })}
        </div>

        <motion.a
          href={`mailto:${profile.email}?subject=实习咨询 - 杨子烽`}
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-black transition-all hover:gap-3"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          发送邮件
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110">
            <ArrowRight className="h-4 w-4 text-primary" />
          </span>
        </motion.a>
      </div>
    </section>
  )
}
