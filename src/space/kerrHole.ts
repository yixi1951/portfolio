import * as THREE from 'three'
import { KERR_FRAG, KERR_POST_FRAG, KERR_VERT } from './kerrShaders'

const GM_TILT = (16 * Math.PI) / 180

export function mountKerrHole(
  host: HTMLElement,
  options: { mobile: boolean; reduced: boolean; onError: () => void },
): () => void {
  const canvas = document.createElement('canvas')
  canvas.className = 'absolute inset-0 h-full w-full'
  host.appendChild(canvas)

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
  } catch {
    options.onError()
    canvas.remove()
    return () => {}
  }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  renderer.toneMapping = THREE.NoToneMapping

  const steps = options.mobile ? 160 : 360
  const pixelBudget = options.mobile ? 42000 : 150000
  const fragment = KERR_FRAG.replace('#define MAX_STEPS 1500', `#define MAX_STEPS ${steps}`)

  const target = new THREE.WebGLRenderTarget(8, 8, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType,
    depthBuffer: false,
  })

  const renderCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const quad = new THREE.PlaneGeometry(2, 2)

  const material = new THREE.ShaderMaterial({
    vertexShader: KERR_VERT,
    fragmentShader: fragment,
    uniforms: {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(8, 8) },
      u_cameraPos: { value: new THREE.Vector3() },
      u_cameraDir: { value: new THREE.Vector3() },
      u_cameraUp: { value: new THREE.Vector3() },
      u_cameraRight: { value: new THREE.Vector3() },
      u_spin: { value: 0.62 },
      u_tilt: { value: GM_TILT },
      u_diskPuffiness: { value: 0.55 },
      u_turbulence: { value: 3.2 },
      u_stepScale: { value: options.mobile ? 1.7 : 1.25 },
      u_starSize: { value: 1.4 },
    },
    depthWrite: false,
    depthTest: false,
  })
  const scene = new THREE.Scene()
  scene.add(new THREE.Mesh(quad, material))

  const postMaterial = new THREE.ShaderMaterial({
    vertexShader: KERR_VERT,
    fragmentShader: KERR_POST_FRAG,
    uniforms: {
      tDiffuse: { value: target.texture },
      u_resolution: { value: new THREE.Vector2(8, 8) },
      u_bloomThreshold: { value: 0.35 },
      u_bloomStrength: { value: 0.55 },
      u_flareStrength: { value: 0.85 },
      u_aberration: { value: 0.45 },
      u_master: { value: 1 },
    },
    depthWrite: false,
    depthTest: false,
  })
  const postScene = new THREE.Scene()
  postScene.add(new THREE.Mesh(quad, postMaterial))

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  let radius = 11.2
  let polar = 1.22
  let azimuth = 0.18
  let polarV = 0
  let azimuthV = 0
  let dragging = false
  let lastX = 0
  let lastY = 0
  let simTime = 0
  let last = performance.now()
  let frame = 0
  let stopped = false
  let visible = true
  let pixelBudgetLive = pixelBudget
  let stepScale = options.mobile ? 1.7 : 1.25
  let slowFrames = 0
  let warmed = 0
  const pointers = new Map<number, { x: number; y: number }>()
  let pinchDistance = 0

  const place = () => {
    const span = Math.sin(polar)
    camera.position.set(radius * span * Math.sin(azimuth), radius * Math.cos(polar), radius * span * Math.cos(azimuth))
    camera.lookAt(0, 0, 0)
    camera.updateMatrixWorld()
  }

  const resize = () => {
    const rect = host.getBoundingClientRect()
    const aspect = Math.max(rect.width, 1) / Math.max(rect.height, 1)
    let height = Math.sqrt(pixelBudgetLive / aspect)
    let width = height * aspect
    const cap = rect.width
    if (width > cap) {
      width = cap
      height = cap / aspect
    }
    width = Math.max(2, Math.round(width))
    height = Math.max(2, Math.round(height))
    renderer.setSize(width, height, false)
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    target.setSize(width, height)
    material.uniforms.u_resolution.value.set(width, height)
    postMaterial.uniforms.u_resolution.value.set(width, height)
    camera.aspect = aspect
    camera.updateProjectionMatrix()
  }

  const draw = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!options.reduced) simTime += dt
    if (!dragging) {
      azimuth += azimuthV
      polar += polarV
      azimuthV *= 0.92
      polarV *= 0.92
      polar = Math.max(0.42, Math.min(2.15, polar))
    }
    place()
    const basis = camera.matrixWorld.elements
    material.uniforms.u_time.value = simTime
    material.uniforms.u_cameraPos.value.copy(camera.position)
    material.uniforms.u_cameraRight.value.set(basis[0], basis[1], basis[2]).normalize()
    material.uniforms.u_cameraUp.value.set(basis[4], basis[5], basis[6]).normalize()
    material.uniforms.u_cameraDir.value.set(-basis[8], -basis[9], -basis[10]).normalize()
    renderer.setRenderTarget(target)
    renderer.render(scene, renderCamera)
    renderer.setRenderTarget(null)
    renderer.render(postScene, renderCamera)
    if (!host.dataset.ready) host.dataset.ready = 'true'
    const cost = performance.now() - now
    warmed += 1
    if (warmed > 2 && cost > 48 && pixelBudgetLive > 28000) {
      slowFrames += 1
      if (slowFrames >= 2) {
        pixelBudgetLive = Math.round(pixelBudgetLive * 0.7)
        stepScale = Math.min(2.2, stepScale * 1.18)
        material.uniforms.u_stepScale.value = stepScale
        slowFrames = 0
        resize()
      }
    } else if (cost < 28) {
      slowFrames = 0
    }
  }

  const loop = (now: number) => {
    if (stopped) return
    if (visible && !document.hidden) draw(now)
    frame = window.requestAnimationFrame(loop)
  }

  resize()
  place()
  draw(performance.now())
  frame = window.requestAnimationFrame(loop)

  const onResize = () => resize()
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting)
  })
  io.observe(host)
  window.addEventListener('resize', onResize)

  const pointerSpan = () => {
    const pts = [...pointers.values()]
    if (pts.length < 2) return 0
    const dx = pts[0].x - pts[1].x
    const dy = pts[0].y - pts[1].y
    return Math.hypot(dx, dy)
  }
  const clampRadius = (value: number) => Math.min(28, Math.max(6.2, value))

  const onDown = (event: PointerEvent) => {
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 1) {
      dragging = true
      lastX = event.clientX
      lastY = event.clientY
      azimuthV = 0
      polarV = 0
    } else {
      dragging = false
      pinchDistance = pointerSpan()
    }
    host.setPointerCapture(event.pointerId)
  }
  const onUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId)
    if (pointers.size < 2) pinchDistance = 0
    dragging = pointers.size === 1
    if (dragging) {
      const [point] = pointers.values()
      lastX = point.x
      lastY = point.y
      azimuthV = 0
      polarV = 0
    }
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
  }
  const onMove = (event: PointerEvent) => {
    if (!pointers.has(event.pointerId)) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size >= 2) {
      const span = pointerSpan()
      if (pinchDistance > 8 && span > 8) radius = clampRadius(radius * (pinchDistance / span))
      pinchDistance = span
      return
    }
    if (!dragging) return
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    azimuth -= dx * 0.005
    polar = Math.max(0.42, Math.min(2.15, polar + dy * 0.0035))
    azimuthV = -dx * 0.0009
    polarV = dy * 0.0005
  }
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    radius = clampRadius(radius * Math.exp(event.deltaY * 0.0011))
  }

  host.addEventListener('pointerdown', onDown)
  host.addEventListener('pointerup', onUp)
  host.addEventListener('pointercancel', onUp)
  host.addEventListener('pointermove', onMove)
  host.addEventListener('wheel', onWheel, { passive: false })

  return () => {
    stopped = true
    window.cancelAnimationFrame(frame)
    io.disconnect()
    window.removeEventListener('resize', onResize)
    host.removeEventListener('pointerdown', onDown)
    host.removeEventListener('pointerup', onUp)
    host.removeEventListener('pointercancel', onUp)
    host.removeEventListener('pointermove', onMove)
    host.removeEventListener('wheel', onWheel)
    quad.dispose()
    material.dispose()
    postMaterial.dispose()
    target.dispose()
    renderer.dispose()
    canvas.remove()
    delete host.dataset.ready
  }
}
