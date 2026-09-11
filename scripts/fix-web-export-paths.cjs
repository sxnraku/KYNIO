const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replaceInDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = content
        .replaceAll('href="/favicon.png"', 'href="/KYNIO/app/favicon.png"')
        .replaceAll('href="/apple-touch-icon.png"', 'href="/KYNIO/app/apple-touch-icon.png"')
        .replaceAll('href="/manifest.json"', 'href="/KYNIO/app/manifest.json"')
        // Preencher o título vazio gerado pelo Expo
        .replace(/<title data-rh="true"><\/title>/, '<title data-rh="true">KYNIO · Jejum &amp; Nutrição</title>');
      if (!updated.includes('http-equiv="Cache-Control"')) {
        updated = updated.replace(
          '<head>',
          '<head><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" /><meta http-equiv="Pragma" content="no-cache" /><meta http-equiv="Expires" content="0" />'
        );
      }
      if (!updated.includes('window.__kynioDeferredPrompt')) {
        updated = updated.replace(
          '</head>',
          '<script>window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__kynioDeferredPrompt=e;});</script></head>'
        );
      }
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf8');
        console.log('Updated:', entry.name);
      }
    }
  }
}

const appDir = path.join(__dirname, '..', 'legal-site', 'app');
replaceInDir(appDir);

// Copiar splash-icon para a pasta do export web
const splashIconSrc = path.join(__dirname, '..', 'assets', 'images', 'splash-icon.png');
if (fs.existsSync(splashIconSrc)) {
  fs.copyFileSync(splashIconSrc, path.join(appDir, 'splash-icon.png'));
}

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

// Always regenerate sw.js with fresh build timestamp to invalidate old PWA caches
const swPath = path.join(appDir, 'sw.js');
const buildTimestamp = Date.now();
const swContent = `// KYNIO PWA Service Worker (Build ${buildTimestamp})
const CACHE_NAME = 'kynio-pwa-${buildTimestamp}';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // HTML or navigation requests: always network-first to guarantee latest app version
  if (req.mode === 'navigate' || req.destination === 'document' || req.url.endsWith('.html')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Other assets: Network first, cache fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
`;
fs.writeFileSync(swPath, swContent, 'utf8');

// Ensure standby.html exists for automatic multi-tab OPFS lock yielding
const standbyPath = path.join(appDir, 'standby.html');
const standbyContent = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>KYNIO</title>
  <style>
    :root {
      --bg: #EDE6D3;
      --text: #3A3A38;
      --accent: #D9922E;
      --border: #D8D1BE;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #1C1915;
        --text: #F1E9D6;
        --accent: #E8A83E;
        --border: #2E2922;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }
    .card {
      max-width: 360px;
      width: 100%;
      padding: 32px 24px;
      border: 1px solid var(--border);
      border-radius: 24px;
      background-color: var(--bg);
    }
    .icon {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      color: var(--accent);
    }
    h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    p {
      font-size: 13px;
      opacity: 0.75;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    button {
      background-color: var(--accent);
      color: #1C1915;
      font-weight: 700;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      width: 100%;
    }
  </style>
</head>
<body>
  <div class="card">
    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
    </svg>
    <h1>KYNIO EM ESPERA</h1>
    <p>A sessão ativa foi transferida para a aplicação principal. Clica abaixo ou volta ao separador para continuar.</p>
    <button onclick="resume()">Continuar no KYNIO</button>
  </div>

  <script>
    function resume() {
      window.location.replace('/KYNIO/app/');
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        resume();
      }
    });
    window.addEventListener('focus', resume);
    window.addEventListener('pageshow', resume);
  </script>
</body>
</html>
`;
fs.writeFileSync(standbyPath, standbyContent, 'utf8');

console.log('Path prefixing, manifest and standby setup complete.');


