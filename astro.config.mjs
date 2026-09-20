// @ts-check
import { defineConfig } from 'astro/config';

import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const siteUrl = env.SITE_URL || process.env.SITE_URL || 'https://www.liiot.app';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  integrations: [sitemap()],
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