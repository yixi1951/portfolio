import * as THREE from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const EARTH_ASPECT = 1200 / 798

export type SpacewalkOptions = {
  reduced: boolean
}

const MODEL_URL = '/models/astronaut.glb'
const EARTH_URL = '/models/earth-limb.webp'
const FOV = 26
const WORLD_HEIGHT = 1.62
const FILL = 0.56

function relaxArms(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true)
  const box = new THREE.Box3().setFromObject(root)
  const size = box.getSize(new THREE.Vector3())
  const shoulderY = box.min.y + size.y * 0.78
  const shoulderX = size.x * 0.22
  const armReach = Math.max(size.x * 0.5 - shoulderX, 0.001)
  const height = Math.max(size.y, 0.001)

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    const attr = child.geometry.getAttribute('position')
    if (!attr) return
    const inverse = child.matrixWorld.clone().invert()
    const point = new THREE.Vector3()
    for (let index = 0; index < attr.count; index += 1) {
      point.fromBufferAttribute(attr, index).applyMatrix4(child.matrixWorld)
      const side = point.x < 0 ? -1 : 1
      const outward = Math.abs(point.x) - shoulderX
      const height01 = (point.y - box.min.y) / height
      const arm = outward > 0 && height01 > 0.4 && height01 < 0.9 && point.z > box.min.z + size.z * 0.2
      if (arm) {
        const t = THREE.MathUtils.clamp(outward / armReach, 0, 1)
        let angle = 1.35 * Math.sqrt(t)
        if (t > 0.38) angle += 1.15 * ((t - 0.38) / 0.62)
        const ca = Math.cos(-side * angle)
        const sa = Math.sin(-side * angle)
        const pivotX = side * shoulderX
        const dx = point.x - pivotX
        const dy = point.y - shoulderY
        point.x = pivotX + ca * dx - sa * dy
        point.y = shoulderY + sa * dx + ca * dy
        point.z -= Math.sin(angle) * height * 0.055 * t
      }
      point.applyMatrix4(inverse)
      attr.setXYZ(index, point.x, point.y, point.z)
    }
    attr.needsUpdate = true
    child.geometry.computeVertexNormals()
    child.geometry.computeBoundingBox()
    child.geometry.computeBoundingSphere()
  })
}

function makeEnvironment(renderer: THREE.WebGLRenderer) {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = new THREE.Scene()
  env.add(new THREE.Mesh(new THREE.SphereGeometry(12, 20, 14), new THREE.MeshBasicMaterial({ color: 0x070b14, side: THREE.BackSide })))
  const earthGlow = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16), new THREE.MeshBasicMaterial({ color: 0x2a6eb8 }))
  earthGlow.position.set(-1.5, -6.5, 1)
  const sun = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff4d2 }))
  sun.position.set(5, 4.2, 3)
  env.add(earthGlow, sun)
  const map = pmrem.fromScene(env, 0.04).texture
  pmrem.dispose()
  env.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry.dispose()
    const material = mesh.material
    if (material instanceof THREE.Material) material.dispose()
  })
  return map
}

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

  scene.environment = makeEnvironment(renderer)

  const earthMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, color: 0xffffff })
  const earth = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), earthMaterial)
  earth.visible = false
  earth.position.set(0, 0, -3.2)
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
    const earthZ = -3.2
    const dist = Math.max(0.4, camera.position.z - earthZ)
    const visH = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * dist
    const visW = visH * Math.max(camera.aspect, 0.1)
    earth.scale.set(visW, visH, 1)
    earth.position.set(0, -visH * 0.06, earthZ)
    const map = earthMaterial.map
    if (!map) return
    const viewAspect = visW / visH
    if (EARTH_ASPECT > viewAspect) {
      const repeatX = viewAspect / EARTH_ASPECT
      map.repeat.set(repeatX, 1)
      map.offset.set((1 - repeatX) * 0.5, 0)
    } else {
      const repeatY = EARTH_ASPECT / viewAspect
      map.repeat.set(1, repeatY)
      map.offset.set(0, (1 - repeatY) * 0.18)
    }
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
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
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
      relaxArms(model)
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
          material.side = THREE.FrontSide
          const visor = material.name === 'astnt1_2'
          if (visor) {
            material.color.set(0xffc45a)
            material.map = null
            material.metalness = 1
            material.roughness = 0.08
            material.envMapIntensity = 1.4
          } else {
            material.color.set(0xffffff)
            material.metalness = 0.12
            material.roughness = 0.78
            material.envMapIntensity = 0.45
          }
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
    const driftYaw = state.dragging ? 0 : t * 0.18
    const driftRoll = state.dragging ? 0 : Math.sin(t * 0.35) * 0.035
    const driftY = state.dragging ? 0 : Math.sin(t * 0.5) * 0.045
    modelRoot.rotation.order = 'YXZ'
    modelRoot.rotation.y = state.yaw + driftYaw
    modelRoot.rotation.x = -0.22 + state.pitch
    modelRoot.rotation.z = 0.32 + driftRoll
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
