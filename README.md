# 杨子烽 / Yang Zifeng

Personal site. Fonts, 3D libraries, and models are bundled or served from this repository. Nothing in the portfolio shell is loaded from a CDN or from Google Fonts.

## Assets and licences

- **Astronaut model** — [NASA 3D Resources: Astronaut](https://science.nasa.gov/3d-resources/astronaut/) (`public/models/astronaut.glb`, 746 KB glTF with Draco mesh compression and WebP textures). NASA 3D Resources states these files are free to download and use, and without copyright. The catalog credits DigitalSpace Corporation. Self-hosted; the page does not request it from nasa.gov at runtime.
- **Earth limb photograph** — NASA image `iss040e090540`, Expedition 40 ([images.nasa.gov](https://images.nasa.gov/details/iss040e090540)), public domain. Compressed to `public/models/earth-limb.webp` and served from this site.
- **Draco decoder** — bundled from Three.js into the site’s own build, so the compressed mesh decodes without a third-party CDN. Draco is Apache-2.0; Three.js is MIT.
- **Instrument Serif** — italic cut, [SIL Open Font License 1.1](https://scripts.sil.org/OFL), self-hosted through `@fontsource/instrument-serif`.
- **Black hole** — original WebGL shader in `src/space/blackHole.ts` (accretion disk, Doppler beaming, gravitational lensing). No external texture.

On phones and when `prefers-reduced-motion` is set, the spacewalk uses a still poster (`public/models/astronaut-poster.webp`) with drag-to-yaw instead of the WebGL model. The black hole still runs, with fewer ray steps and no continuous disk animation when motion is reduced.

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
