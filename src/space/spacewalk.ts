import * as THREE from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

const MODEL_URL = '/models/astronaut.glb'
const HDRI_URL = '/hdri/kloofendal_1k.hdr'
const EARTH_URL = '/media/earth-limb.webp'

export function mountSpacewalk(host: HTMLElement, options: { reduced: boolean }): () => void {
  const canvas = document.createElement('canvas')
  canvas.className = 'absolute inset-0 h-full w-full'
  host.appendChild(canvas)

  host.style.backgroundImage = `url("${EARTH_URL}")`
  host.style.backgroundSize = 'cover'
  host.style.backgroundPosition = 'center 78%'
  host.style.backgroundRepeat = 'no-repeat'

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()

  const camera = new THREE.PerspectiveCamera(24, 1, 0.05, 40)
  camera.position.set(0.28, 0.04, 5.15)
  camera.lookAt(0, -0.02, 0)

  const sun = new THREE.DirectionalLight('#fff1dc', 3.4)
  sun.position.set(4.2, 6.4, 3.6)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.near = 0.4
  sun.shadow.camera.far = 16
  sun.shadow.camera.left = -2.2
  sun.shadow.camera.right = 2.2
  sun.shadow.camera.top = 2.2
  sun.shadow.camera.bottom = -2.2
  sun.shadow.bias = -0.00035
  sun.shadow.normalBias = 0.02
  const rim = new THREE.DirectionalLight('#b9c8ff', 1.15)
  rim.position.set(-4.2, 1.8, -2.8)
  const fill = new THREE.DirectionalLight('#f4f7ff', 0.45)
  fill.position.set(-1.2, 0.6, 4.4)
  scene.add(sun, rim, fill, new THREE.AmbientLight('#c9d4ea', 0.18))

  const rig = new THREE.Group()
  scene.add(rig)

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 8),
    new THREE.ShadowMaterial({ opacity: 0.32 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.78
  ground.receiveShadow = true
  scene.add(ground)

  const draco = new DRACOLoader()
  draco.setDecoderPath('/draco/gltf/')
  const ktx2 = new KTX2Loader()
  ktx2.setTranscoderPath('/basis/')
  ktx2.detectSupport(renderer)
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)
  loader.setKTX2Loader(ktx2)

  let mixer: THREE.AnimationMixer | null = null
  let dead = false
  new RGBELoader().load(HDRI_URL, (texture) => {
    if (dead) {
      texture.dispose()
      return
    }
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = pmrem.fromEquirectangular(texture).texture
    texture.dispose()
  })

  loader.load(
    MODEL_URL,
    (gltf) => {
      const suit = gltf.scene
      suit.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.castShadow = true
        mesh.receiveShadow = true
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        for (const material of materials) {
          const physical = material as THREE.MeshPhysicalMaterial
          if (!physical.isMeshStandardMaterial) continue
          physical.side = THREE.FrontSide
          physical.envMapIntensity = physical.metalness > 0.45 || physical.roughness < 0.35 ? 1.8 : 1.05
        }
      })
      const box = new THREE.Box3().setFromObject(suit)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      suit.position.sub(center)
      suit.scale.setScalar(1.38 / Math.max(size.y, 0.001))
      rig.add(suit)
      const fitted = new THREE.Box3().setFromObject(suit)
      ground.position.y = fitted.min.y + 0.02

      const clip =
        gltf.animations.find((item) => item.name === 'floating') ?? gltf.animations[0]
      if (clip) {
        mixer = new THREE.AnimationMixer(suit)
        const action = mixer.clipAction(clip)
        action.play()
        if (options.reduced) {
          mixer.setTime(clip.duration * 0.4)
          action.paused = true
        }
      }
      host.dataset.ready = 'true'
    },
    undefined,
    () => {
      host.dataset.ready = 'true'
    },
  )

  let yaw = 0.42
  let yawV = 0
  let dragging = false
  let lastX = 0
  let hovering = false
  let frame = 0
  let stopped = false
  let visible = true
  let last = performance.now()

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
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (mixer && !options.reduced) mixer.update(dt)
    if (!dragging) {
      yaw += yawV
      yawV *= 0.94
    }
    const drift = options.reduced ? 0 : Math.sin(now * 0.00045) * 0.035
    rig.rotation.y = yaw + (options.reduced ? 0 : now * 0.00005)
    rig.rotation.z = 0.04
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
    dead = true
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
    ground.geometry.dispose()
    ;(ground.material as THREE.Material).dispose()
    host.style.backgroundImage = ''
    renderer.dispose()
    canvas.remove()
    delete host.dataset.ready
  }
}
