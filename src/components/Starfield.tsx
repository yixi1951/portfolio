import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  z: number
  r: number
  phase: number
  speed: number
}

type Meteor = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
}

function hash(index: number) {
  const x = Math.sin(index * 127.1) * 43758.5453
  return x - Math.floor(x)
}

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, (_, index) => ({
    x: hash(index + 1),
    y: hash(index + 19),
    z: 0.2 + hash(index + 37) * 0.8,
    r: hash(index + 53) > 0.9 ? 2.6 : hash(index + 71) > 0.62 ? 1.7 : 1,
    phase: hash(index + 91) * Math.PI * 2,
    speed: 0.004 + hash(index + 11) * 0.008,
  }))
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fineQuery = window.matchMedia('(pointer: fine)')
    const mobileQuery = window.matchMedia('(max-width: 768px)')

    let stars = makeStars(mobileQuery.matches ? 130 : 280)
    let meteors: Meteor[] = []
    let frame = 0
    let stopped = false
    let paused = false
    let lastMeteor = 0
    const pointer = { x: 0, y: 0 }

    const resize = () => {
      const mobile = mobileQuery.matches
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75)
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawnMeteor = (width: number, height: number) => {
      const fromLeft = hash(performance.now()) > 0.5
      meteors.push({
        x: fromLeft ? -40 : width * (0.2 + hash(performance.now() + 3) * 0.6),
        y: fromLeft ? height * (0.05 + hash(performance.now() + 5) * 0.45) : -20,
        vx: fromLeft ? 9 + hash(performance.now() + 7) * 5 : 5 + hash(performance.now() + 9) * 3,
        vy: 3.2 + hash(performance.now() + 13) * 2.4,
        life: 1,
        max: 1,
      })
    }

    const draw = (time: number) => {
      const width = window.innerWidth
      const height = window.innerHeight
      const reduce = motionQuery.matches
      const mobile = mobileQuery.matches
      const scroll = window.scrollY || 0
      context.clearRect(0, 0, width, height)

      for (const star of stars) {
        const driftX = reduce ? 0 : pointer.x * (mobile ? 70 : 180) * star.z
        const driftY = reduce ? 0 : pointer.y * (mobile ? 40 : 110) * star.z + scroll * (mobile ? 0.07 : 0.12) * star.z
        const px = ((star.x * width + driftX) % width + width) % width
        const py = ((star.y * height + driftY) % height + height) % height
        const twinkle = reduce ? 0.8 : 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(time * star.speed + star.phase))
        context.globalAlpha = twinkle
        context.fillStyle = star.z > 0.72 ? '#fffaf0' : '#d5defc'
        context.beginPath()
        context.arc(px, py, star.r * (0.75 + twinkle * 0.45), 0, Math.PI * 2)
        context.fill()
        if (star.r > 2) {
          context.globalAlpha = twinkle * 0.35
          context.beginPath()
          context.arc(px, py, star.r * 2.4, 0, Math.PI * 2)
          context.fill()
        }
      }

      context.globalAlpha = 1
      if (!reduce) {
        const cap = mobile ? 2 : 4
        const gap = mobile ? 1400 : 650
        if (meteors.length < cap && time - lastMeteor > gap) {
          spawnMeteor(width, height)
          lastMeteor = time
        }
        meteors = meteors.filter((meteor) => meteor.life > 0)
        for (const meteor of meteors) {
          meteor.x += meteor.vx
          meteor.y += meteor.vy
          meteor.life -= 0.007
          const tail = 46
          const gradient = context.createLinearGradient(
            meteor.x,
            meteor.y,
            meteor.x - meteor.vx * tail,
            meteor.y - meteor.vy * tail,
          )
          gradient.addColorStop(0, `rgba(255,250,240,${meteor.life})`)
          gradient.addColorStop(0.35, `rgba(190,205,255,${meteor.life * 0.7})`)
          gradient.addColorStop(1, 'rgba(190,205,255,0)')
          context.strokeStyle = gradient
          context.lineWidth = 2.6
          context.lineCap = 'round'
          context.beginPath()
          context.moveTo(meteor.x, meteor.y)
          context.lineTo(meteor.x - meteor.vx * tail, meteor.y - meteor.vy * tail)
          context.stroke()
          context.fillStyle = `rgba(255,250,240,${meteor.life})`
          context.beginPath()
          context.arc(meteor.x, meteor.y, 2.4, 0, Math.PI * 2)
          context.fill()
        }
      }
    }

    const loop = (time: number) => {
      if (stopped || paused) return
      draw(time)
      if (!motionQuery.matches) frame = window.requestAnimationFrame(loop)
    }

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5
      pointer.y = event.clientY / window.innerHeight - 0.5
    }

    const onResize = () => {
      const nextCount = mobileQuery.matches ? 130 : 280
      if (stars.length !== nextCount) stars = makeStars(nextCount)
      resize()
      if (motionQuery.matches) draw(0)
    }

    const onVisibility = () => {
      paused = document.hidden
      window.cancelAnimationFrame(frame)
      if (!paused && !motionQuery.matches) frame = window.requestAnimationFrame(loop)
    }

    resize()
    if (motionQuery.matches) draw(0)
    else frame = window.requestAnimationFrame(loop)

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    if (fineQuery.matches && !mobileQuery.matches) {
      window.addEventListener('pointermove', onPointer, { passive: true })
    }

    return () => {
      stopped = true
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="nebula nebula-a" />
      <div className="nebula nebula-b" />
      <div className="nebula nebula-c" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
