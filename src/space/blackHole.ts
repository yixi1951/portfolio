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

// Geometric units with M = 1: horizon at r = 2, photon sphere at r = 3.
// The camera sits on a ray through the origin, so the centre pixel is the shadow.
const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec2 uResolution;
uniform vec2 uAngle;
uniform vec2 uPointer;
uniform float uZoom;
uniform float uTime;

const float CAM = 23.0;
const float DISK_IN = 3.55;
const float DISK_OUT = 12.5;
const float HORIZON = 2.02;
const float PHOTON = 3.0;

vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 stars(vec3 dir) {
  vec3 color = vec3(0.012, 0.014, 0.024);
  float phi = atan(dir.z, dir.x);
  float y = dir.y;
  for (int layer = 0; layer < 2; layer++) {
    float scale = layer == 0 ? 34.0 : 72.0;
    vec2 uv = vec2(phi, y) * scale;
    vec2 id = floor(uv);
    vec2 f = fract(uv) - 0.5;
    float gate = layer == 0 ? 0.93 : 0.975;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 cell = id + vec2(float(i), float(j));
        float n = hash12(cell + float(layer) * 19.7);
        if (n < gate) continue;
        vec2 jitter = vec2(hash12(cell + 3.1), hash12(cell + 8.2)) - 0.5;
        float dist = length(f - vec2(float(i), float(j)) - jitter);
        float rad = mix(0.035, 0.09, hash12(cell + 1.4));
        float star = smoothstep(rad, rad * 0.15, dist);
        float tw = 0.72 + 0.28 * sin(uTime * (0.55 + n) + n * 28.0);
        vec3 tint = mix(vec3(0.78, 0.86, 1.0), vec3(1.0, 0.94, 0.8), hash12(cell + 5.5));
        color += tint * star * tw * (layer == 0 ? 1.45 : 0.95);
      }
    }
  }
  return color;
}

vec3 diskHue(float rho, float approach) {
  float u = clamp((rho - DISK_IN) / (DISK_OUT - DISK_IN), 0.0, 1.0);
  vec3 col = mix(vec3(1.0, 0.97, 0.9), vec3(1.0, 0.72, 0.08), smoothstep(0.0, 0.32, u));
  col = mix(col, vec3(1.0, 0.32, 0.02), smoothstep(0.28, 0.92, u));
  float hot = clamp(0.5 + 0.55 * approach, 0.0, 1.0);
  col = mix(col, vec3(1.0, 0.97, 0.92), hot * 0.7);
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  uv += uPointer * 0.012;
  uv.y += 0.035;

  float elev = clamp(0.18 + uAngle.y, 0.05, 1.05);
  float yaw = uAngle.x;
  vec3 ro = vec3(0.0, sin(elev), cos(elev)) * CAM;
  ro = rotY(ro, yaw);
  vec3 forward = normalize(-ro);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = normalize(cross(right, forward));
  vec3 rd = normalize(forward * 1.32 + (right * uv.x + up * uv.y) * uZoom);

  vec3 p = ro;
  vec3 v = rd;
  vec3 disk = vec3(0.0);
  bool trapped = false;
  float closest = 80.0;
  int hits = 0;

  const int STEPS = STEP_COUNT;
  for (int i = 0; i < STEPS; i++) {
    float r = length(p);
    closest = min(closest, r);
    if (r < HORIZON) {
      trapped = true;
      break;
    }
    if (i > 8 && dot(v, p) > 0.0 && r > CAM * 1.45) break;

    float h2 = dot(cross(p, v), cross(p, v));
    vec3 acc = -1.5 * h2 * p / pow(r, 5.0);
    float accel = length(acc);
    float dt = 0.24;
    if (accel > 1e-4) dt = min(dt, 0.2 / accel);
    dt = clamp(dt, 0.01, 0.34);

    v = normalize(v + acc * dt);
    vec3 next = p + v * dt;

    if (hits < 2 && p.y * next.y < 0.0) {
      float t = clamp(p.y / (p.y - next.y), 0.0, 1.0);
      vec3 hit = mix(p, next, t);
      float rho = length(hit.xz);
      if (rho > DISK_IN && rho < DISK_OUT) {
        hits += 1;
        vec3 tangent = vec3(-hit.z, 0.0, hit.x) / rho;
        float approach = clamp(-dot(v, tangent), -1.0, 1.0);
        float beta = clamp(0.72 * sqrt(DISK_IN / rho), 0.0, 0.78);
        float doppler = pow(clamp(1.0 + 0.38 * beta * approach, 0.78, 1.55), 1.7);
        float radial = pow(DISK_IN / rho, 1.55);
        float edge = smoothstep(DISK_IN, DISK_IN + 0.12, rho) * smoothstep(DISK_OUT, DISK_OUT - 3.6, rho);
        float phi = atan(hit.z, hit.x);
        float grain = 0.92 + 0.08 * sin(phi * 2.0 + rho * 0.18 - uTime * 0.12);
        float weight = hits == 1 ? 1.0 : 0.8;
        float inten = radial * doppler * edge * grain * weight * 5.4;
        disk += diskHue(rho, approach) * inten;
      }
    }
    p = next;
  }

  vec3 color = vec3(0.0);
  if (!trapped) {
    color = stars(normalize(v)) * smoothstep(2.4, 3.5, closest);
    float ring = exp(-pow((closest - PHOTON) / 0.02, 2.0));
    color += vec3(1.45, 1.38, 1.22) * ring * 4.0;
  }
  color += disk;

  float vig = smoothstep(1.35, 0.55, length(uv));
  color *= mix(0.92, 1.0, vig);
  color = 1.0 - exp(-color * 1.08);
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

  const steps = options.mobile ? 72 : 150
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
    yaw: 0,
    pitch: 0,
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
    const dpr = options.mobile ? 0.85 : Math.min(window.devicePixelRatio || 1, 1.5)
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
    state.zoom = Math.min(1.12, Math.max(0.88, 1 - t * 0.18))
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
    state.yaw += (event.clientX - state.lastX) * 0.005
    state.pitch = Math.max(-0.85, Math.min(0.85, state.pitch + (event.clientY - state.lastY) * 0.004))
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
