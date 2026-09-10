import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/V1Portfolio/',
  plugins: [react()],
})
