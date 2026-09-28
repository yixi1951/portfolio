// Kerr black-hole raymarcher and cinematic post pass.
// Ported from https://github.com/maksim-sterkis/Raymarched-Black-Hole
// Copyright (c) 2026 Maksim Sterkis, MIT License.
// See src/space/KERR-LICENSE.txt.

export const KERR_VERT = `varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`

export const KERR_FRAG = `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform vec3 u_cameraPos;
        uniform vec3 u_cameraDir;
        uniform vec3 u_cameraUp;
        uniform vec3 u_cameraRight;
        uniform float u_spin;
        uniform float u_tilt;

        // New Uniforms for Gargantua-style visuals
        uniform float u_diskPuffiness;
        uniform float u_turbulence;
        uniform float u_stepScale;
        uniform float u_starSize;

        #define MAX_STEPS 1500
        #define BASE_STEP_SIZE 0.05
        #define GM 0.5

        mat3 rotZ(float angle) {
            float s = sin(angle);
            float c = cos(angle);
            return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);
        }

        float hash13(vec3 p3) {
            p3  = fract(p3 * .1031);
            p3 += dot(p3, p3.zyx + 31.32);
            return fract((p3.x + p3.y) * p3.z);
        }

        float noise(vec3 x) {
            vec3 i = floor(x);
            vec3 f = fract(x);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(mix(hash13(i + vec3(0,0,0)), hash13(i + vec3(1,0,0)), f.x),
                           mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
                       mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
                           mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z);
        }

        // 6-octave noise for rich gas striations
        float fbm_high(vec3 p) {
            float f = 0.0;
            float amp = 0.5;
            for(int i = 0; i < 6; i++) {
                f += amp * noise(p);
                p *= 2.02;
                amp *= 0.5;
            }
            return f;
        }

        // Domain warping to create turbulent magnetic shearing
        float fbm_warped(vec3 p) {
            vec3 warp = vec3(
                fbm_high(p + vec3(0.0, 0.0, 0.0)),
                fbm_high(p + vec3(5.2, 1.3, 4.1)),
                fbm_high(p + vec3(2.4, 8.1, 1.9))
            );
            return fbm_high(p + warp * u_turbulence);
        }

        vec3 getStars(vec3 rd) {
            vec3 col = vec3(0.0);
            vec3 p1 = rd * 280.0;
            vec3 ip1 = floor(p1);
            if (hash13(ip1) > 0.994) {
                vec3 fp1 = fract(p1);
                vec3 offset = vec3(hash13(ip1 + 1.1), hash13(ip1 + 2.2), hash13(ip1 + 3.3)) * 0.6 + 0.2;
                float r1 = 0.12 * u_starSize;
                col += vec3(smoothstep(r1, 0.0, length(fp1 - offset)) * (0.3 + 0.7 * hash13(ip1 + 4.4)));
            }
            vec3 p2 = rd * 110.0;
            vec3 ip2 = floor(p2);
            if (hash13(ip2) > 0.991) {
                vec3 fp2 = fract(p2);
                vec3 offset = vec3(hash13(ip2 + 5.5), hash13(ip2 + 6.6), hash13(ip2 + 7.7)) * 0.6 + 0.2;
                float r2 = 0.18 * u_starSize;
                float star = smoothstep(r2, 0.0, length(fp2 - offset));
                vec3 tint = mix(vec3(0.5, 0.8, 1.0), vec3(1.0, 0.6, 0.4), hash13(ip2 + 8.8));
                col += vec3(star * (1.5 + 4.0 * hash13(ip2 + 9.9))) * tint;
            }
            return col;
        }

        vec3 blackbody(float temp) {
            vec3 c = vec3(255.0);
            float t = clamp(temp, 1000.0, 40000.0) / 100.0;
            if (t <= 66.0) { c.r = 255.0; } else { c.r = clamp(329.698727446 * pow(t - 60.0, -0.1332047592), 0.0, 255.0); }
            if (t <= 66.0) { c.g = clamp(99.4708025861 * log(t) - 161.1195681661, 0.0, 255.0); } else { c.g = clamp(288.1221695283 * pow(t - 60.0, -0.0755148492), 0.0, 255.0); }
            if (t >= 66.0) { c.b = 255.0; } else if (t <= 19.0) { c.b = 0.0; } else { c.b = clamp(138.5177312231 * log(t - 10.0) - 305.0447927307, 0.0, 255.0); }
            return c / 255.0;
        }

        vec3 calcAcceleration(vec3 pos, vec3 vel) {
            float r2 = dot(pos, pos);
            float r = sqrt(r2);
            vec3 pos_hat = pos / r;
            vec3 h_vec = cross(pos, vel);
            float h2 = dot(h_vec, h_vec);

            vec3 a_grav = -3.0 * GM * h2 / (r2 * r2 * r + 0.00001) * pos;
            float a_param = u_spin * GM;
            vec3 J = vec3(0.0, a_param * GM, 0.0);
            vec3 Bg = (3.0 * dot(J, pos_hat) * pos_hat - J) / (r2 * r + 0.0001);
            vec3 a_drag = cross(vel, Bg) * 2.0;

            float cos_theta = pos.y / (r + 0.0001);
            float r_ergo = GM + sqrt(max(0.0, GM*GM - a_param*a_param * cos_theta*cos_theta));
            float r_plus = GM + sqrt(max(0.0, GM*GM - a_param*a_param));

            if (r < r_ergo) {
                float drag_boost = 1.0 + 2.0 * smoothstep(r_ergo, r_plus, r);
                a_drag *= drag_boost;
            } else {
                a_drag *= 1.8;
            }

            return a_grav + a_drag;
        }

        void main() {
            vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

            vec3 ro = u_cameraPos;
            vec3 cw = normalize(u_cameraDir);
            vec3 cu = normalize(u_cameraRight);
            vec3 cv = normalize(u_cameraUp);
            vec3 rd = normalize(uv.x * cu + uv.y * cv + 1.2 * cw);

            mat3 tiltMat = rotZ(u_tilt);
            ro = tiltMat * ro;
            rd = tiltMat * rd;
            vec3 p = ro;

            float dither = hash13(vec3(gl_FragCoord.xy, u_time));
            p += rd * dither * BASE_STEP_SIZE;

            vec3 col = vec3(0.0);
            float transmittance = 1.0;
            bool hitBlackHole = false;

            float a_star = u_spin;
            float a_param = u_spin * GM;
            float r_plus = GM + sqrt(max(0.0, GM*GM - a_param*a_param));
            float z1 = 1.0 + pow(max(0.0, 1.0 - a_star*a_star), 1.0/3.0) * (pow(1.0 + a_star, 1.0/3.0) + pow(max(0.0, 1.0 - a_star), 1.0/3.0));
            float z2 = sqrt(3.0 * a_star*a_star + z1*z1);
            float r_isco = GM * (3.0 + z2 - sqrt(max(0.0, (3.0 - z1)*(3.0 + z1 + 2.0*z2))));

            for(int i = 0; i < MAX_STEPS; i++) {
                if (i == MAX_STEPS - 1) { hitBlackHole = true; break; }
                float r = length(p);

                if (r < r_plus) { hitBlackHole = true; break; }
                if (r > 100.0) break;

                // Volumetrically Thick Disk Profile (Puffed up near ISCO)
                float profileThickness = 0.1 + u_diskPuffiness * 0.4 * exp(-pow(r - r_isco - 1.0, 2.0) * 0.5);
                bool inDisk = abs(p.y) < profileThickness && r > r_plus && r < 25.0;
                float currentStep;

                if (inDisk) {
                    currentStep = 0.02 * u_stepScale;
                } else {
                    // Refined Lensing Stepping: Finer steps in the photon sphere (r = ~1.5 to 3.0)
                    float distToPhotonSphere = abs(r - 2.0);
                    float stepFactor = clamp(distToPhotonSphere * 0.5, 0.05, 5.0);
                    currentStep = BASE_STEP_SIZE * stepFactor * u_stepScale;

                    if (p.y * rd.y < 0.0) {
                        float distToDisk = abs(p.y) - profileThickness;
                        if (distToDisk > 0.0) currentStep = min(currentStep, max(0.01 * u_stepScale, distToDisk * 0.8));
                    }
                }

                if (inDisk) {
                    float verticalFade = smoothstep(profileThickness, 0.0, abs(p.y));
                    float radialFade = pow(3.0 / r, 1.0) * smoothstep(25.0, 15.0, r);
                    float fadeProduct = verticalFade * radialFade;

                    if (fadeProduct > 0.001) {
                        float timeDilation = max(0.001, 1.0 - (2.0*GM) / r);
                        float twistAngle = -u_time * (3.0 / r) * timeDilation;
                        mat2 twistRot = mat2(cos(twistAngle), -sin(twistAngle), sin(twistAngle), cos(twistAngle));
                        vec2 swirledXZ = twistRot * p.xz;
                        vec3 pRot = vec3(swirledXZ.x, p.y * 3.0, swirledXZ.y);

                        // Domain-warped turbulent noise for the gas
                        float n = pow(fbm_warped(pRot * 2.0), 2.5);
                        float density = n * fadeProduct * 12.0;

                        if (r < r_isco) density *= smoothstep(r_plus, r_isco, r) * 0.15;

                        if (density > 0.0) {
                            vec3 velocityDir = normalize(vec3(p.z, 0.0, -p.x));
                            float v_mag = min(sqrt(GM / r) / (1.0 + a_star * pow(GM / r, 1.5)), 0.999);
                            float v_proj = dot(rd, velocityDir) * v_mag;
                            float invGamma = sqrt(1.0 - v_mag * v_mag);
                            float dopplerShift = invGamma / (1.0 + v_proj);
                            float gravRedshift = sqrt(max(0.05, 1.0 - r_plus / r));

                            float D = dopplerShift * gravRedshift;
                            float beaming = pow(D, 3.0);
                            float alpha = 1.0 - exp(-density * currentStep * 2.0);

                            float baseTemp = 6500.0 * pow(3.0 / max(r, 1.0), 1.5);
                            vec3 gasCol = blackbody(baseTemp * D);
                            vec3 emission = gasCol * density * beaming * 1.5;

                            col += transmittance * emission * currentStep;
                            transmittance *= (1.0 - alpha);
                        }
                    }
                }

                float dt = currentStep;
                if (r > 25.0) {
                    p += rd * dt;
                } else {
                    vec3 k1_p = rd;
                    vec3 k1_v = calcAcceleration(p, rd);
                    vec3 k2_p = rd + 0.5 * dt * k1_v;
                    vec3 k2_v = calcAcceleration(p + 0.5 * dt * k1_p, k2_p);
                    vec3 k3_p = rd + 0.5 * dt * k2_v;
                    vec3 k3_v = calcAcceleration(p + 0.5 * dt * k2_p, k3_p);
                    vec3 k4_p = rd + dt * k3_v;
                    vec3 k4_v = calcAcceleration(p + dt * k3_p, k4_p);

                    p += (dt / 6.0) * (k1_p + 2.0 * k2_p + 2.0 * k3_p + k4_p);
                    rd += (dt / 6.0) * (k1_v + 2.0 * k2_v + 2.0 * k3_v + k4_v);
                    rd = normalize(rd);
                }

                if (i > MAX_STEPS - 40) transmittance *= 0.75;
                if (transmittance < 0.01) break;
            }

            if (!hitBlackHole) {
                mat3 invTilt = rotZ(-u_tilt);
                vec3 bgCol = getStars(invTilt * rd);
                float bg_redshift = sqrt(max(0.0001, 1.0 - (2.0*GM) / length(u_cameraPos)));
                col += transmittance * bgCol * bg_redshift;
            }

            // NOTE: Removed ACES and Gamma. Outputting RAW HDR data to the Render Target!
            gl_FragColor = vec4(col, 1.0);
        }
    `

