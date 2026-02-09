// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://hungsoft.pages.dev', // Default placeholder for absolute URLs
  vite: {
    plugins: [tailwindcss()]
  }
});
