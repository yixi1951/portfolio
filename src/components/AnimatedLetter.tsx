import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

interface AnimatedLetterProps {
  char: string
  index: number
  totalChars: number
  scrollYProgress: MotionValue<number>
}

export function AnimatedLetter({
  char,
  index,
  totalChars,
  scrollYProgress,
}: AnimatedLetterProps) {
  const charProgress = index / totalChars
  const opacity = useTransform(
    scrollYProgress,
    [charProgress - 0.1, charProgress + 0.05],
    [0.2, 1],
  )

  return (
    <motion.span style={{ opacity }}>
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  )
}

interface AnimatedParagraphProps {
  text: string
  className?: string
}

export function AnimatedParagraph({ text, className = '' }: AnimatedParagraphProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  const chars = text.split('')

  return (
    <p ref={ref} className={className}>
      {chars.map((char, index) => (
        <AnimatedLetter
          key={index}
          char={char}
          index={index}
          totalChars={chars.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </p>
  )
}
