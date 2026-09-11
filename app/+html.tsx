import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

import { SPLASH_ICON_BASE64 } from "../constants/splash-base64";

/**
 * Custom root HTML for Expo Router on the web.
 * Injects PWA manifest, Apple iOS standalone capabilities, viewport fits,
 * and the native-matching Circadiano splash screen (matching Android app.json: 76px centered logo on #EDE6D3).
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA & Apple iOS Standalone */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="KYNIO" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#EDE6D3" id="kynio-meta-theme-color" />

        {/* Icons & Manifest */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <ScrollViewStyleReset />

        {/* Early Theme Detector for instantaneous splash & background color */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var raw = localStorage.getItem('kynio-app-preferences-v1');
    if (raw) {
      var p = JSON.parse(raw);
      var m = p && p.state && p.state.themeMode;
      if (m === 'dark' || m === 'amoled' || m === 'midnight') {
        document.documentElement.setAttribute('data-theme', 'dark');
        var meta = document.getElementById('kynio-meta-theme-color');
        if (meta) meta.setAttribute('content', '#1C1915');
      } else if (m === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  } catch(e) {}
})();`,
          }}
        />

        {/* Native Circadiano Splash Screen CSS matching Android app.json (76px centered logo on #EDE6D3) */}
        <style
          id="kynio-splash-screen-style"
          dangerouslySetInnerHTML={{
            __html: `
  #kynio-splash-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    background-color: #EDE6D3;
    z-index: 9999999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    pointer-events: auto;
    transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), visibility 280ms;
    visibility: visible;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) #kynio-splash-screen {
      background-color: #1C1915;
    }
  }
  :root[data-theme="dark"] #kynio-splash-screen {
    background-color: #1C1915;
  }
  #kynio-splash-screen.kynio-splash-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
  #kynio-splash-screen img {
    width: 76px;
    height: 76px;
    max-width: 76px;
    max-height: 76px;
    object-fit: contain;
    user-select: none;
    -webkit-user-select: none;
  }
`,
          }}
        />

        {/* Safety timeout fallback in case JS fails or is blocked */}
        <script
          dangerouslySetInnerHTML={{
            __html: `setTimeout(function(){
  var s = document.getElementById('kynio-splash-screen');
  if (s && !s.classList.contains('kynio-splash-hidden')) {
    s.classList.add('kynio-splash-hidden');
    setTimeout(function(){ s.remove(); }, 350);
  }
}, 4500);`,
          }}
        />
      </head>
      <body>
        <div id="kynio-splash-screen" aria-hidden="true">
          <img
            src={SPLASH_ICON_BASE64}
            width={76}
            height={76}
            alt="KYNIO"
          />
        </div>
        {children}
      </body>
    </html>
  );
}


