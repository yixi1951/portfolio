// Scroll-linked solar system. Original scene: sunlit planets, an Earth shader
// (day, night cities, clouds, ocean glint, thin fresnel air), and a photographic
// Milky Way. Maps are credited in public/textures/CREDITS.txt.

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

const SKY_VERT = `
  varying vec3 vDir;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDir = world.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const SKY_FRAG = `
  uniform sampler2D uMap;
  uniform float uGain;
  varying vec3 vDir;
  void main() {
    vec3 dir = normalize(vDir);
    float u = atan(dir.z, dir.x) * 0.15915494 + 0.5;
    float v = asin(clamp(dir.y, -1.0, 1.0)) * 0.31830989 + 0.5;
    vec3 color = texture2D(uMap, vec2(u, v)).rgb * uGain;
    color = color / (vec3(1.0) + color);
    gl_FragColor = vec4(color, 1.0);
  }
`

const EARTH_VERT = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const EARTH_FRAG = `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform sampler2D uSpec;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 sunDir = normalize(uSun);
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float ndotl = dot(normal, sunDir);
    float day = smoothstep(-0.04, 0.3, ndotl);
    vec3 dayColor = texture2D(uDay, vUv).rgb;
    vec3 nightColor = texture2D(uNight, vUv).rgb;
    float nightGate = smoothstep(0.22, -0.18, ndotl);
    vec3 color = dayColor * (0.015 + 0.985 * day);
    color += nightColor * nightGate * 3.4;
    float ocean = texture2D(uSpec, vUv).r;
    vec3 halfDir = normalize(sunDir + viewDir);
    float glint = pow(max(dot(normal, halfDir), 0.0), 72.0);
    color += vec3(1.0, 0.98, 0.9) * glint * ocean * day * 1.5;
    float fres = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    color += vec3(0.5, 0.78, 1.0) * fres * (0.2 + 0.8 * day) * 0.45;
    gl_FragColor = linearToOutputTexel(vec4(toneMapping(color), 1.0));
  }
`

const CLOUD_FRAG = `
  uniform sampler2D uCloud;
  uniform vec3 uSun;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 sunDir = normalize(uSun);
    float light = smoothstep(-0.22, 0.42, dot(normal, sunDir));
    float mask = texture2D(uCloud, vUv).g;
    float alpha = smoothstep(0.16, 0.7, mask) * (0.22 + 0.78 * light);
    vec3 color = vec3(0.95, 0.97, 1.0) * (0.28 + 0.9 * light);
    gl_FragColor = linearToOutputTexel(vec4(toneMapping(color), alpha * 0.92));
  }
`

const ATMO_VERT = `
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const ATMO_FRAG = `
  uniform vec3 uSun;
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vWorld;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - max(dot(normal, viewDir), 0.0), uPower);
    float sun = smoothstep(-0.2, 0.7, dot(normal, normalize(uSun)));
    vec3 color = pow(uColor, vec3(0.4545));
    gl_FragColor = vec4(color, fres * (0.12 + 0.88 * sun) * uStrength);
  }
`

type BodySpec = {
  id: string
  map: string
  radius: number
  distance: number
  offset: number
  spin: number
  tilt: number
  roughness: number
  atmo?: { color: number; scale: number; strength: number }
  rings?: boolean
}

const BODIES: BodySpec[] = [
  { id: 'mercury', map: '/textures/mercury.webp', radius: 0.22, distance: 4.3, offset: -0.55, spin: 0.05, tilt: 0.01, roughness: 0.95 },
  { id: 'venus', map: '/textures/venus.webp', radius: 0.48, distance: 6.2, offset: -0.26, spin: 0.02, tilt: 0.05, roughness: 0.7, atmo: { color: 0xf0ddb0, scale: 1.03, strength: 0.7 } },
  { id: 'earth', map: '/textures/earth-day.webp', radius: 0.62, distance: 8.55, offset: 0, spin: 0.18, tilt: 0.41, roughness: 0.55 },
  { id: 'mars', map: '/textures/mars.webp', radius: 0.36, distance: 10.5, offset: 0.13, spin: 0.16, tilt: 0.44, roughness: 0.92, atmo: { color: 0xd07a58, scale: 1.025, strength: 0.4 } },
  { id: 'jupiter', map: '/textures/jupiter.webp', radius: 1.22, distance: 13.1, offset: 0.26, spin: 0.32, tilt: 0.05, roughness: 0.55, atmo: { color: 0xe6d2b4, scale: 1.02, strength: 0.28 } },
  { id: 'saturn', map: '/textures/saturn.webp', radius: 1.02, distance: 16.0, offset: 0.4, spin: 0.28, tilt: 0.47, roughness: 0.55, rings: true, atmo: { color: 0xf0ddb8, scale: 1.025, strength: 0.26 } },
]

