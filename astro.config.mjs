// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        usePolling: true,
        interval: 100, // Prueba con 100ms para mayor velocidad
        binaryInterval: 300,
      },
      hmr: {
        clientPort: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : undefined,
      }
    },
  },
  server: {
    host: true,
    port: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : undefined,
    allowedHosts: true,
  }
});