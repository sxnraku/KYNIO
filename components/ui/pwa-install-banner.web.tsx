import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { getColorPalette } from "@/constants/colors";

const STORAGE_KEY = "kynio_pwa_prompt_dismissed";

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

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }

    // Check if running on iOS (iPhone/iPad)
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // Check if already running in standalone mode (installed to home screen)
    const isStandalone =
      ("standalone" in navigator && Boolean((navigator as { standalone?: boolean }).standalone)) ||
      window.matchMedia("(display-mode: standalone)").matches;

    const isDismissed = getStorageItem(STORAGE_KEY) === "true";

    if (isIos && !isStandalone && !isDismissed) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
    setStorageItem(STORAGE_KEY, "true");
  };

  const isEn = language === "en";

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
          {isEn ? "Install KYNIO on iPhone" : "Instala o KYNIO no teu iPhone"}
        </Text>
        <Text style={[styles.description, { color: colors.muted }]}>
          {isEn
            ? "Tap Share (⎋) below and select 'Add to Home Screen' (⊞) for full-screen mode."
            : "Toca em Partilhar (⎋) no Safari e escolhe 'Adicionar ao Ecrã Principal' (⊞)."}
        </Text>
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
    alignItems: "center",
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
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  closeText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