function smoother(value: number) {
  const t = Math.min(1, Math.max(0, value))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

function glowSprite() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return null
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, 'rgba(255, 248, 230, 1)')
  gradient.addColorStop(0.16, 'rgba(255, 220, 160, 0.5)')
  gradient.addColorStop(0.4, 'rgba(255, 160, 80, 0.12)')
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
  sprite.scale.set(6.5, 6.5, 1)
  return sprite
}

function orbitLine(distance: number) {
  const points: THREE.Vector3[] = []
  for (let index = 0; index <= 180; index += 1) {
    const angle = (index / 180) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({ color: 0xc9d6ec, transparent: true, opacity: 0 })
  const line = new THREE.Line(geometry, material)
  line.visible = false
  return line
}

function shiftLook(pos: THREE.Vector3, look: THREE.Vector3, ndcX: number, ndcY: number, fov: number, aspect: number) {
  const forward = look.clone().sub(pos)
  const dist = Math.max(0.001, forward.length())
  forward.multiplyScalar(1 / dist)
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0))
  if (right.lengthSq() < 1e-6) right.set(1, 0, 0)
  right.normalize()
  const up = new THREE.Vector3().crossVectors(right, forward).normalize()
  const halfH = Math.tan(THREE.MathUtils.degToRad(fov) * 0.5)
  const halfW = halfH * aspect
  look.addScaledVector(right, -ndcX * halfW * dist)
  look.addScaledVector(up, -ndcY * halfH * dist)
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
  renderer.toneMappingExposure = 1.05
  renderer.setClearColor(0x02030a, 1)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.mobile ? 1 : 1.35))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 900)
  camera.layers.enableAll()

  const loader = new THREE.TextureLoader()
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
  const disposables: { geometry?: THREE.BufferGeometry; material?: THREE.Material; texture?: THREE.Texture }[] = []

  const loadMap = (url: string, colorSpace: THREE.ColorSpace) => {
    const texture = loader.load(url)
    texture.colorSpace = colorSpace
    texture.anisotropy = anisotropy
    return texture
  }

  const skyMap = loadMap('/textures/milky-way.webp', THREE.NoColorSpace)
  skyMap.wrapS = THREE.ClampToEdgeWrapping
  skyMap.generateMipmaps = false
  skyMap.minFilter = THREE.LinearFilter
  skyMap.magFilter = THREE.LinearFilter
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(520, options.mobile ? 80 : 192, options.mobile ? 40 : 96),
    new THREE.ShaderMaterial({
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      uniforms: { uMap: { value: skyMap }, uGain: { value: options.mobile ? 8 : 11 } },
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
    }),
  )
  sky.rotation.z = 1.05
  sky.rotation.y = 0.35
  sky.frustumCulled = false
  sky.renderOrder = -2
  scene.add(sky)
  disposables.push({ geometry: sky.geometry as THREE.BufferGeometry, material: sky.material as THREE.Material, texture: skyMap })

  const sunGlow = glowSprite()
  if (sunGlow) scene.add(sunGlow)
  const sunMap = loadMap('/textures/sun.webp', THREE.SRGBColorSpace)
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, options.mobile ? 32 : 48, options.mobile ? 24 : 36),
    new THREE.MeshBasicMaterial({ map: sunMap }),
  )
  sun.userData.id = 'sun'
  scene.add(sun)

  const rayTargets: THREE.Object3D[] = [sun]
  disposables.push({ geometry: sun.geometry as THREE.BufferGeometry, material: sun.material as THREE.Material, texture: sunMap })

  loader.manager.onLoad = () => {
    host.dataset.ready = 'true'
  }

  type Runtime = {
    id: string
    spec: BodySpec
    pivot: THREE.Group
    spin: THREE.Group
    light: THREE.DirectionalLight
    sunUniform?: { value: THREE.Vector3 }
    clouds?: THREE.Mesh
  }
  const runtime: Runtime[] = []
  const orbitLines: THREE.Line[] = []
  let layer = 1
  let earthLayer = 1
  const segments = options.mobile ? 36 : 64

  const makeAtmo = (color: number, power: number, strength: number) =>
    new THREE.ShaderMaterial({
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      uniforms: {
        uSun: { value: new THREE.Vector3(1, 0, 0) },
        uColor: { value: new THREE.Color(color) },
        uPower: { value: power },
        uStrength: { value: strength },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    })

  for (const spec of BODIES) {
    const pivot = new THREE.Group()
    const spin = new THREE.Group()
    spin.rotation.z = spec.tilt
    pivot.add(spin)
    scene.add(pivot)

    const light = new THREE.DirectionalLight(0xfff4e4, 4.6)
    light.layers.set(layer)
    light.target = pivot
    scene.add(light)
    if (spec.id === 'earth') earthLayer = layer

    let sunUniform: { value: THREE.Vector3 } | undefined
    let clouds: THREE.Mesh | undefined
    let geometry: THREE.BufferGeometry
    let material: THREE.Material

    if (spec.id === 'earth') {
      const day = loadMap(spec.map, THREE.SRGBColorSpace)
      const night = loadMap('/textures/earth-night.webp', THREE.SRGBColorSpace)
      const specMap = loadMap('/textures/earth-spec.webp', THREE.NoColorSpace)
      sunUniform = { value: new THREE.Vector3(1, 0, 0) }
      geometry = new THREE.SphereGeometry(spec.radius, segments, Math.round(segments * 0.72))
      material = new THREE.ShaderMaterial({
        vertexShader: EARTH_VERT,
        fragmentShader: EARTH_FRAG,
        uniforms: { uDay: { value: day }, uNight: { value: night }, uSpec: { value: specMap }, uSun: sunUniform },
      })
      const cloudTex = loadMap('/textures/earth-clouds.webp', THREE.NoColorSpace)
      const cloudMat = new THREE.ShaderMaterial({
        vertexShader: EARTH_VERT,
        fragmentShader: CLOUD_FRAG,
        uniforms: { uCloud: { value: cloudTex }, uSun: sunUniform },
        transparent: true,
        depthWrite: false,
      })
      clouds = new THREE.Mesh(new THREE.SphereGeometry(spec.radius * 1.014, segments, Math.round(segments * 0.72)), cloudMat)
      clouds.renderOrder = 2
      spin.add(clouds)
      disposables.push({ geometry: clouds.geometry as THREE.BufferGeometry, material: cloudMat, texture: cloudTex }, { texture: night }, { texture: specMap }, { texture: day })

      const inner = makeAtmo(0xb7dcff, 7.2, 1.05)
      const innerShell = new THREE.Mesh(new THREE.SphereGeometry(spec.radius * 1.02, segments, Math.round(segments * 0.7)), inner)
      innerShell.userData.id = 'earth'
      innerShell.renderOrder = 3
      spin.add(innerShell)
      rayTargets.push(innerShell)
      const outer = makeAtmo(0x8ec4ff, 2.6, 0.22)
      const outerShell = new THREE.Mesh(new THREE.SphereGeometry(spec.radius * 1.07, segments, Math.round(segments * 0.6)), outer)
      outerShell.renderOrder = 3
      spin.add(outerShell)
      disposables.push(
        { geometry: innerShell.geometry as THREE.BufferGeometry, material: inner },
        { geometry: outerShell.geometry as THREE.BufferGeometry, material: outer },
      )
      sunUniform = inner.uniforms.uSun as { value: THREE.Vector3 }
      // Earth, clouds, and both shells share one sun vector.
      ;(material as THREE.ShaderMaterial).uniforms.uSun = sunUniform
      cloudMat.uniforms.uSun = sunUniform
      outer.uniforms.uSun = sunUniform
    } else {
      const map = loadMap(spec.map, THREE.SRGBColorSpace)
      geometry = new THREE.SphereGeometry(spec.radius, segments, Math.round(segments * 0.72))
      material = new THREE.MeshStandardMaterial({ map, roughness: spec.roughness, metalness: 0 })
      disposables.push({ texture: map })
      if (spec.atmo) {
        const atmo = makeAtmo(spec.atmo.color, 3.4, spec.atmo.strength)
        sunUniform = atmo.uniforms.uSun as { value: THREE.Vector3 }
        const shell = new THREE.Mesh(new THREE.SphereGeometry(spec.radius * spec.atmo.scale, segments, Math.round(segments * 0.65)), atmo)
        shell.userData.id = spec.id
        shell.layers.set(layer)
        spin.add(shell)
        rayTargets.push(shell)
        disposables.push({ geometry: shell.geometry as THREE.BufferGeometry, material: atmo })
      }
    }

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData.id = spec.id
    mesh.layers.set(layer)
    spin.add(mesh)
    rayTargets.push(mesh)
    disposables.push({ geometry, material })

    if (spec.rings) {
      const ringTex = loadMap('/textures/saturn-ring.webp', THREE.SRGBColorSpace)
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
      const line = orbitLine(spec.distance)
      orbitLines.push(line)
      scene.add(line)
    }
    runtime.push({ id: spec.id, spec, pivot, spin, light, sunUniform, clouds })
    layer += 1
  }

  const earth = runtime.find((body) => body.id === 'earth')
  let moonMesh: THREE.Mesh | null = null
  if (earth) {
    const moonTex = loadMap('/textures/moon.webp', THREE.SRGBColorSpace)
    const moonGeo = new THREE.SphereGeometry(0.17, options.mobile ? 24 : 40, options.mobile ? 18 : 28)
    const moonMat = new THREE.MeshStandardMaterial({ map: moonTex, roughness: 0.96, metalness: 0 })
    moonMesh = new THREE.Mesh(moonGeo, moonMat)
    moonMesh.userData.id = 'moon'
    moonMesh.layers.set(earthLayer)
    earth.pivot.add(moonMesh)
    rayTargets.push(moonMesh)
    disposables.push({ geometry: moonGeo, material: moonMat, texture: moonTex })
  }

  const raycaster = new THREE.Raycaster()
  raycaster.layers.enableAll()
  const pointer = new THREE.Vector2()
  const desiredPos = new THREE.Vector3(8, 2, 6)
  const desiredLook = new THREE.Vector3()
  const lookCurrent = new THREE.Vector3()
  const earthPos = new THREE.Vector3()
  const focusPos = new THREE.Vector3()
  const posePos = new THREE.Vector3()
  const poseLook = new THREE.Vector3()
  const spherical = new THREE.Spherical()
  const clock = new THREE.Clock()
  const up = new THREE.Vector3(0, 1, 0)
  let smoothProgress = 0
  let yaw = 0
  let pitch = 0
  let dragging = false
  let lastX = 0
  let lastY = 0
  let moved = 0
  let focusId: string | null = null
  let focusScroll = 0
  let focusMix = 0
  let frame = 0
  let stopped = false
  let pixel = renderer.getPixelRatio()
  let armed = false

  const resize = () => {
    const width = Math.max(1, host.clientWidth || window.innerWidth)
    const height = Math.max(1, host.clientHeight || window.innerHeight)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height, false)
  }

  const placeBodies = (time: number) => {
    const theta = 0.42 + (options.reduced ? 0 : time * 0.012)
    for (const body of runtime) {
      const angle = theta + body.spec.offset
      body.pivot.position.set(Math.cos(angle) * body.spec.distance, 0, Math.sin(angle) * body.spec.distance)
      if (!options.reduced) body.spin.rotation.y = time * body.spec.spin
      body.light.position.set(0, 0.2, 0)
      if (body.sunUniform) body.sunUniform.value.copy(body.pivot.position).negate().normalize()
      if (body.clouds && !options.reduced) body.clouds.rotation.y = time * 0.02
    }
    if (moonMesh && earth) {
      const spin = options.reduced ? 1.1 : 1.1 + time * 0.12
      const sideX = -Math.sin(theta)
      const sideZ = Math.cos(theta)
      moonMesh.position.set(sideX * -0.2, 1.08, sideZ * -0.2)
      moonMesh.rotation.y = spin
    }
    sun.rotation.y = options.reduced ? 0 : time * 0.02
  }

  const frameCamera = (delta: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const target = max > 1 ? window.scrollY / max : 0
    const follow = armed ? 1 - Math.exp(-Math.min(0.25, delta) * (options.reduced ? 14 : 3.2)) : 1
    smoothProgress += (target - smoothProgress) * follow
    if (focusId && Math.abs(target - focusScroll) > 0.02) focusId = null
    const wantFocus = focusId ? 1 : 0
    focusMix += (wantFocus - focusMix) * (1 - Math.exp(-delta * 3.2))
    if (focusMix < 0.001) focusMix = 0

    earth?.pivot.getWorldPosition(earthPos)
    const toSun = earthPos.clone().negate()
    if (toSun.lengthSq() < 1e-6) toSun.set(1, 0, 0)
    toSun.normalize()
    const side = new THREE.Vector3().crossVectors(up, toSun).normalize()

    const heroPos = earthPos.clone().addScaledVector(toSun, 4.9).addScaledVector(side, 3.5).add(new THREE.Vector3(0, 0.72, 0))
    const heroLook = earthPos.clone().add(new THREE.Vector3(0, 0.02, 0))
    const midPos = earthPos.clone().addScaledVector(toSun, 12.2).addScaledVector(side, -0.3).add(new THREE.Vector3(0, 4.5, 0))
    const midLook = earthPos.clone().addScaledVector(side, 2.0).add(new THREE.Vector3(0, 0.15, 0))
    const widePos = earthPos.clone().addScaledVector(toSun, 14).addScaledVector(side, -1.2).add(new THREE.Vector3(0, 5.6, 0))
    const wideLook = earthPos.clone().addScaledVector(side, 2.3).add(new THREE.Vector3(0, 0.25, 0))
    const farPos = earthPos.clone().addScaledVector(toSun, 20).addScaledVector(side, -2.4).add(new THREE.Vector3(0, 8.2, 0))
    const farLook = earthPos.clone().addScaledVector(side, 3.1).add(new THREE.Vector3(0, 0.35, 0))

    const keys = [0, 0.3, 0.62, 1]
    const positions = [heroPos, midPos, widePos, farPos]
    const looks = [heroLook, midLook, wideLook, farLook]
    const lane = options.mobile ? 0.08 : 1
    const ndc = [
      { x: 0.5 * lane, y: options.mobile ? 0.28 : 0.02 },
      { x: 0.52 * lane, y: 0.06 },
      { x: 0.52 * lane, y: 0.05 },
      { x: 0.5 * lane, y: 0.04 },
    ]
    let index = 0
    if (smoothProgress >= keys[2]) index = 2
    else if (smoothProgress >= keys[1]) index = 1
    const span = keys[index + 1] - keys[index]
    const blend = smoother((smoothProgress - keys[index]) / span)
    posePos.copy(positions[index]).lerp(positions[index + 1], blend)
    poseLook.copy(looks[index]).lerp(looks[index + 1], blend)
    const ndcX = ndc[index].x + (ndc[index + 1].x - ndc[index].x) * blend
    const ndcY = ndc[index].y + (ndc[index + 1].y - ndc[index].y) * blend
    shiftLook(posePos, poseLook, ndcX, ndcY, camera.fov, camera.aspect)

    desiredPos.copy(posePos)
    desiredLook.copy(poseLook)

    if (focusMix > 0 && focusId) {
      const targetMesh = rayTargets.find((item) => item.userData.id === focusId)
      if (targetMesh) {
        targetMesh.getWorldPosition(focusPos)
        const radius = focusId === 'sun' ? 1.15 : (BODIES.find((body) => body.id === focusId)?.radius ?? 0.17)
        const away = posePos.clone().sub(focusPos)
        if (away.lengthSq() < 1e-4) away.set(0.2, 0.35, 1)
        away.normalize().multiplyScalar(Math.max(radius * 3.6, 1.35))
        const focusCamera = focusPos.clone().add(away)
        const focusLook = focusPos.clone()
        shiftLook(focusCamera, focusLook, options.mobile ? 0 : 0.36, 0.04, camera.fov, camera.aspect)
        desiredPos.copy(posePos).lerp(focusCamera, focusMix)
        desiredLook.copy(poseLook).lerp(focusLook, focusMix)
      }
    }

    const offset = desiredPos.clone().sub(desiredLook)
    spherical.setFromVector3(offset)
    spherical.theta += yaw
    spherical.phi = Math.max(0.18, Math.min(Math.PI - 0.18, spherical.phi + pitch))
    offset.setFromSpherical(spherical)
    desiredPos.copy(desiredLook).add(offset)

    const damp = armed ? 1 - Math.exp(-Math.min(0.25, delta) * (options.reduced ? 16 : 4)) : 1
    armed = true
    camera.position.lerp(desiredPos, damp)
    lookCurrent.lerp(desiredLook, damp)
    camera.lookAt(lookCurrent)

    const lineOpacity = smoother((smoothProgress - 0.34) / 0.2) * 0.16
    for (const line of orbitLines) {
      const material = line.material as THREE.LineBasicMaterial
      material.opacity = lineOpacity
      line.visible = lineOpacity > 0.02
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
    const delta = Math.min(0.05, Math.max(0.001, clock.getDelta()))
    placeBodies(time)
    scene.updateMatrixWorld(true)
    frameCamera(delta)
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
        focusScroll = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
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
