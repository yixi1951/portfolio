const STILL_URL = '/media/black-hole-still.webp'
const VIDEO_URL = '/media/black-hole.webm'
const IMAGE_ASPECT = 16 / 9

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uParallax;
uniform float uZoom;
uniform sampler2D uImage;
out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 coverUV(vec2 uv) {
  vec2 p = uv - 0.5;
  float canvasAspect = uResolution.x / uResolution.y;
  if (canvasAspect > ${IMAGE_ASPECT.toFixed(6)}) p.y *= ${IMAGE_ASPECT.toFixed(6)} / canvasAspect;
  else p.x *= canvasAspect / ${IMAGE_ASPECT.toFixed(6)};
  p = p / uZoom + uParallax;
  return p + 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 suv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  vec2 cursor = (uPointer - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  vec2 delta = cursor - suv;
  float dist = length(delta);
  vec2 bent = suv + delta * (0.014 / (dist + 0.08));

  vec2 cell = floor(bent * 52.0);
  vec2 f = fract(bent * 52.0);
  float rnd = hash(cell);
  vec2 starAt = vec2(hash(cell + 1.7), hash(cell + 8.2));
  float core = smoothstep(0.055, 0.0, length(f - starAt));
  float bright = step(0.988, rnd);
  float star = core * bright * mix(0.35, 1.0, hash(cell + 3.1));

  vec2 iuv = coverUV(uv);
  float inside = step(0.0, iuv.x) * step(iuv.x, 1.0) * step(0.0, iuv.y) * step(iuv.y, 1.0);
  vec3 plate = texture(uImage, iuv).rgb;
  float luma = dot(plate, vec3(0.2126, 0.7152, 0.0722));
  float disk = smoothstep(0.012, 0.07, luma);
  vec2 hole = iuv - vec2(0.498, 0.556);
  float radius = length(vec2(hole.x * ${IMAGE_ASPECT.toFixed(6)}, hole.y));
  float shadow = (1.0 - smoothstep(0.145, 0.172, radius)) * (1.0 - smoothstep(0.02, 0.055, luma));
  float alpha = max(disk, shadow) * inside;
  vec3 color = mix(vec3(star), plate, alpha);
  color = mix(color, vec3(0.0), shadow * inside);
  outColor = vec4(color, 1.0);
}
`

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function mountNasaHole(host: HTMLElement, options: { onError: () => void }): () => void {
  const canvas = document.createElement('canvas')
  canvas.className = 'absolute inset-0 h-full w-full'
  host.appendChild(canvas)
  const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, powerPreference: 'high-performance' })
  if (!gl) {
    options.onError()
    return () => canvas.remove()
  }

  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) {
    options.onError()
    return () => canvas.remove()
  }
  const program = gl.createProgram()
  if (!program) {
    options.onError()
    return () => canvas.remove()
  }
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    options.onError()
    return () => canvas.remove()
  }
  gl.useProgram(program)
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)

  const uResolution = gl.getUniformLocation(program, 'uResolution')
  const uPointer = gl.getUniformLocation(program, 'uPointer')
  const uParallax = gl.getUniformLocation(program, 'uParallax')
  const uZoom = gl.getUniformLocation(program, 'uZoom')
  const uImage = gl.getUniformLocation(program, 'uImage')

  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

  const video = document.createElement('video')
  video.src = VIDEO_URL
  video.muted = true
  video.loop = true
  video.playsInline = true
  video.preload = 'auto'
  video.setAttribute('playsinline', '')
  video.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
  host.appendChild(video)

  let usingVideo = false
  let zoom = 1
  let pointerX = 0.5
  let pointerY = 0.5
  let targetX = 0.5
  let targetY = 0.5
  let tiltX = 0
  let tiltY = 0
  let targetTiltX = 0
  let targetTiltY = 0
  let dragging = false
  let lastX = 0
  let lastY = 0
  let frame = 0
  let stopped = false

  const upload = (source: TexImageSource) => {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  }

  const resize = () => {
    const rect = host.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.floor(rect.width * dpr))
    const height = Math.max(1, Math.floor(rect.height * dpr))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  const draw = () => {
    if (stopped) return
    resize()
    pointerX += (targetX - pointerX) * 0.08
    pointerY += (targetY - pointerY) * 0.08
    tiltX += (targetTiltX - tiltX) * 0.08
    tiltY += (targetTiltY - tiltY) * 0.08
    canvas.style.transform = `perspective(1100px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
    if (usingVideo && video.readyState >= 2) upload(video)
    gl.useProgram(program)
    gl.uniform2f(uResolution, canvas.width, canvas.height)
    gl.uniform2f(uPointer, pointerX, pointerY)
    gl.uniform2f(uParallax, (pointerX - 0.5) * 0.02, (pointerY - 0.5) * 0.015)
    gl.uniform1f(uZoom, zoom)
    gl.uniform1i(uImage, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  const loop = () => {
    if (stopped) return
    draw()
    frame = window.requestAnimationFrame(loop)
  }

  const still = new Image()
  still.src = STILL_URL
  const showStill = () => {
    if (!still.naturalWidth) {
      options.onError()
      return
    }
    upload(still)
    draw()
    host.dataset.ready = 'true'
    frame = window.requestAnimationFrame(loop)
  }
  if (still.complete) showStill()
  else still.addEventListener('load', showStill, { once: true })
  still.addEventListener('error', () => options.onError(), { once: true })

  video.addEventListener('error', () => {
    usingVideo = false
  })

  const point = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect()
    targetX = (event.clientX - rect.left) / rect.width
    targetY = 1 - (event.clientY - rect.top) / rect.height
    targetTiltY = (targetX - 0.5) * 8
    targetTiltX = (targetY - 0.5) * -6
  }

  const onMove = (event: PointerEvent) => {
    point(event)
    if (!dragging) return
    const dx = event.clientX - lastX
    const dy = event.clientY - lastY
    lastX = event.clientX
    lastY = event.clientY
    targetTiltY = Math.max(-10, Math.min(10, targetTiltY + dx * 0.08))
    targetTiltX = Math.max(-8, Math.min(8, targetTiltX - dy * 0.06))
  }
  const onDown = (event: PointerEvent) => {
    dragging = true
    lastX = event.clientX
    lastY = event.clientY
    host.setPointerCapture(event.pointerId)
  }
  const onUp = (event: PointerEvent) => {
    dragging = false
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId)
  }
  const onEnter = () => {
    usingVideo = true
    if (video.currentTime < 0.2) video.currentTime = 0.4
    void video.play().catch(() => {
      usingVideo = false
    })
  }
  const onLeave = () => {
    dragging = false
    targetX = 0.5
    targetY = 0.5
    targetTiltX = 0
    targetTiltY = 0
    video.pause()
  }
  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    zoom = Math.min(1.12, Math.max(0.94, zoom * Math.exp(-event.deltaY * 0.0011)))
  }

  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerdown', onDown)
  host.addEventListener('pointerup', onUp)
  host.addEventListener('pointerenter', onEnter)
  host.addEventListener('pointerleave', onLeave)
  host.addEventListener('wheel', onWheel, { passive: false })

  return () => {
    stopped = true
    window.cancelAnimationFrame(frame)
    video.pause()
    host.removeEventListener('pointermove', onMove)
    host.removeEventListener('pointerdown', onDown)
    host.removeEventListener('pointerup', onUp)
    host.removeEventListener('pointerenter', onEnter)
    host.removeEventListener('pointerleave', onLeave)
    host.removeEventListener('wheel', onWheel)
    canvas.remove()
    video.remove()
    gl.deleteTexture(texture)
    gl.deleteProgram(program)
    gl.deleteVertexArray(vao)
    delete host.dataset.ready
  }
}
