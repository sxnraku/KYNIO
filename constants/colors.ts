import type { AppThemeMode } from "@/store/app-preferences-store";

interface ColorPalette {
  background: string;
  backgroundRgb: string;
  border: string;
  borderRgb: string;
  danger: string;
  dangerRgb: string;
  foreground: string;
  foregroundRgb: string;
  muted: string;
  mutedRgb: string;
  success: string;
  successRgb: string;
  successDark: string;
  successDarkRgb: string;
  surface: string;
  surfaceRaised: string;
  surfaceRaisedRgb: string;
  surfaceRgb: string;
  warning: string;
  xp: string;
}

// Tema claro "Circadiano": papel quente, tinta carvão e um único acento
// âmbar (o sol do mostrador). Tons derivados da mesma temperatura de luz.
const LIGHT_COLORS: ColorPalette = {
  background: "#EDE6D3",
  backgroundRgb: "237 230 211",
  surface: "#F6F0DE",
  surfaceRgb: "246 240 222",
  surfaceRaised: "#FBF7EA",
  surfaceRaisedRgb: "251 247 234",
  border: "#D5CBAF",
  borderRgb: "213 203 175",
  danger: "#B34324",
  dangerRgb: "179 67 36",
  foreground: "#3A3A38",
  foregroundRgb: "58 58 56",
  muted: "#6F6E66",
  mutedRgb: "111 110 102",
  success: "#D9922E",
  successRgb: "217 146 46",
  successDark: "#F0DFC0",
  successDarkRgb: "240 223 192",
  warning: "#B45309",
  xp: "#D9922E",
};

// Tema escuro "Noite": a mesma luz, agora âmbar-vela sobre carvão quente.
const DARK_COLORS: ColorPalette = {
  background: "#1C1915",
  backgroundRgb: "28 25 21",
  border: "#4A4334",
  borderRgb: "74 67 52",
  danger: "#E0704B",
  dangerRgb: "224 112 75",
  foreground: "#F1E9D6",
  foregroundRgb: "241 233 214",
  muted: "#A79D88",
  mutedRgb: "167 157 136",
  success: "#E8A83E",
  successRgb: "232 168 62",
  successDark: "#3D2F16",
  successDarkRgb: "61 47 22",
  surface: "#26221C",
  surfaceRaised: "#322D24",
  surfaceRaisedRgb: "50 45 36",
  surfaceRgb: "38 34 28",
  warning: "#D97A2E",
  xp: "#E8A83E",
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

/** Acento âmbar com transparência, sensível ao tema ativo. */
export function successWithAlpha(alpha: number): string {
  const rgb = getColorPalette(activeColorMode).successRgb.split(" ").join(", ");
  return `rgba(${rgb}, ${alpha})`;
}
