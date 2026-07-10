import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * GitHub Pages serves this repo's root directory verbatim, so the built site
 * has to land there rather than in `dist/`. That forces the entry template out
 * of the root — otherwise the build would overwrite its own input — so it lives
 * at `src/index.html` and `root` points at `src/`.
 *
 * `emptyOutDir: false` is mandatory: the out dir IS the repo, and emptying it
 * would delete the source tree. `npm run build` removes only `assets/` first,
 * so stale hashed bundles don't accumulate across deploys.
 *
 * Dev + preview server both run on localhost:6969 as requested.
 */
export default defineConfig({
  root: 'src',
  // `envDir` defaults to `root`. Without this Vite looks for `src/.env`, the
  // VITE_SUPABASE_* vars resolve to undefined, and createClient() throws on
  // import — a blank page that builds and deploys perfectly cleanly.
  envDir: '..',
  publicDir: '../public',
  plugins: [react()],
  build: {
    outDir: '..',
    emptyOutDir: false,
  },
  server: {
    port: 6969,
    host: true,
    open: false,
  },
  preview: {
    port: 6969,
  },
})
