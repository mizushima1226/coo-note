import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages（プロジェクトサイト）はサブパスになる。CI で VITE_BASE=/coo-note/ を渡す。
const base = process.env.VITE_BASE?.replace(/\/?$/, '/') || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
