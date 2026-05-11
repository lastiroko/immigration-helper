import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// Bundle analyzer: writes dist/stats.html on every build with a
// treemap of what's in the bundle. Open it locally; not part of any
// runtime path. Set ANALYZE_BUNDLE=true to also auto-open the report.
const analyze = process.env.ANALYZE_BUNDLE === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      open: analyze,
    }),
  ],
})
