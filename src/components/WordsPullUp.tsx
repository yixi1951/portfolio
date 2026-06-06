import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface WordsPullUpProps {
  text: string
  className?: string
  style?: React.CSSProperties
  showAsterisk?: boolean
}

export function WordsPullUp({
  text,
  className = '',
  style,
  showAsterisk = false,
}: WordsPullUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const words = text.split(' ')

  const renderWord = (word: string, isLast: boolean) => {
    if (showAsterisk && isLast) {
      const lastAIndex = word.lastIndexOf('a')
      if (lastAIndex !== -1) {
        const before = word.slice(0, lastAIndex)
        const after = word.slice(lastAIndex + 1)

        return (
          <>
            {before}
            <span className="relative inline-block">
              a
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            </span>
            {after}
          </>
        )
      }
    }

    return word
  }

  return (
    <div ref={ref} className={className} style={style}>
      {words.map((word, index) => (
        <span key={index} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {renderWord(word, index === words.length - 1)}
            {index < words.length - 1 ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </div>
  )
}
