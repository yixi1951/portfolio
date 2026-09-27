import { useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

function useInstantLine() {
  const reduce = useReducedMotion()
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches,
  )

  useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)')
    const onChange = () => setNarrow(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return Boolean(reduce) || narrow
}

function Typer({ text, className }: { text: string; className: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setCount(index)
      if (index >= text.length) window.clearInterval(timer)
    }, 16)
    return () => window.clearInterval(timer)
  }, [text])

  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {count < text.length && <span className="type-caret" />}
      </span>
    </p>
  )
}

export function TypeLine({ text, className = '' }: { text: string; className?: string }) {
  const instant = useInstantLine()
  if (instant) return <p className={className}>{text}</p>
  return <Typer key={text} text={text} className={className} />
}
