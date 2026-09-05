import { useEffect, useMemo, type PropsWithChildren } from "react";
import { Platform, View } from "react-native";
import { vars } from "nativewind";

import { getColorPalette, setActiveColorMode } from "@/constants/colors";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

export function AppThemeProvider({ children }: PropsWithChildren) {
  const themeMode = useAppPreferencesStore((state) => state.themeMode);
  const palette = getColorPalette(themeMode);
  const themeVariables = useMemo(
    () =>
      vars({
        "--color-background": palette.backgroundRgb,
        "--color-border": palette.borderRgb,
        "--color-danger": palette.dangerRgb,
        "--color-foreground": palette.foregroundRgb,
        "--color-muted": palette.mutedRgb,
        "--color-success": palette.successRgb,
        "--color-success-dark": palette.successDarkRgb,
        "--color-surface": palette.surfaceRgb,
        "--color-surface-raised": palette.surfaceRaisedRgb,
        "--color-xp": palette.successRgb,
      }),
    [palette],
  );

  setActiveColorMode(themeMode);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.style.setProperty("--color-background", palette.backgroundRgb);
    root.style.setProperty("--color-border", palette.borderRgb);
    root.style.setProperty("--color-danger", palette.dangerRgb);
    root.style.setProperty("--color-foreground", palette.foregroundRgb);
    root.style.setProperty("--color-muted", palette.mutedRgb);
    root.style.setProperty("--color-success", palette.successRgb);
    root.style.setProperty("--color-success-dark", palette.successDarkRgb);
    root.style.setProperty("--color-surface", palette.surfaceRgb);
    root.style.setProperty("--color-surface-raised", palette.surfaceRaisedRgb);
    root.style.setProperty("--color-xp", palette.successRgb);

    root.style.backgroundColor = palette.background;
    root.style.colorScheme = themeMode;
    if (document.body) {
      document.body.style.backgroundColor = palette.background;
    }
  }, [palette, themeMode]);

  return (
    <View className="flex-1 bg-background" style={themeVariables}>
      <View
        style={
          Platform.OS === "web"
            ? {
                width: "100%",
                maxWidth: 480,
                marginHorizontal: "auto",
                height: "100%",
                flex: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: palette.border,
                overflow: "hidden",
              }
            : { flex: 1 }
        }
      >
        {children}
      </View>
    </View>
  );
}
