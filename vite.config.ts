import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const has = (name: string): boolean => existsSync(fileURLToPath(new URL(`./public/shots/${name}`, import.meta.url)));

/**
 * Fills the absolute URL that Open Graph tags need. Set SITE_URL (for example
 * https://anupamgt.github.io/road-from-himachal/) when building; without it the tags are dropped
 * instead of shipping a broken placeholder.
 */
const siteUrl = (): Plugin => ({
  name: 'site-url',
  transformIndexHtml(html) {
    const raw = process.env.SITE_URL?.trim();
    if (!raw) {
      return html
        .split('\n')
        .filter((line) => !line.includes('__SITE_URL__'))
        .join('\n');
    }
    const url = raw.endsWith('/') ? raw : `${raw}/`;
    return html.split('__SITE_URL__').join(url);
  },
});

// Relative base so the build works from any GitHub Pages path
// (user.github.io/road-from-himachal/ or a custom domain).
export default defineConfig({
  base: './',
  plugins: [siteUrl()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
  },
  define: {
    // Optional product pictures: the scenes draw their own versions when a file is missing.
    __SHOTS__: JSON.stringify({ minearchive: has('minearchive.png'), sitewatch: has('sitewatch.png') }),
  },
});
