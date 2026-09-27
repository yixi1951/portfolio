import type { Connect } from 'vite'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Keep `/math1` on the static study page instead of the SPA fallback. */
function math1Static(): Plugin {
  const redirect: Connect.NextHandleFunction = (req, res, next) => {
    const path = req.url?.split('?')[0]
    if (path === '/math1') {
      res.statusCode = 302
      res.setHeader('Location', '/math1/')
      res.end()
      return
    }
    next()
  }
  return {
    name: 'math1-static',
    configureServer(server) {
      server.middlewares.use(redirect)
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirect)
    },
  }
}

export default defineConfig({
  plugins: [react(), math1Static()],
})
