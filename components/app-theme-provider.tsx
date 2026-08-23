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
        "--color-foreground": palette.foregroundRgb,
        "--color-muted": palette.mutedRgb,
        "--color-success-dark": palette.successDarkRgb,
        "--color-surface": palette.surfaceRgb,
        "--color-surface-raised": palette.surfaceRaisedRgb,
      }),
    [palette],
  );

  setActiveColorMode(themeMode);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    document.documentElement.style.backgroundColor = palette.background;
    document.documentElement.style.colorScheme = themeMode;
    document.body.style.backgroundColor = palette.background;
  }, [palette.background, themeMode]);

  return (
    <View className="flex-1 bg-background" style={themeVariables}>
      {children}
    </View>
  );
}
