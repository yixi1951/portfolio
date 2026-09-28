// Scroll-linked solar system. Original scene: one sun-direction light per body,
// a fresnel atmosphere, and a tilted star band. Planet photographs are credited
// in public/textures/CREDITS.txt. Not derived from space.pointdynamics.com or
// 3dsolarsystem.online (those apps are not open source).

import * as THREE from 'three'

type Lang = 'zh' | 'en'

const NAMES: Record<string, Record<Lang, string>> = {
  sun: { zh: '太阳', en: 'Sun' },
  mercury: { zh: '水星', en: 'Mercury' },
  venus: { zh: '金星', en: 'Venus' },
  earth: { zh: '地球', en: 'Earth' },
  moon: { zh: '月球', en: 'Moon' },
  mars: { zh: '火星', en: 'Mars' },
  jupiter: { zh: '木星', en: 'Jupiter' },
  saturn: { zh: '土星', en: 'Saturn' },
}

const ATMO_VERT = `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPos = world.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const ATMO_FRAG = `
  uniform vec3 uSunDir;
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fres = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
    float lit = smoothstep(-0.25, 0.65, dot(normal, normalize(uSunDir)));
    gl_FragColor = vec4(uColor, fres * lit * uStrength);
  }
`

const STAR_VERT = `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(aSize * (220.0 / -mv.z), 0.6, 7.0);
    gl_Position = projectionMatrix * mv;
  }
`

const STAR_FRAG = `
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - vec2(0.5);
    float d = length(p);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, core * core);
  }
