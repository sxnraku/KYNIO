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

    const isStandalone =
      ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone)) ||
      window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) {
      return;
    }

    const isDismissed = getStorageItem(STORAGE_KEY) === "true";

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

  if (isIos) {
    return (
      <View
        style={[
          styles.compactBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.contentCol}>
          <Text style={[styles.titleText, { color: colors.foreground }]}>
            {isEn ? "Install KYNIO on iPhone" : "Instala o KYNIO no teu iPhone"}
          </Text>
          <Text style={[styles.subtitleText, { color: colors.muted }]}>
            {isEn
              ? "Tap Share (⎋) and select 'Add to Home Screen' (⊞)"
              : "Toca em Partilhar (⎋) e seleciona 'Adicionar ao Ecrã' (⊞)"}
          </Text>
        </View>
        <Pressable
          testID="close-pwa-banner"
          accessibilityRole="button"
          accessibilityLabel={isEn ? "Close banner" : "Fechar aviso"}
          onPress={handleDismiss}
          hitSlop={8}
          style={styles.closeBtn}
        >
          <Text style={[styles.closeIcon, { color: colors.muted }]}>✕</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.compactBar,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.leadingCol}>
        <View style={[styles.dotIndicator, { backgroundColor: colors.accent }]} />
        <View style={styles.textStack}>
          <Text style={[styles.titleText, { color: colors.foreground }]} numberOfLines={1}>
            {showManualGuide
              ? isEn
                ? "Menu (⋮) → Install app"
                : "Menu (⋮) → Instalar app"
              : isEn
              ? "Install KYNIO Web App"
              : "Instalar aplicação KYNIO"}
          </Text>
          <Text style={[styles.subtitleText, { color: colors.muted }]} numberOfLines={1}>
            {showManualGuide
              ? isEn
                ? "Tap Chrome menu at top right"
                : "No topo do Chrome à direita"
              : isEn
              ? "Full-screen & instant offline access"
              : "Ecrã inteiro e acesso instantâneo"}
          </Text>
        </View>
      </View>

      <View style={styles.actionsGroup}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isEn ? "Install" : "Instalar"}
          onPress={handleInstallClick}
          style={[styles.miniButton, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.miniButtonText}>
            {isEn ? "Instalar" : "Instalar"}
          </Text>
        </Pressable>

        <Pressable
          testID="close-pwa-banner"
          accessibilityRole="button"
          accessibilityLabel={isEn ? "Close" : "Fechar"}
          onPress={handleDismiss}
          hitSlop={10}
          style={styles.closeBtn}
        >
          <Text style={[styles.closeIcon, { color: colors.muted }]}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactBar: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  leadingCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  contentCol: {
    flex: 1,
    gap: 2,
  },
  dotIndicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  textStack: {
    flex: 1,
    gap: 1,
  },
  titleText: {
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 13,
    letterSpacing: -0.1,
    lineHeight: 16,
  },
  subtitleText: {
    fontFamily: "HankenGrotesk_400Regular",
    fontSize: 11,
    lineHeight: 14,
  },
  actionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  miniButtonText: {
    color: "#1C1915",
    fontFamily: "HankenGrotesk_700Bold",
    fontSize: 11.5,
    letterSpacing: 0.2,
  },
  closeBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    fontSize: 12,
    fontWeight: "700",
  },
});
