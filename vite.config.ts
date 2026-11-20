import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Cấu hình Vite: React + alias "@/..." trỏ vào thư mục src để import gọn hơn.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2019',
    cssMinify: true,
    chunkSizeWarningLimit: 900,
  },
});