`

type BodySpec = {
  id: string
  map: string
  radius: number
  distance: number
  phase: number
  speed: number
  spin: number
  tilt: number
  roughness: number
  night?: string
  clouds?: string
  atmo?: { color: number; scale: number; strength: number }
  rings?: boolean
  y?: number
}

const BODIES: BodySpec[] = [
  { id: 'mercury', map: '/textures/mercury.webp', radius: 0.22, distance: 4.4, phase: 0.4, speed: 0.11, spin: 0.05, tilt: 0.01, roughness: 0.95 },
  { id: 'venus', map: '/textures/venus.webp', radius: 0.48, distance: 6.3, phase: 2.1, speed: 0.07, spin: 0.02, tilt: 0.05, roughness: 0.7, atmo: { color: 0xf0ddb0, scale: 1.035, strength: 0.85 } },
  { id: 'earth', map: '/textures/earth-day.webp', night: '/textures/earth-night.webp', clouds: '/textures/earth-clouds.webp', radius: 0.62, distance: 8.8, phase: 0.15, speed: 0.045, spin: 0.18, tilt: 0.41, roughness: 0.82, atmo: { color: 0x7eb6ff, scale: 1.055, strength: 1.15 } },
  { id: 'mars', map: '/textures/mars.webp', radius: 0.36, distance: 11.6, phase: 3.5, speed: 0.032, spin: 0.16, tilt: 0.44, roughness: 0.92, atmo: { color: 0xd07a58, scale: 1.03, strength: 0.55 } },
  { id: 'jupiter', map: '/textures/jupiter.webp', radius: 1.28, distance: 16.8, phase: 4.6, speed: 0.018, spin: 0.32, tilt: 0.05, roughness: 0.55, atmo: { color: 0xe6d2b4, scale: 1.025, strength: 0.4 } },
  { id: 'saturn', map: '/textures/saturn.webp', radius: 1.08, distance: 22.4, phase: 5.7, speed: 0.012, spin: 0.28, tilt: 0.47, roughness: 0.55, rings: true, atmo: { color: 0xf0ddb8, scale: 1.03, strength: 0.38 } },
]

function smoother(value: number) {
  const t = Math.min(1, Math.max(0, value))
  return t * t * (3 - 2 * t)
}

function makeStars(count: number, radius: number, band: boolean) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const tilt = new THREE.Matrix4().makeRotationX(1.05).multiply(new THREE.Matrix4().makeRotationZ(0.4))
  const point = new THREE.Vector3()
  for (let index = 0; index < count; index += 1) {
    if (band) {
      const lon = Math.random() * Math.PI * 2
      const lat = (Math.random() - 0.5) * Math.pow(Math.random(), 1.6) * 0.42
      point.set(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon))
    } else {
      const y = 1 - (index / Math.max(1, count - 1)) * 2
      const ring = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = Math.PI * (3 - Math.sqrt(5)) * index
      point.set(Math.cos(theta) * ring, y, Math.sin(theta) * ring)
    }
    point.applyMatrix4(tilt).multiplyScalar(radius * (0.92 + Math.random() * 0.16))
    positions[index * 3] = point.x
    positions[index * 3 + 1] = point.y
    positions[index * 3 + 2] = point.z
    const warm = Math.random()
    const tint = warm > 0.9 ? [1, 0.72, 0.42] : warm > 0.72 ? [0.62, 0.78, 1] : [0.9, 0.93, 1]
    const gain = band ? 0.28 + Math.random() * 0.35 : 0.45 + Math.pow(Math.random(), 6) * 1.4
    colors[index * 3] = tint[0] * gain
    colors[index * 3 + 1] = tint[1] * gain
    colors[index * 3 + 2] = tint[2] * gain
    sizes[index] = (band ? 1.1 : 1.6) * (0.35 + Math.pow(Math.random(), 5) * 4.2)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  const material = new THREE.ShaderMaterial({
    vertexShader: STAR_VERT,
    fragmentShader: STAR_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  })
  return new THREE.Points(geometry, material)
}

function glowSprite() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255, 248, 230, 1)')
  gradient.addColorStop(0.18, 'rgba(255, 214, 150, 0.55)')
  gradient.addColorStop(0.42, 'rgba(255, 150, 70, 0.16)')
  gradient.addColorStop(1, 'rgba(255, 120, 40, 0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 256, 256)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(11, 11, 1)
  return sprite
}

function orbitLine(distance: number, y: number) {
  const points: THREE.Vector3[] = []
  for (let index = 0; index <= 160; index += 1) {
    const angle = (index / 160) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * distance, y, Math.sin(angle) * distance))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: 0xc5d2ea, transparent: true, opacity: 0 })
  const line = new THREE.Line(geometry, material)
  line.visible = false
  return line
}

export function mountCosmos(
  host: HTMLElement,
  options: { mobile: boolean; reduced: boolean; lang: Lang; onLabel: (label: string | null) => void },
) {
  let lang = options.lang
  const labelFor = (id: string | null) => (id && NAMES[id] ? NAMES[id][lang] : null)

  const canvas = document.createElement('canvas')
  canvas.className = 'absolute inset-0 h-full w-full'
  host.appendChild(canvas)

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !options.mobile,
      alpha: false,
      powerPreference: 'high-performance',
    })
  } catch {
    canvas.remove()
    return { destroy() {}, setLang(next: Lang) { lang = next } }
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.setClearColor(0x05060c, 1)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.mobile ? 1 : 1.35))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(36, 1, 0.06, 800)
  camera.layers.enableAll()

  const starCount = options.mobile ? 1800 : 4200
  const bandCount = options.mobile ? 2800 : 7000
  scene.add(makeStars(starCount, 240, false))
  scene.add(makeStars(bandCount, 210, true))

  const sunGlow = glowSprite()
  if (sunGlow) scene.add(sunGlow)
  const sunMap = new THREE.TextureLoader().load('/textures/sun.webp')
  sunMap.colorSpace = THREE.SRGBColorSpace
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, options.mobile ? 32 : 48, options.mobile ? 24 : 36),
    new THREE.MeshBasicMaterial({ map: sunMap }),
  )
  sun.userData.id = 'sun'
  scene.add(sun)

  const rayTargets: THREE.Object3D[] = [sun]
  const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material; texture?: THREE.Texture }[] = []
  disposables.push({ geometry: sun.geometry as THREE.BufferGeometry, material: sun.material as THREE.Material, texture: sunMap })

  const loader = new THREE.TextureLoader()
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  const loadMap = (url: string) => {
    const texture = loader.load(url)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = anisotropy
    return texture
  }

  loader.manager.onLoad = () => {
    host.dataset.ready = 'true'
  }

  type Runtime = {
    id: string
    spec: BodySpec
    pivot: THREE.Group
    spin: THREE.Group
    light: THREE.DirectionalLight
    atmo?: THREE.ShaderMaterial
    clouds?: THREE.Mesh
  }
  const runtime: Runtime[] = []
  const orbitLines: THREE.Line[] = []
  let layer = 1

  const makeAtmo = (color: number, strength: number) => {
    const material = new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms: {
        uSunDir: { value: new THREE.Vector3(1, 0, 0) },
        uColor: { value: new THREE.Color(color) },
        uStrength: { value: strength },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      toneMapped: false,
    })
    return material
  }

  for (const spec of BODIES) {
    const map = loadMap(spec.map)
    map.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.MeshStandardMaterial({
      map,
      roughness: spec.roughness,
      metalness: spec.id === 'earth' ? 0.04 : 0,
    })
    if (spec.night) {
      const night = loadMap(spec.night)
      material.emissiveMap = night
      material.emissive = new THREE.Color(0xc5d4ff)
      material.emissiveIntensity = 1.15
      disposables.push({ texture: night })
    }
    const segments = options.mobile ? 32 : 56
    const geometry = new THREE.SphereGeometry(spec.radius, segments, Math.round(segments * 0.75))
    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData.id = spec.id
    mesh.layers.set(layer)

    const pivot = new THREE.Group()
    const spin = new THREE.Group()
    spin.rotation.z = spec.tilt
    spin.add(mesh)
    pivot.add(spin)
    scene.add(pivot)

    const light = new THREE.DirectionalLight(0xfff3df, 4.4)
    light.layers.set(layer)
    light.target = pivot
    scene.add(light)

    let atmoMaterial: THREE.ShaderMaterial | undefined
    if (spec.atmo) {
      atmoMaterial = makeAtmo(spec.atmo.color, spec.atmo.strength)
      const shell = new THREE.Mesh(new THREE.SphereGeometry(spec.radius * spec.atmo.scale, segments, Math.round(segments * 0.7)), atmoMaterial)
      shell.userData.id = spec.id
      shell.layers.set(layer)
      spin.add(shell)
      rayTargets.push(shell)
      disposables.push({ geometry: shell.geometry as THREE.BufferGeometry, material: atmoMaterial })
    }

    let clouds: THREE.Mesh | undefined
    if (spec.clouds) {
      const cloudTex = loadMap(spec.clouds)
      cloudTex.colorSpace = THREE.NoColorSpace
      const cloudMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        alphaMap: cloudTex,
        transparent: true,
        depthWrite: false,
        roughness: 1,
        opacity: 0.92,
      })
      clouds = new THREE.Mesh(new THREE.SphereGeometry(spec.radius * 1.012, segments, Math.round(segments * 0.75)), cloudMat)
      clouds.layers.set(layer)
      spin.add(clouds)
      disposables.push({ geometry: clouds.geometry as THREE.BufferGeometry, material: cloudMat, texture: cloudTex })
    }

    if (spec.rings) {
      const ringTex = loadMap('/textures/saturn-ring.webp')
      const inner = spec.radius * 1.28
      const outer = spec.radius * 2.25
      const ringGeo = new THREE.RingGeometry(inner, outer, options.mobile ? 64 : 128)
      const uv = ringGeo.attributes.uv
      const position = ringGeo.attributes.position
      for (let index = 0; index < position.count; index += 1) {
        const radius = Math.hypot(position.getX(index), position.getY(index))
        uv.setXY(index, (radius - inner) / (outer - inner), 0.5)
      }
      uv.needsUpdate = true
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTex,
        transparent: true,
        side: THREE.DoubleSide,
        roughness: 0.65,
        depthWrite: false,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = Math.PI / 2
      ring.layers.set(layer)
      spin.add(ring)
      disposables.push({ geometry: ringGeo, material: ringMat, texture: ringTex })
    }

    if (!options.mobile) {
      const line = orbitLine(spec.distance, spec.y ?? 0)
      orbitLines.push(line)
      scene.add(line)
    }
    rayTargets.push(mesh)
    disposables.push({ geometry, material, texture: map })
    runtime.push({ id: spec.id, spec, pivot, spin, light, atmo: atmoMaterial, clouds })
    layer += 1
  }

  const earth = runtime.find((body) => body.id === 'earth')
  let moonMesh: THREE.Mesh | null = null
  if (earth) {
    const moonTex = loadMap('/textures/moon.webp')
    const moonGeo = new THREE.SphereGeometry(0.17, options.mobile ? 24 : 40, options.mobile ? 18 : 28)
    const moonMat = new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.96, metalness: 0 })
    moonMesh = new THREE.Mesh(moonGeo, moonMat)
    moonMesh.userData.id = 'moon'
    moonMesh.layers.mask = earth.spin.children[0]?.layers.mask || 1
    earth.pivot.add(moonMesh)
    rayTargets.push(moonMesh)
    disposables.push({ geometry: moonGeo, material: moonMat, texture: moonTex })
    if (!options.mobile) {
      const local = orbitLine(1.25, 0)
      orbitLines.push(local)
      earth.pivot.add(local)
    }
  }

  // Earth is the third body and was assigned layer 3 (mercury 1, venus 2, earth 3).
  // The moon shares that layer so the same sunlight reaches it.

  const raycaster = new THREE.Raycaster()
  raycaster.layers.enableAll()
  const pointer = new THREE.Vector2()
  const desiredPos = new THREE.Vector3(8, 2, 6)
  const desiredLook = new THREE.Vector3()
  const lookCurrent = new THREE.Vector3()
  const earthPos = new THREE.Vector3()
  const focusPos = new THREE.Vector3()
  const spherical = new THREE.Spherical()
  const clock = new THREE.Clock()
  let progress = 0
  let smoothProgress = 0
  let yaw = 0
  let pitch = 0
  let dragging = false
  let lastX = 0
  let lastY = 0
  let moved = 0
  let focusId: string | null = null
  let focusScroll = 0
  let frame = 0
  let stopped = false
  let pixel = renderer.getPixelRatio()

  const resize = () => {
    const width = Math.max(1, host.clientWidth || window.innerWidth)
    const height = Math.max(1, host.clientHeight || window.innerHeight)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }

  const placeBodies = (time: number) => {
    for (const body of runtime) {
      const angle = body.spec.phase + (options.reduced ? 0 : time * body.spec.speed)
      body.pivot.position.set(Math.cos(angle) * body.spec.distance, body.spec.y ?? 0, Math.sin(angle) * body.spec.distance)
      if (!options.reduced) body.spin.rotation.y = time * body.spec.spin
      body.light.position.set(0, 0.15, 0)
      if (body.atmo) {
        body.atmo.uniforms.uSunDir.value.copy(body.pivot.position).negate().normalize()
      }
      if (body.clouds && !options.reduced) body.clouds.rotation.y = time * 0.012
    }
    if (moonMesh && earth) {
      const spin = options.reduced ? 0.8 : time * 0.16
      moonMesh.position.set(Math.cos(spin) * 1.25, 0.08, Math.sin(spin) * 1.25)
      moonMesh.rotation.y = spin
    }
    sun.rotation.y = options.reduced ? 0 : time * 0.02
  }

  const frameCamera = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const target = max > 1 ? window.scrollY / max : 0
    progress = target
    const follow = options.reduced ? 0.35 : 0.08
    smoothProgress += (progress - smoothProgress) * follow
    if (focusId && Math.abs(progress - focusScroll) > 0.018) focusId = null

    earth?.pivot.getWorldPosition(earthPos)
    const toSun = earthPos.clone().negate()
    if (toSun.lengthSq() < 1e-6) toSun.set(1, 0, 0)
    toSun.normalize()
    const side = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toSun).normalize()

    const close = earthPos.clone().add(toSun.clone().multiplyScalar(2.7)).add(side.clone().multiplyScalar(0.55)).add(new THREE.Vector3(0, 0.22, 0))
    const mid = earthPos.clone().add(toSun.clone().multiplyScalar(4.2)).add(side.clone().multiplyScalar(2.4)).add(new THREE.Vector3(0, 1.8, 0))
    const outward = earthPos.clone().normalize()
    const wide = outward.multiplyScalar(26).add(new THREE.Vector3(0, 15, 0))

    if (smoothProgress < 0.42) {
      const blend = smoother(smoothProgress / 0.42)
      desiredPos.copy(close).lerp(mid, blend)
      desiredLook.copy(earthPos).add(new THREE.Vector3(0, -0.22, 0))
    } else {
      const blend = smoother((smoothProgress - 0.42) / 0.58)
      desiredPos.copy(mid).lerp(wide, blend)
      desiredLook.copy(earthPos).lerp(new THREE.Vector3(0, 0, 0), blend)
    }

    if (focusId) {
      const targetMesh = rayTargets.find((item) => item.userData.id === focusId)
      if (targetMesh) {
        targetMesh.getWorldPosition(focusPos)
        const radius = focusId === 'sun' ? 1.15 : (BODIES.find((body) => body.id === focusId)?.radius ?? 0.17)
        const away = camera.position.clone().sub(focusPos)
        if (away.lengthSq() < 1e-4) away.set(0, 0.4, 1)
        away.normalize().multiplyScalar(Math.max(radius * 4.1, 1.4))
        desiredPos.copy(focusPos).add(away)
        desiredLook.copy(focusPos)
      }
    }

    const offset = desiredPos.clone().sub(desiredLook)
    spherical.setFromVector3(offset)
    spherical.theta += yaw
    spherical.phi = Math.max(0.22, Math.min(Math.PI - 0.22, spherical.phi + pitch))
    offset.setFromSpherical(spherical)
    desiredPos.copy(desiredLook).add(offset)

    const damp = 1 - Math.exp(-(options.reduced ? 14 : 3.1) * Math.min(0.05, Math.max(0.001, clock.getDelta())))
    camera.position.lerp(desiredPos, Math.min(1, Math.max(0.02, damp)))
    lookCurrent.lerp(desiredLook, Math.min(1, Math.max(0.02, damp)))
    camera.lookAt(lookCurrent)
    const lineOpacity = smoother((smoothProgress - 0.5) / 0.22) * 0.14
    for (const line of orbitLines) {
      const material = line.material as THREE.LineBasicMaterial
      material.opacity = lineOpacity
      line.visible = lineOpacity > 0.03
    }
  }

  const pick = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(rayTargets, false)
    return (hits[0]?.object.userData.id as string | undefined) ?? null
  }

  let hovered: string | null = null
  const publish = (id: string | null) => {
    if (id === hovered) return
    hovered = id
    options.onLabel(labelFor(id))
    canvas.style.cursor = id ? 'pointer' : dragging ? 'grabbing' : 'grab'
  }

  const draw = (now: number) => {
    const time = options.reduced ? 0 : now * 0.001
    placeBodies(time)
    scene.updateMatrixWorld(true)
    frameCamera()
    renderer.render(scene, camera)
    const cost = performance.now() - now
    if (cost > 42 && pixel > 0.7) {
      pixel = Math.max(0.7, pixel * 0.85)
      renderer.setPixelRatio(pixel)
    }
  }

  const loop = (now: number) => {
    if (stopped) return
    if (!document.hidden) draw(now)
    frame = window.requestAnimationFrame(loop)
  }

  resize()
  placeBodies(0)
  scene.updateMatrixWorld(true)
  draw(performance.now())
  frame = window.requestAnimationFrame(loop)

  const onResize = () => resize()
  const onDown = (event: PointerEvent) => {
    if (options.mobile || event.pointerType === 'touch') return
    dragging = true
    moved = 0
    lastX = event.clientX
    lastY = event.clientY
    canvas.style.cursor = 'grabbing'
  }
  const onMove = (event: PointerEvent) => {
    if (dragging) {
      const dx = event.clientX - lastX
      const dy = event.clientY - lastY
      lastX = event.clientX
      lastY = event.clientY
      moved += Math.abs(dx) + Math.abs(dy)
      yaw -= dx * 0.005
      pitch -= dy * 0.0035
      return
    }
    if (event.target !== canvas) {
      publish(null)
      return
    }
    publish(pick(event.clientX, event.clientY))
  }
  const onUp = (event: PointerEvent) => {
    const wasDrag = moved > 6
    dragging = false
    if (!wasDrag && event.target === canvas) {
      const id = pick(event.clientX, event.clientY)
      if (id) {
        focusId = id
        focusScroll = progress
        publish(id)
      }
    }
    canvas.style.cursor = hovered ? 'pointer' : 'grab'
  }

  canvas.style.cursor = 'grab'
  host.style.touchAction = 'pan-y'
  window.addEventListener('resize', onResize)
  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)

  return {
    setLang(next: Lang) {
      lang = next
      options.onLabel(labelFor(hovered ?? focusId))
    },
    destroy() {
      stopped = true
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      for (const item of disposables) {
        item.geometry?.dispose()
        item.material?.dispose()
        item.texture?.dispose()
      }
      renderer.dispose()
      canvas.remove()
      delete host.dataset.ready
    },
  }
}
