import { Platform } from 'react-native';

const CHANNEL_NAME = 'kynio_tab_coordination';
const STANDBY_URL = '/KYNIO/app/standby.html';

interface CoordinationMessage {
  isStandalone: boolean;
  senderId: string;
  timestamp: number;
  type: 'CLAIM_DB' | 'FORCE_YIELD' | 'DB_ACTIVE';
}

let channel: BroadcastChannel | null = null;
const tabId = typeof window !== 'undefined' ? Math.random().toString(36).slice(2, 10) : 'srv';
let isYielded = false;
let backgroundTimer: ReturnType<typeof setTimeout> | null = null;

export function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getChannel(): BroadcastChannel | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function yieldTabToStandby(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || isYielded) return;
  // Never yield the standalone PWA unless explicitly forced
  if (isStandaloneMode()) return;

  isYielded = true;
  try {
    window.location.replace(STANDBY_URL);
  } catch {
    // Ignore navigation errors
  }
}

export function setupTabCoordination(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  const ch = getChannel();
  if (!ch) return;

  const standalone = isStandaloneMode();

  ch.onmessage = (event: MessageEvent<CoordinationMessage>) => {
    const data = event.data;
    if (!data || data.senderId === tabId) return;

    if (data.type === 'FORCE_YIELD') {
      // If another instance (especially standalone) demands exclusive access, yield if hidden or if we're just a browser tab
      if (document.visibilityState === 'hidden' || (!standalone && data.isStandalone)) {
        yieldTabToStandby();
      }
    } else if (data.type === 'CLAIM_DB') {
      // If we are hidden in the background, yield immediately so the foreground app can use OPFS
      if (document.visibilityState === 'hidden') {
        yieldTabToStandby();
      } else if (!standalone && data.isStandalone) {
        // If a standalone PWA was opened by the user, browser tab yields
        yieldTabToStandby();
      }
    }
  };

  // If a regular browser tab is placed in the background, schedule a yield after 2s
  // so it doesn't hold OPFS locks while the user is using other apps or the PWA
  if (!standalone) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        backgroundTimer = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            yieldTabToStandby();
          }
        }, 2000);
      } else {
        if (backgroundTimer) {
          clearTimeout(backgroundTimer);
          backgroundTimer = null;
        }
      }
    });
  }
}

export async function claimDatabaseLock(): Promise<void> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  const ch = getChannel();
  if (!ch) return;

  const standalone = isStandaloneMode();

  ch.postMessage({
    isStandalone: standalone,
    senderId: tabId,
    timestamp: Date.now(),
    type: 'CLAIM_DB',
  });

  // Give background tabs 250ms to yield OPFS handles
  await new Promise<void>((resolve) => setTimeout(resolve, 250));
}

export async function forceClaimDatabaseLock(): Promise<void> {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;

  const ch = getChannel();
  if (!ch) return;

  const standalone = isStandaloneMode();

  ch.postMessage({
    isStandalone: standalone,
    senderId: tabId,
    timestamp: Date.now(),
    type: 'FORCE_YIELD',
  });

  await new Promise<void>((resolve) => setTimeout(resolve, 350));
}