export const KERR_POST_FRAG = `
        uniform sampler2D tDiffuse;
        uniform vec2 u_resolution;
        uniform float u_bloomThreshold;
        uniform float u_bloomStrength;
        uniform float u_flareStrength;
        uniform float u_aberration;
        uniform float u_master;

        varying vec2 vUv;

        // ACES Tonemapping
        vec3 ACESFilm(vec3 x) {
            float a = 2.51;
            float b = 0.03;
            float c = 2.43;
            float d = 0.59;
            float e = 0.14;
            return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
        }

        // Extracts only the blindingly bright pixels
        vec3 getBright(vec3 c, float thresh) {
            float lum = dot(c, vec3(0.299, 0.587, 0.114));
            return c * smoothstep(thresh, thresh + 0.5, lum);
        }

        void main() {
            vec2 uv = vUv;
            vec2 texel = 1.0 / u_resolution;

            // --- 1. Camera Defects: Screen Centricity & Chromatic Aberration ---
            vec2 centerDist = uv - 0.5;
            float distSq = dot(centerDist, centerDist);

            // Calculate RGB offsets based on screen distance and slider strength
            float abStrength = u_aberration * u_master * 0.008 * distSq; // Tightened significantly to prevent "square" detachment
            vec2 offsetR = centerDist * abStrength;
            vec2 offsetB = -centerDist * abStrength;

            // Sample base image with color fringing
            vec3 baseCol;
            baseCol.r = texture2D(tDiffuse, uv + offsetR).r;
            baseCol.g = texture2D(tDiffuse, uv).g;
            baseCol.b = texture2D(tDiffuse, uv + offsetB).b;

            // --- 2. Extracting and Blurring the Brightness (Bloom) ---
            vec3 bloom = vec3(0.0);
            float weightSum = 0.0;

            // Smooth Golden Ratio Spiral Blur (Eliminates dotted artifacts)
            float goldenAngle = 2.39996323;
            float radiusScale = 5.0;

            for(int i = 1; i <= 32; i++) {
                float r = sqrt(float(i)) * texel.y * radiusScale;
                float theta = float(i) * goldenAngle;
                vec2 offset = vec2(cos(theta), sin(theta)) * r;
                // Keep the blur perfectly circular regardless of screen stretch
                offset.x *= u_resolution.y / u_resolution.x;

                vec3 sampleCol = texture2D(tDiffuse, uv + offset).rgb;
                float weight = exp(-float(i) * 0.08); // Gaussian-like falloff
                bloom += getBright(sampleCol, u_bloomThreshold) * weight;
                weightSum += weight;
            }
            bloom /= max(weightSum, 0.001);

            // --- 3. Stretching the Light (Anamorphic Lens Flare) ---
            vec3 flare = vec3(0.0);
            float flareWeightSum = 0.0;
            float flareSpread = 2.5;

            // Dense, continuous horizontal sweep to eliminate dashed-line artifacts
            for(int x = -25; x <= 25; x++) {
                vec2 offset = vec2(float(x) * texel.x * flareSpread, 0.0);
                vec3 sampleCol = texture2D(tDiffuse, uv + offset).rgb;
                float weight = exp(-abs(float(x)) * 0.1);
                flare += getBright(sampleCol, u_bloomThreshold) * weight;
                flareWeightSum += weight;
            }
            flare /= max(flareWeightSum, 0.001);
            flare *= vec3(0.2, 0.5, 1.0); // Sci-fi cyan/blue tint

            // --- Composite the Layers ---
            vec3 finalCol = baseCol + (bloom * u_bloomStrength + flare * u_flareStrength) * u_master;

            // --- 4. Apply Vignette Mask ---
            float vignette = 1.0 - distSq * 1.5 * u_master;
            finalCol *= clamp(vignette, 0.0, 1.0);

            // --- Final Tone Mapping (Compress HDR down to Screen SDR) ---
            finalCol = ACESFilm(finalCol);
            finalCol = pow(finalCol, vec3(1.0 / 2.2));

            gl_FragColor = vec4(finalCol, 1.0);
        }
    `
