# 杨子烽 / Yang Zifeng

Personal site. Fonts, 3D libraries, and models are bundled or served from this repository. Nothing in the portfolio shell is loaded from a CDN or from Google Fonts.

## Assets and licences

- **Solar system** — original Three.js scene in `src/space/cosmos.ts`. Scroll eases the camera from a sunlit Earth out across the inner planets. Drag orbits that view, and a click or tap flies to a planet. `prefers-reduced-motion` freezes orbits and spin and skips the section slide. Phones use a lower pixel ratio and no drag-orbit so the page can still scroll. three.js is bundled (MIT); nothing in this scene is loaded from a CDN.
- **Planet photographs and Milky Way** — [Solar System Scope](https://www.solarsystemscope.com/textures/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): Sun, Mercury, Venus, Earth day / night / clouds / specular, Mars, Jupiter, Saturn, Saturn’s rings, and `stars_milky_way`. The Earth day, night, cloud, and specular maps and the Milky Way are the 2k sources, recompressed to WebP under `public/textures/`.
- **Moon** — NASA / GSFC / Arizona State University, Lunar Reconnaissance Orbiter Wide Angle Camera color map, Scientific Visualization Studio [4720](https://svs.gsfc.nasa.gov/4720), public domain. Compressed to `public/textures/moon.webp`.
- **CodePen** — public pens are MIT by default ([CodePen licensing](https://blog.codepen.io/docs/pens/licensing/)). This scene does not copy a pen. Space Time and the 3dsolarsystem.online viewer are not open source, so their rendering code is not included; the page only follows that visual language (sunlit textured planets, a faint star band, glass panels over the view, scroll and click to move the camera).
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
