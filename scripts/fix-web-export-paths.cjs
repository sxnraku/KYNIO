const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const updated = content
        .replaceAll('href="/favicon.png"', 'href="/KYNIO/app/favicon.png"')
        .replaceAll('href="/apple-touch-icon.png"', 'href="/KYNIO/app/apple-touch-icon.png"')
        .replaceAll('href="/manifest.json"', 'href="/KYNIO/app/manifest.json"');
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log('Updated:', entry.name);
      }
    }
  }
}

const appDir = path.join(__dirname, '..', 'legal-site', 'app');
replaceInDir(appDir);

// Ensure manifest.json has required fields for Android WebAPK installability
const manifestPath = path.join(appDir, 'manifest.json');
const manifestData = {
  name: 'KYNIO · Jejum & Nutrição',
  short_name: 'KYNIO',
  description: 'Acompanhamento circadiano de jejum intermitente com fases metabólicas e nutrição por foto. 100% privado.',
  id: '/KYNIO/app/',
  start_url: '/KYNIO/app/',
  scope: '/KYNIO/app/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#EDE6D3',
  theme_color: '#EDE6D3',
  lang: 'pt',
  dir: 'ltr',
  categories: ['health', 'fitness', 'lifestyle'],
  icons: [
    {
      src: '/KYNIO/app/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/KYNIO/app/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/KYNIO/app/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/KYNIO/app/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
};
fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');

// Ensure sw.js exists
const swPath = path.join(appDir, 'sw.js');
if (!fs.existsSync(swPath)) {
  const swContent = `// KYNIO PWA Service Worker
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));
`;
  fs.writeFileSync(swPath, swContent, 'utf8');
}

console.log('Path prefixing and manifest setup complete.');

