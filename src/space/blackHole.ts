export type BlackHoleOptions = {
  reduced: boolean
  mobile: boolean
  onError?: () => void
}

const VERT = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uResolution;
uniform vec2 uAngle;
uniform vec2 uPointer;
uniform float uZoom;
uniform float uTime;

vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}
vec3 rotX(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

vec3 stars(vec3 dir) {
  vec3 color = vec3(0.015, 0.02, 0.04);
  float band = exp(-8.0 * dir.y * dir.y);
  color += vec3(0.22, 0.28, 0.45) * band * (0.35 + 0.25 * dir.x);
  for (int layer = 0; layer < 2; layer++) {
    float scale = layer == 0 ? 36.0 : 78.0;
    vec3 cell = floor(dir * scale + float(layer) * 9.0);
    float n = hash13(cell);
    float gate = layer == 0 ? 0.978 : 0.992;
    float spark = smoothstep(gate, gate + 0.012, n);
    float tw = 0.55 + 0.45 * sin(uTime * (1.2 + n) + n * 40.0);
    vec3 tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.9, 0.7), hash13(cell + 2.0));
    color += tint * spark * tw;
  }
  return color;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv += uPointer * 0.06;
  vec3 rd = normalize(vec3(uv * uZoom, -1.25));
  vec3 ro = vec3(0.0, 0.72, 4.4);
  rd = rotX(rd, uAngle.y);
  ro = rotX(ro, uAngle.y);
  rd = rotY(rd, uAngle.x);
  ro = rotY(ro, uAngle.x);

  const float rs = 0.62;
  float h2 = dot(cross(ro, rd), cross(ro, rd));
  vec3 p = ro;
  vec3 v = rd;
  vec3 disk = vec3(0.0);
  float cover = 0.0;
  bool swallowed = false;
  float closest = 40.0;

  const int STEPS = STEP_COUNT;
  for (int i = 0; i < STEPS; i++) {
    float r2 = dot(p, p);
    float r = sqrt(r2);
    closest = min(closest, r);
    if (r < rs) {
      swallowed = true;
      break;
    }
    if (r > 16.0) break;
    float dt = 0.045 * clamp(r, 0.25, 2.4);
    vec3 acc = -1.5 * rs * h2 * p / (r2 * r2 * r);
    vec3 v2 = normalize(v + acc * dt);
    vec3 p2 = p + v2 * dt;

    if (p.y * p2.y < 0.0 && cover < 0.97) {
      float t = clamp(p.y / (p.y - p2.y), 0.0, 1.0);
      vec3 hit = mix(p, p2, t);
      float rho = length(hit.xz);
      float inner = rs * 2.35;
      float outer = 6.4;
      if (rho > inner && rho < outer) {
        vec3 tangent = vec3(-hit.z, 0.0, hit.x) / max(rho, 0.001);
        float beta = clamp(0.78 * sqrt(inner / rho), 0.05, 0.86);
        float cosRel = dot(v2, tangent);
        float doppler = sqrt(max(1.0 - beta * beta, 0.001)) / max(1.0 - beta * cosRel, 0.06);
        float heat = pow(inner / rho, 0.72);
        vec3 base = mix(vec3(0.55, 0.08, 0.02), vec3(1.0, 0.82, 0.48), heat);
        base *= mix(vec3(1.35, 0.62, 0.32), vec3(0.55, 0.75, 1.35), smoothstep(-0.2, 0.8, cosRel));
        float phi = atan(hit.z, hit.x);
        float turb = 0.62 + 0.38 * sin(phi * 9.0 - rho * 3.1 + uTime * 0.7);
        turb *= 0.75 + 0.25 * sin(phi * 3.0 + rho * 5.0 - uTime * 0.35);
        float edge = smoothstep(inner, inner + 0.18, rho) * smoothstep(outer, outer - 1.6, rho);
        float inten = pow(doppler, 3.0) * (0.22 + 1.15 * heat) * turb * edge;
        disk += base * inten * (1.0 - cover);
        cover = clamp(cover + inten * 0.35, 0.0, 1.0);
      }
    }
    p = p2;
    v = v2;
  }

  vec3 color = vec3(0.0);
  if (!swallowed) {
    color = stars(normalize(v));
    float photon = exp(-pow((closest - rs * 1.5) * 14.0, 2.0));
    color += vec3(1.0, 0.86, 0.55) * photon * 1.8;
    float glow = exp(-pow((closest - rs) * 3.2, 2.0)) * 0.25;
    color += vec3(1.0, 0.45, 0.15) * glow;
  }
  color += disk;
  vec2 q = gl_FragCoord.xy / uResolution - 0.5;
  color *= smoothstep(0.85, 0.2, length(q));
  color = color / (1.0 + color * 0.65);
  fragColor = vec4(pow(max(color, 0.0), vec3(0.92)), 1.0);
}
`

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function mountBlackHole(host: HTMLElement, options: BlackHoleOptions) {
  const canvas = document.createElement('canvas')
  canvas.className = 'absolute inset-0 h-full w-full touch-none'
  host.appendChild(canvas)

  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' })
  if (!gl) {
    options.onError?.()
    canvas.remove()
    return () => {}
  }

  const steps = options.mobile ? 42 : 88
  const frag = FRAG.replace('STEP_COUNT', String(steps))
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag)
  if (!vs || !fs) {
    options.onError?.()
    canvas.remove()
    return () => {}
  }
  const program = gl.createProgram()
  if (!program) {
    options.onError?.()
    return () => {}
  }
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program))
    options.onError?.()
    return () => {}
  }

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  gl.useProgram(program)

  const uResolution = gl.getUniformLocation(program, 'uResolution')
  const uAngle = gl.getUniformLocation(program, 'uAngle')
  const uPointer = gl.getUniformLocation(program, 'uPointer')
  const uZoom = gl.getUniformLocation(program, 'uZoom')
  const uTime = gl.getUniformLocation(program, 'uTime')

  const state = {
    yaw: 0.15,
    pitch: 0.58,
    zoom: 1,
    pointerX: 0,
    pointerY: 0,
    time: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    visible: true,
  }

  const resize = () => {
    const rect = host.getBoundingClientRect()
    const dpr = options.mobile ? 0.8 : Math.min(window.devicePixelRatio || 1, 1.35)
    const width = Math.max(1, Math.floor(rect.width * dpr))
    const height = Math.max(1, Math.floor(rect.height * dpr))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }
    gl.viewport(0, 0, canvas.width, canvas.height)
  }

  const draw = (now = 0) => {
    resize()
    if (!options.reduced) state.time = now * 0.001
    gl.uniform2f(uResolution, canvas.width, canvas.height)
    gl.uniform2f(uAngle, state.yaw, state.pitch)
    gl.uniform2f(uPointer, state.pointerX, -state.pointerY)
    gl.uniform1f(uZoom, state.zoom)
    gl.uniform1f(uTime, state.time)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  let frame = 0
  let stopped = false
  const loop = (now: number) => {
    if (stopped) return
    if (state.visible && !document.hidden) draw(now)
    if (!options.reduced) frame = requestAnimationFrame(loop)
  }

  const syncZoom = () => {
    const rect = host.getBoundingClientRect()
    const mid = rect.top + rect.height / 2
    const t = (window.innerHeight * 0.5 - mid) / window.innerHeight
    state.zoom = Math.min(1.45, Math.max(0.72, 1.05 - t * 0.55))
  }

  const onPointerDown = (event: PointerEvent) => {
    state.dragging = true
    state.lastX = event.clientX
    state.lastY = event.clientY
    canvas.setPointerCapture(event.pointerId)
  }
  const onPointerUp = (event: PointerEvent) => {
    state.dragging = false
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
  }
  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    state.pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1
    state.pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1
    if (!state.dragging) return
    state.yaw += (event.clientX - state.lastX) * 0.006
    state.pitch = Math.max(-1.15, Math.min(1.15, state.pitch + (event.clientY - state.lastY) * 0.005))
    state.lastX = event.clientX
    state.lastY = event.clientY
    if (options.reduced) {
      syncZoom()
      draw(state.time * 1000)
    }
  }
  const onScroll = () => {
    syncZoom()
    if (options.reduced && state.visible) draw(state.time * 1000)
  }
  const onVisibility = () => {
    if (!document.hidden && !options.reduced && state.visible) {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(loop)
    }
  }

  const io = new IntersectionObserver(([entry]) => {
    state.visible = Boolean(entry?.isIntersecting)
  })
  io.observe(host)

  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerUp)
  canvas.addEventListener('pointermove', onPointerMove)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  document.addEventListener('visibilitychange', onVisibility)

  host.dataset.ready = 'true'
  syncZoom()
  if (options.reduced) draw(0)
  else frame = requestAnimationFrame(loop)

  return () => {
    stopped = true
    cancelAnimationFrame(frame)
    io.disconnect()
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
    canvas.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    document.removeEventListener('visibilitychange', onVisibility)
    gl.deleteProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteBuffer(buffer)
    canvas.remove()
    delete host.dataset.ready
  }
}
