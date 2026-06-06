import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Check, ExternalLink } from 'lucide-react'
import { WordsPullUpMultiStyle } from './WordsPullUpMultiStyle'
import { profile, projects } from '../data/profile'

interface ProjectCardProps {
  index: number
  project: (typeof projects)[number]
}

function ProjectCard({ index, project }: ProjectCardProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.a
      ref={ref}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-2xl bg-[#212121] p-5 transition-colors hover:bg-[#282828] sm:p-6"
      initial={{ opacity: 0, scale: 0.95, y: 24 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 24 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] text-gray-500 sm:text-xs">
            {String(index + 1).padStart(2, '0')} · {project.period}
          </p>
          <h3 className="mt-1 text-lg text-primary transition-colors group-hover:text-primary/90 sm:text-xl">
            {project.displayName}
          </h3>
          <p className="mt-1 text-[10px] text-gray-500 sm:text-xs">{project.role}</p>
        </div>
        <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-gray-500 transition-colors group-hover:text-primary" />
      </div>

      <p className="mb-4 text-sm leading-relaxed text-gray-400">{project.summary}</p>

      <ul className="mb-5 flex-1 space-y-2.5">
        {project.highlights.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="text-xs leading-relaxed text-gray-400 sm:text-sm">{item}</span>
          </li>
        ))}
      </ul>

      <div className="mb-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-primary/80 sm:text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary/70" />
          {project.language}
        </span>
        <span>{project.updatedAt}</span>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-primary opacity-0 transition-opacity group-hover:opacity-100">
        查看源码
        <ArrowRight className="h-4 w-4 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.a>
  )
}

export function Projects() {
  return (
    <section id="projects" className="relative bg-black px-4 py-20 sm:px-6 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-4 text-[10px] text-primary sm:text-xs">项目经历</p>
          <WordsPullUpMultiStyle
            className="mb-3 text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
            segments={[{ text: '端到端 AI 系统，从想法到可演示。', className: 'text-primary' }]}
          />
          <WordsPullUpMultiStyle
            className="text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
            segments={[{ text: '全部原创项目，开源在 GitHub。', className: 'text-gray-500' }]}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.name} index={index} project={project} />
          ))}
        </div>

        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href={`https://github.com/${profile.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm text-primary/70 transition-colors hover:text-primary"
          >
            @{profile.github}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
