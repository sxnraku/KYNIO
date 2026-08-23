import type { AppThemeMode } from "@/store/app-preferences-store";

interface ColorPalette {
  background: string;
  backgroundRgb: string;
  border: string;
  borderRgb: string;
  foreground: string;
  foregroundRgb: string;
  muted: string;
  mutedRgb: string;
  success: string;
  successDark: string;
  successDarkRgb: string;
  surface: string;
  surfaceRaised: string;
  surfaceRaisedRgb: string;
  surfaceRgb: string;
  xp: string;
}

const LIGHT_COLORS: ColorPalette = {
  background: "#F3F6F4",
  backgroundRgb: "243 246 244",
  surface: "#FFFFFF",
  surfaceRgb: "255 255 255",
  surfaceRaised: "#F7F9F8",
  surfaceRaisedRgb: "247 249 248",
  border: "#DCE4DF",
  borderRgb: "220 228 223",
  foreground: "#111713",
  foregroundRgb: "17 23 19",
  muted: "#68736C",
  mutedRgb: "104 115 108",
  success: "#10B981",
  successDark: "#D9F7EA",
  successDarkRgb: "217 247 234",
  xp: "#6366F1",
};

const DARK_COLORS: ColorPalette = {
  background: "#09090B",
  backgroundRgb: "9 9 11",
  border: "#3F3F46",
  borderRgb: "63 63 70",
  foreground: "#F4F4F5",
  foregroundRgb: "244 244 245",
  muted: "#A1A1AA",
  mutedRgb: "161 161 170",
  success: "#10B981",
  successDark: "#0B3A2E",
  successDarkRgb: "11 58 46",
  surface: "#18181B",
  surfaceRaised: "#27272A",
  surfaceRaisedRgb: "39 39 42",
  surfaceRgb: "24 24 27",
  xp: "#818CF8",
};

let activeColorMode: AppThemeMode = "light";

export function getColorPalette(themeMode: AppThemeMode) {
  return themeMode === "dark" ? DARK_COLORS : LIGHT_COLORS;
}

export function setActiveColorMode(themeMode: AppThemeMode): void {
  activeColorMode = themeMode;
}

export const COLORS = new Proxy(LIGHT_COLORS, {
  get(_target, property: keyof ColorPalette) {
    return getColorPalette(activeColorMode)[property];
  },
});
