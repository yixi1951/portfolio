import * as THREE from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export type SpacewalkOptions = {
  reduced: boolean
}

const MODEL_URL = '/models/astronaut.glb'
const EARTH_URL = '/models/earth-limb.webp'
const FOV = 26
const WORLD_HEIGHT = 1.62
const FILL = 0.56

function makeStarTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#05060c'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < 420; index += 1) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = Math.random() < 0.06 ? 1.5 : 0.6 + Math.random() * 0.5
    const alpha = 0.35 + Math.random() * 0.65
    ctx.fillStyle = `rgba(244, 246, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function mountSpacewalk(host: HTMLElement, options: SpacewalkOptions) {
  const renderer = new THREE.WebGLRenderer({
    antialias: !options.reduced,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.domElement.className = 'absolute inset-0 h-full w-full touch-none'
  host.appendChild(renderer.domElement)
  renderer.setSize(host.clientWidth || 1, host.clientHeight || 1)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 80)
  const frame = { dist: 5.2 }

  const hemi = new THREE.HemisphereLight(0x9eb4dc, 0x120e0c, 0.16)
  const key = new THREE.DirectionalLight(0xfff2d4, 6.4)
  key.position.set(5.5, 4.6, 1.4)
  const fill = new THREE.DirectionalLight(0x6eafff, 1.7)
  fill.position.set(-4.2, -2.2, 1.2)
  const rim = new THREE.DirectionalLight(0xf4f8ff, 3.6)
  rim.position.set(-1.4, 2.4, -5.5)
  scene.add(hemi, key, fill, rim)

  const starTexture = makeStarTexture()
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(36, 28, 18),
    new THREE.MeshBasicMaterial({ map: starTexture ?? undefined, side: THREE.BackSide, color: 0x070910 }),
  )
  scene.add(sky)

  const earth = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff }),
  )
  earth.visible = false
  earth.position.set(0.15, -0.35, -2.6)
  scene.add(earth)

  const modelRoot = new THREE.Group()
  scene.add(modelRoot)

  const draco = new DRACOLoader()
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)

  let disposed = false
  const state = {
    yaw: 0.62,
    pitch: 0,
    spin: 0,
    hover: false,
    dragging: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    pointerX: 0,
    pointerY: 0,
    visible: true,
  }

  const placeEarth = () => {
    const earthZ = -2.6
    const dist = camera.position.z - earthZ
    const visH = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * dist
    const photoAspect = 1200 / 798
    const planeH = visH * 1.45
    const planeW = Math.max(planeH * photoAspect, visH * camera.aspect * 1.05)
    earth.scale.set(planeW, planeH, 1)
    earth.position.y = -visH * 0.18
  }

  const frameCamera = () => {
    frame.dist = WORLD_HEIGHT / 2 / Math.tan((FOV * Math.PI) / 180 / 2) / FILL
    camera.position.set(0, 0.02, frame.dist)
    camera.lookAt(0, 0.02, 0)
    placeEarth()
  }
  frameCamera()

  new THREE.TextureLoader().load(EARTH_URL, (texture) => {
    if (disposed) {
      texture.dispose()
      return
    }
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    const material = earth.material as THREE.MeshBasicMaterial
    material.map = texture
    material.needsUpdate = true
    earth.visible = true
    placeEarth()
  })

  loader.load(
    MODEL_URL,
    (gltf) => {
      if (disposed) return
      const model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      const height = Math.max(size.y, 0.001)
      model.scale.setScalar(WORLD_HEIGHT / height)
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        for (const material of materials) {
          if (!(material instanceof THREE.MeshStandardMaterial)) continue
          material.emissiveMap = null
          material.emissive = new THREE.Color(0x000000)
          material.emissiveIntensity = 0
          material.roughness = Math.min(material.roughness, 0.62)
          material.metalness = Math.max(material.metalness, 0.05)
          material.envMapIntensity = 0.2
          material.side = THREE.FrontSide
        }
      })
      modelRoot.add(model)
      host.dataset.ready = 'true'
      render(0)
    },
    undefined,
    () => {
      host.dataset.failed = 'true'
    },
  )

  const viewSize = new THREE.Vector2()
  const render = (now = 0) => {
    const width = Math.max(1, host.clientWidth)
    const height = Math.max(1, host.clientHeight)
    renderer.getSize(viewSize)
    if (Math.abs(viewSize.x - width) > 1 || Math.abs(viewSize.y - height) > 1) {
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const t = options.reduced ? 0 : now * 0.001
    const driftYaw = state.dragging ? 0 : Math.sin(t * 0.22) * 0.045
    const driftRoll = state.dragging ? 0 : Math.sin(t * 0.37) * 0.03
    const driftY = state.dragging ? 0 : Math.sin(t * 0.55) * 0.04
    modelRoot.rotation.y = state.yaw + driftYaw
    modelRoot.rotation.x = state.pitch
    modelRoot.rotation.z = driftRoll
    modelRoot.position.set(state.pointerX * 0.04, driftY - state.pointerY * 0.03, 0)
    rim.intensity = state.hover ? 5.0 : 3.6
    key.intensity = state.hover ? 7.4 : 6.4
    camera.position.set(state.pointerX * 0.05, 0.02 - state.pointerY * 0.03, frame.dist)
    camera.lookAt(0, 0.02, 0)
    placeEarth()
    renderer.render(scene, camera)
  }

  let frameId = 0
  const loop = (now: number) => {
    if (disposed) return
    if (state.visible && !document.hidden) {
      if (!state.dragging) state.yaw += state.spin * 0.008
      state.spin *= 0.985
      render(now)
    }
    if (!options.reduced) frameId = requestAnimationFrame(loop)
  }

  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()

  const setPointer = (event: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect()
    state.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    state.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1
    ndc.set(state.pointerX, -state.pointerY)
    raycaster.setFromCamera(ndc, camera)
    state.hover = raycaster.intersectObject(modelRoot, true).length > 0
    renderer.domElement.style.cursor = state.dragging ? 'grabbing' : state.hover ? 'grab' : 'default'
  }

  const onPointerDown = (event: PointerEvent) => {
    state.dragging = true
    state.moved = false
    state.lastX = event.clientX
    state.lastY = event.clientY
    renderer.domElement.setPointerCapture(event.pointerId)
  }
  const onPointerUp = (event: PointerEvent) => {
    if (state.dragging && !state.moved && state.hover) state.spin = state.spin > 0.4 ? 0 : 1.4
    state.dragging = false
    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId)
    }
    if (options.reduced) render(0)
  }
  const onPointerMove = (event: PointerEvent) => {
    if (state.dragging) {
      const dx = event.clientX - state.lastX
      const dy = event.clientY - state.lastY
      if (Math.abs(dx) + Math.abs(dy) > 3) state.moved = true
      state.yaw += dx * 0.008
      state.pitch = Math.max(-0.6, Math.min(0.6, state.pitch + dy * 0.005))
      state.lastX = event.clientX
      state.lastY = event.clientY
      state.spin = 0
    }
    setPointer(event)
    if (options.reduced) render(0)
  }

  const io = new IntersectionObserver(([entry]) => {
    state.visible = Boolean(entry?.isIntersecting)
  })
  io.observe(host)

  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointerup', onPointerUp)
  renderer.domElement.addEventListener('pointercancel', onPointerUp)
  renderer.domElement.addEventListener('pointermove', onPointerMove)
  const onResize = () => {
    if (options.reduced) render(0)
  }
  window.addEventListener('resize', onResize)

  if (options.reduced) render(0)
  else frameId = requestAnimationFrame(loop)

  return () => {
    disposed = true
    cancelAnimationFrame(frameId)
    io.disconnect()
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.domElement.removeEventListener('pointerup', onPointerUp)
    renderer.domElement.removeEventListener('pointercancel', onPointerUp)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('resize', onResize)
    draco.dispose()
    scene.traverse((object) => {
      const mesh = object as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.geometry?.dispose()
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        const record = material as unknown as Record<string, unknown>
        for (const value of Object.values(record)) {
          if (value instanceof THREE.Texture) value.dispose()
        }
        material.dispose()
      }
    })
    renderer.dispose()
    renderer.domElement.remove()
    delete host.dataset.ready
  }
}
