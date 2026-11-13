import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Public address of the site, used for canonical links, social previews and the sitemap.
// On Vercel it comes from the project's production domain at build time; anywhere else,
// set SITE_URL (for example SITE_URL=https://example.com). Without either, those tags are
// left out rather than pointing at a wrong address.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL || (vercelHost ? `https://${vercelHost}` : undefined);

export default defineConfig({
  site,
  build: { format: 'directory' },
  integrations: site ? [sitemap({ filter: (page) => !/\/404\/?$/.test(page) })] : [],
});
