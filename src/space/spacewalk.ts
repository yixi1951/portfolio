import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const MODEL_URL = '/models/emu.glb'
const EARTH_URL = '/media/earth-limb.webp'

export function mountSpacewalk(host: HTMLElement, options: { reduced: boolean }): () => void {
  const canvas = document.createElement('canvas')
  canvas.className = 'absolute inset-0 h-full w-full'
  host.appendChild(canvas)

  host.style.backgroundImage = `url("${EARTH_URL}")`
  host.style.backgroundSize = 'cover'
  host.style.backgroundPosition = 'center 82%'
  host.style.backgroundRepeat = 'no-repeat'

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 40)
  camera.position.set(0.42, 0.12, 4.6)

  const sun = new THREE.DirectionalLight('#fff6ea', 2.6)
  sun.position.set(3.4, 4.8, 4.2)
  const rim = new THREE.DirectionalLight('#9eb6ff', 1.35)
  rim.position.set(-3.6, 1.6, -2.4)
  const fill = new THREE.DirectionalLight('#f3f6ff', 0.7)
  fill.position.set(-1.4, 0.4, 3.2)
  scene.add(sun, rim, fill, new THREE.AmbientLight('#d5e2ff', 0.55))

  const rig = new THREE.Group()
  scene.add(rig)

  const draco = new DRACOLoader()
  draco.setDecoderPath('/draco/gltf/')
  const ktx2 = new KTX2Loader()
  ktx2.setTranscoderPath('/basis/')
  ktx2.detectSupport(renderer)
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)
  loader.setKTX2Loader(ktx2)

  let suit: THREE.Object3D | null = null
  loader.load(
    MODEL_URL,
    (gltf) => {
      suit = gltf.scene
      suit.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.castShadow = false
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const material of materials) {
          const physical = material as THREE.MeshPhysicalMaterial
          if (!physical.isMeshStandardMaterial) continue
          // The NASA export marks every surface as fully transmissive, which hides the suit.
          physical.transmission = 0
          physical.thickness = 0
          physical.transparent = false
          physical.opacity = 1
          physical.depthWrite = true
          physical.side = THREE.DoubleSide
          const name = physical.name || ''
          if (name.includes('blinn2')) {
            physical.color.set('#e8bc62')
            physical.metalness = 1
            physical.roughness = 0.08
            physical.envMapIntensity = 2.2
          } else if (name.includes('blinn')) {
            physical.metalness = 0.35
            physical.roughness = 0.42
            physical.envMapIntensity = 1.1
          } else {
            physical.metalness = 0.04
            physical.roughness = 0.58
            physical.envMapIntensity = 0.85
          }
        }
      })
      const box = new THREE.Box3().setFromObject(suit)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      suit.position.sub(center)
      suit.scale.setScalar(1.85 / Math.max(size.y, 0.001))
      rig.add(suit)
      host.dataset.ready = 'true'
    },
    undefined,
    () => {
      host.dataset.ready = 'true'
    },
  )

  let yaw = 0.55
  let yawV = 0
  let dragging = false
  let lastX = 0
  let hovering = false
  let frame = 0
  let stopped = false
  let visible = true
  const started = performance.now()

  const resize = () => {
    const rect = host.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width))
    const height = Math.max(1, Math.round(rect.height))
    renderer.setSize(width, height, false)
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const draw = (now: number) => {
    const t = (now - started) / 1000
    if (!dragging) {
      yaw += yawV
      yawV *= 0.94
    }
    const drift = options.reduced ? 0 : Math.sin(t * 0.55) * 0.08
    const sway = options.reduced ? 0 : t * 0.12
    rig.rotation.y = yaw + sway
    rig.rotation.z = 0.12 + (options.reduced ? 0 : Math.sin(t * 0.35) * 0.03)
    rig.position.y = drift
    scene.environmentIntensity = hovering ? 1.55 : 1
    renderer.render(scene, camera)
  }

  const loop = (now: number) => {
    if (stopped) return
    if (visible && !document.hidden) draw(now)
    frame = window.requestAnimationFrame(loop)
  }
  resize()
  frame = window.requestAnimationFrame(loop)

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting)
  })
  io.observe(host)

  const onDown = (event: PointerEvent) => {
    dragging = true
    lastX = event.clientX
    yawV = 0
    host.setPointerCapture(event.pointerId)
  }
  const onUp = (event: PointerEvent) => {
    dragging = false
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
  }
  const onMove = (event: PointerEvent) => {
    if (!dragging) return
    const dx = event.clientX - lastX
    lastX = event.clientX
    yaw += dx * 0.008
    yawV = dx * 0.0016
  }
  const onEnter = () => {
    hovering = true
  }
  const onLeave = () => {
    hovering = false
    dragging = false
  }

  host.addEventListener('pointerdown', onDown)
  host.addEventListener('pointerup', onUp)
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerenter', onEnter)
  host.addEventListener('pointerleave', onLeave)
  window.addEventListener('resize', resize)

  return () => {
    stopped = true
    window.cancelAnimationFrame(frame)
    io.disconnect()
    window.removeEventListener('resize', resize)
    host.removeEventListener('pointerdown', onDown)
    host.removeEventListener('pointerup', onUp)
    host.removeEventListener('pointermove', onMove)
    host.removeEventListener('pointerenter', onEnter)
    host.removeEventListener('pointerleave', onLeave)
    draco.dispose()
    ktx2.dispose()
    pmrem.dispose()
    host.style.backgroundImage = ''
    renderer.dispose()
    canvas.remove()
    delete host.dataset.ready
  }
}
