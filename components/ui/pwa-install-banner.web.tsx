import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { getColorPalette } from "@/constants/colors";

const STORAGE_KEY = "kynio_pwa_prompt_dismissed";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __kynioDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(key);
    }
  } catch {
    // Ignored
  }
  return null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignored
  }
}

export function PwaInstallBanner() {
  const language = useAppPreferencesStore((state) => state.language);
  const themeMode = useAppPreferencesStore((state) => state.themeMode);
  const colors = getColorPalette(themeMode);

  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    // Check if running in standalone mode (already installed)
    const isStandalone =
      ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone)) ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) {
      return;
    }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isDismissed = getStorageItem(STORAGE_KEY) === "true";

    // If there's an existing prompt captured on window
    if (window.__kynioDeferredPrompt) {
      setDeferredPrompt(window.__kynioDeferredPrompt);
    }

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      const pEvent = e as BeforeInstallPromptEvent;
      window.__kynioDeferredPrompt = pEvent;
      setDeferredPrompt(pEvent);
      setIsVisible(true);
    };

    if (typeof window.addEventListener === "function") {
      window.addEventListener("beforeinstallprompt", handlePrompt);
    }

    // Show banner if not dismissed (on iOS, Android, or desktop web)
    if (!isDismissed) {
      setIsVisible(true);
    }

    return () => {
      if (typeof window.removeEventListener === "function") {
        window.removeEventListener("beforeinstallprompt", handlePrompt);
      }
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    setStorageItem(STORAGE_KEY, "true");
  };

  const isEn = language === "en";
  const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  const handleInstallClick = async () => {
    const prompt = deferredPrompt || (typeof window !== "undefined" ? window.__kynioDeferredPrompt : null);
    if (prompt) {
      try {
        await prompt.prompt();
        const choice = await prompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsVisible(false);
          setStorageItem(STORAGE_KEY, "true");
        }
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          window.__kynioDeferredPrompt = null;
        }
      } catch {
        setShowManualGuide(true);
      }
    } else {
      setShowManualGuide(true);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {isIos
            ? isEn
              ? "Install KYNIO on iPhone"
              : "Instala o KYNIO no teu iPhone"
            : isEn
            ? "Install KYNIO App"
            : "Instala a app KYNIO"}
        </Text>

        {isIos ? (
          <Text style={[styles.description, { color: colors.muted }]}>
            {isEn
              ? "Tap Share (⎋) below and select 'Add to Home Screen' (⊞) for full-screen mode."
              : "Toca em Partilhar (⎋) no Safari e escolhe 'Adicionar ao Ecrã Principal' (⊞)."}
          </Text>
        ) : showManualGuide ? (
          <Text style={[styles.description, { color: colors.muted }]}>
            {isEn
              ? "Tap the 3 dots (⋮) in Chrome menu and tap 'Install application'."
              : "Toca nos 3 pontos (⋮) no topo do Chrome e escolhe 'Instalar aplicação'."}
          </Text>
        ) : (
          <Text style={[styles.description, { color: colors.muted }]}>
            {isEn
              ? "Add to home screen for full-screen circadian experience and instant access."
              : "Adiciona ao ecrã inicial para teres acesso instantâneo e modo ecrã inteiro."}
          </Text>
        )}

        {!isIos && (
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isEn ? "Install KYNIO" : "Instalar KYNIO"}
              onPress={handleInstallClick}
              style={[styles.installButton, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.installButtonText, { color: "#1C1915" }]}>
                {isEn ? "Install Now" : "Instalar Agora"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable
        testID="close-pwa-banner"
        accessibilityRole="button"
        accessibilityLabel={isEn ? "Close install banner" : "Fechar aviso de instalação"}
        onPress={handleDismiss}
        style={[styles.closeButton, { borderColor: colors.border }]}
      >
        <Text style={[styles.closeText, { color: colors.foreground }]}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 14,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  description: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 12.5,
    lineHeight: 17,
  },
  actionRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  installButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  installButtonText: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 12,
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  closeText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
