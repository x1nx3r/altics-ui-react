import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The probe imports the select bases from source: they are internal, so the
  // built package does not export them yet. `dedupe` keeps one React across
  // the app and those files, which otherwise resolve react from the repo root.
  resolve: { dedupe: ["react", "react-dom"] },
  server: { fs: { allow: [".."] } },
})
