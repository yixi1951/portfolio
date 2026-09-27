# 杨子烽 / Yang Zifeng

Personal site. Fonts, 3D libraries, and models are bundled or served from this repository. Nothing in the portfolio shell is loaded from a CDN or from Google Fonts.

## Assets and licences

- **Black hole** — NASA Goddard Space Flight Center / Jeremy Schnittman, Scientific Visualization Studio [ID 13326](https://svs.gsfc.nasa.gov/13326), “NASA Visualization Shows a Black Hole’s Warped World” (2019), public domain. Self-hosted loop: `public/media/black-hole.webm`, from `BH_AccretionDisk_Sim_Banner_Stationary.webm` with the audio track removed. That banner cut is the wide stationary view of the same simulation; the 16:9 stationary master has a hard black seam between the front disk and the lower arc, and this file does not. Still frame for phones, reduced motion, and while the clip is paused: `public/media/black-hole-still.webp`. Article: [nasa.gov](https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/).
- **Spacewalk** — Bruce McCandless II on the Manned Maneuvering Unit during STS-41-B, February 1984. NASA Johnson Space Center photograph [S84-27017](https://images.nasa.gov/details/s84-27017) (7 February 1984; also catalogued as GPN-2000-001156), public domain. The suit is cut out to `public/media/mccandless.webp` and layered, without stretching, over the Earth photograph.
- **Earth limb** — NASA Johnson image [iss064e005209](https://images.nasa.gov/details/iss064e005209) (20 November 2020), the Earth’s limb above Western Australia from Expedition 64, public domain. Compressed to `public/media/earth-limb.webp` and cover-cropped so the horizon is not stretched.
- **Instrument Serif** — italic cut, [SIL Open Font License 1.1](https://scripts.sil.org/OFL), self-hosted through `@fontsource/instrument-serif`.

On phones and when `prefers-reduced-motion` is set, both scenes hold a still photograph: the black-hole frame above, and the same astronaut and Earth layers without drift. Nothing in these scenes is loaded from a CDN at runtime.

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
