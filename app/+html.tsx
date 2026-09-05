import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

/**
 * Custom root HTML for Expo Router on the web.
 * Injects PWA manifest, Apple iOS standalone capabilities and viewport fits.
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
        <meta name="theme-color" content="#EDE6D3" />

        {/* Icons & Manifest */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

