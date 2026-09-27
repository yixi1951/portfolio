import * as THREE from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export type SpacewalkOptions = {
  reduced: boolean
}

const MODEL_URL = '/models/astronaut.glb'

export function mountSpacewalk(host: HTMLElement, options: SpacewalkOptions) {
  const renderer = new THREE.WebGLRenderer({ antialias: !options.reduced, alpha: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.domElement.className = 'absolute inset-0 h-full w-full touch-none'
  host.appendChild(renderer.domElement)
  renderer.setSize(host.clientWidth || 1, host.clientHeight || 1)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 50)
  camera.position.set(0.15, 0.15, 2.4)

  const hemi = new THREE.HemisphereLight(0xdfe7ff, 0x1a120c, 0.85)
  const key = new THREE.DirectionalLight(0xfff4e4, 2.4)
  key.position.set(2.2, 2.4, 3)
  const rim = new THREE.DirectionalLight(0x8eb4ff, 1.1)
  rim.position.set(-2.4, 0.4, -1.6)
  const fill = new THREE.PointLight(0xffc9a0, 4, 8)
  fill.position.set(-0.4, -0.2, 1.4)
  scene.add(hemi, key, rim, fill)

  const starGeometry = new THREE.BufferGeometry()
  const starCount = 280
  const positions = new Float32Array(starCount * 3)
  for (let index = 0; index < starCount; index += 1) {
    const radius = 6 + Math.random() * 8
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[index * 3 + 1] = radius * Math.cos(phi)
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0xf7f4ea, size: 0.045, sizeAttenuation: true }),
  )
  scene.add(stars)

  const modelRoot = new THREE.Group()
  scene.add(modelRoot)

  const draco = new DRACOLoader()
  const loader = new GLTFLoader()
  loader.setDRACOLoader(draco)

  let disposed = false
  const state = {
    yaw: 0.35,
    pitch: 0.08,
    spin: options.reduced ? 0 : 0.15,
    hover: false,
    dragging: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    pointerX: 0,
    pointerY: 0,
    visible: true,
  }

  loader.load(
    MODEL_URL,
    (gltf) => {
      if (disposed) return
      const model = gltf.scene
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      const span = Math.max(size.x, size.y, size.z) || 1
      model.scale.setScalar(1.7 / span)
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        const material = child.material
        if (!(material instanceof THREE.MeshStandardMaterial)) return
        material.side = THREE.DoubleSide
        if (material.map) {
          material.emissiveMap = material.map
          material.emissive = new THREE.Color(0xffffff)
          material.emissiveIntensity = 0.28
        }
      })
      modelRoot.add(model)
      host.dataset.ready = 'true'
      render()
    },
    undefined,
    () => {
      host.dataset.failed = 'true'
    },
  )

  const viewSize = new THREE.Vector2()
  const render = () => {
    const width = Math.max(1, host.clientWidth)
    const height = Math.max(1, host.clientHeight)
    renderer.getSize(viewSize)
    if (Math.abs(viewSize.x - width) > 1 || Math.abs(viewSize.y - height) > 1) {
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    modelRoot.rotation.y = state.yaw
    modelRoot.rotation.x = state.pitch
    modelRoot.position.x = 0.42 + state.pointerX * 0.18
    modelRoot.position.y = state.pointerY * -0.1
    rim.intensity = state.hover ? 2.4 : 1.1
    key.intensity = state.hover ? 3.1 : 2.4
    camera.position.x = 0.15 + state.pointerX * 0.12
    camera.position.y = 0.15 + state.pointerY * -0.08
    camera.lookAt(0, 0, 0)
    renderer.render(scene, camera)
  }

  let frame = 0
  const loop = () => {
    if (disposed) return
    if (state.visible && !document.hidden) {
      if (!state.dragging) state.yaw += state.spin * 0.008
      state.spin *= 0.985
      if (!options.reduced && Math.abs(state.spin) < 0.12) state.spin = 0.15
      render()
    }
    if (!options.reduced) frame = requestAnimationFrame(loop)
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
    if (options.reduced) render()
  }
  const onPointerMove = (event: PointerEvent) => {
    if (state.dragging) {
      const dx = event.clientX - state.lastX
      const dy = event.clientY - state.lastY
      if (Math.abs(dx) + Math.abs(dy) > 3) state.moved = true
      state.yaw += dx * 0.008
      state.pitch = Math.max(-0.8, Math.min(0.8, state.pitch + dy * 0.006))
      state.lastX = event.clientX
      state.lastY = event.clientY
      state.spin = 0
    }
    setPointer(event)
    if (options.reduced) render()
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
    if (options.reduced) render()
  }
  window.addEventListener('resize', onResize)

  if (options.reduced) render()
  else frame = requestAnimationFrame(loop)

  return () => {
    disposed = true
    cancelAnimationFrame(frame)
    io.disconnect()
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.domElement.removeEventListener('pointerup', onPointerUp)
    renderer.domElement.removeEventListener('pointercancel', onPointerUp)
    renderer.domElement.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('resize', onResize)
    draco.dispose()
    starGeometry.dispose()
    ;(stars.material as THREE.Material).dispose()
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
