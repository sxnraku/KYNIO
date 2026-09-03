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

/** Tema Sol Pro: AMOLED Eclipse (Preto puro para ecrãs OLED) */
const AMOLED_COLORS: ColorPalette = {
  background: "#000000",
  backgroundRgb: "0 0 0",
  border: "#24221E",
  borderRgb: "36 34 30",
  danger: "#FF5C38",
  dangerRgb: "255 92 56",
  foreground: "#F7F5EE",
  foregroundRgb: "247 245 238",
  muted: "#8A867C",
  mutedRgb: "138 134 124",
  success: "#FFA01C",
  successRgb: "255 160 28",
  successDark: "#331C00",
  successDarkRgb: "51 28 0",
  surface: "#0C0C0B",
  surfaceRaised: "#161614",
  surfaceRaisedRgb: "22 22 20",
  surfaceRgb: "12 12 11",
  warning: "#FF8C00",
  xp: "#FFA01C",
};

/** Tema Sol Pro: Crepúsculo & Ouro (Azul mineral noturno com ouro imperial) */
const MIDNIGHT_COLORS: ColorPalette = {
  background: "#0D111A",
  backgroundRgb: "13 17 26",
  border: "#242F45",
  borderRgb: "36 47 69",
  danger: "#FF6B6B",
  dangerRgb: "255 107 107",
  foreground: "#EBF0F8",
  foregroundRgb: "235 240 248",
  muted: "#7E8EAA",
  mutedRgb: "126 142 170",
  success: "#F0C05A",
  successRgb: "240 192 90",
  successDark: "#33260A",
  successDarkRgb: "51 38 10",
  surface: "#141A26",
  surfaceRaised: "#1D2536",
  surfaceRaisedRgb: "29 37 54",
  surfaceRgb: "20 26 38",
  warning: "#E5A83B",
  xp: "#F0C05A",
};

/** Tema Sol Pro: Matcha & Salva (Tons botânicos de bem-estar orgânico) */
const MATCHA_COLORS: ColorPalette = {
  background: "#121815",
  backgroundRgb: "18 24 21",
  border: "#2C3B34",
  borderRgb: "44 59 52",
  danger: "#E05A47",
  dangerRgb: "224 90 71",
  foreground: "#EBF2EC",
  foregroundRgb: "235 242 236",
  muted: "#889C8F",
  mutedRgb: "136 156 143",
  success: "#94BC4A",
  successRgb: "148 188 74",
  successDark: "#1F2B10",
  successDarkRgb: "31 43 16",
  surface: "#1A221E",
  surfaceRaised: "#232E29",
  surfaceRaisedRgb: "35 46 41",
  surfaceRgb: "26 34 30",
  warning: "#D49838",
  xp: "#94BC4A",
};

/** Tema Sol Pro: Studio Monocromo (Estética e-ink / brutalismo minimalista) */
const EINK_COLORS: ColorPalette = {
  background: "#141414",
  backgroundRgb: "20 20 20",
  border: "#383838",
  borderRgb: "56 56 56",
  danger: "#E54D42",
  dangerRgb: "229 77 66",
  foreground: "#FFFFFF",
  foregroundRgb: "255 255 255",
  muted: "#969696",
  mutedRgb: "150 150 150",
  success: "#FFFFFF",
  successRgb: "255 255 255",
  successDark: "#333333",
  successDarkRgb: "51 51 51",
  surface: "#1C1C1C",
  surfaceRaised: "#262626",
  surfaceRaisedRgb: "38 38 38",
  surfaceRgb: "28 28 28",
  warning: "#D4D4D4",
  xp: "#FFFFFF",
};

let activeColorMode: AppThemeMode = "light";

export function getColorPalette(themeMode: AppThemeMode): ColorPalette {
  switch (themeMode) {
    case "dark":
      return DARK_COLORS;
    case "amoled":
      return AMOLED_COLORS;
    case "midnight":
      return MIDNIGHT_COLORS;
    case "matcha":
      return MATCHA_COLORS;
    case "eink":
      return EINK_COLORS;
    case "light":
    default:
      return LIGHT_COLORS;
  }
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
