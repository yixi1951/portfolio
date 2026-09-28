# 杨子烽 / Yang Zifeng

Personal site. Fonts, 3D libraries, and models are bundled or served from this repository. Nothing in the portfolio shell is loaded from a CDN or from Google Fonts.

## Assets and licences

- **Black hole** — real-time Kerr ray marcher by Maksim Sterkis, [Raymarched-Black-Hole](https://github.com/maksim-sterkis/Raymarched-Black-Hole), MIT License, Copyright (c) 2026 Maksim Sterkis. The geodesic integrator, Doppler-beamed disk, lensed starfield, and cinematic post pass are in `src/space/kerrShaders.ts`. The full licence text is `src/space/KERR-LICENSE.txt`. The original page imports three.js from a CDN; this site bundles three.js and does not call that CDN. Drag orbits the camera, scroll or pinch zooms, and the disk keeps moving. `prefers-reduced-motion` freezes the clock. Phones use a coarser step count and a smaller render target.
- **Astronaut** — “Animated Floating Astronaut in Space Suit Loop” by [LasquetiSpice](https://sketchfab.com/LasquetiSpice), [Sketchfab model](https://sketchfab.com/3d-models/animated-floating-astronaut-in-space-suit-loop-e2c4b146e58141e4b87917456a9970b1), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The suit is rigged and plays the included `floating` clip. Self-hosted at `public/models/astronaut.glb` after a specular-glossiness to metallic-roughness conversion, Draco mesh compression, and KTX2 textures resized to 1024 so the file stays under 8MB. The mesh was not simplified. Lighting uses the CC0 Poly Haven HDRI [`kloofendal_48d_partly_cloudy_puresky`](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky) (1k, Greg Zaal) at `public/hdri/kloofendal_1k.hdr`, a sun key, soft shadows, and ACES. Decoders are the three.js example files, self-hosted at `public/draco/gltf/` and `public/basis/` (three.js is MIT).
- **Earth limb** — NASA Johnson image [iss064e005209](https://images.nasa.gov/details/iss064e005209) (20 November 2020), the Earth’s limb above Western Australia from Expedition 64, public domain. Compressed to `public/media/earth-limb.webp` and drawn edge to edge behind the suit, cover-cropped so the horizon is not letterboxed.
- **Instrument Serif** — italic cut, [SIL Open Font License 1.1](https://scripts.sil.org/OFL), self-hosted through `@fontsource/instrument-serif`.

Nothing in these scenes is loaded from a CDN at runtime.

The separate study page at `/math1/` is the author’s own HTML file and still loads MathJax and Plotly from their CDNs.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
