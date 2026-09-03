import { getColorPalette } from "@/constants/colors";
import {
  PRO_THEME_IDS,
  useAppPreferencesStore,
  type AppThemeMode,
} from "@/store/app-preferences-store";

describe("Theme Preferences and Pro Themes", () => {
  beforeEach(() => {
    useAppPreferencesStore.setState({
      healthConnectEnabled: false,
      hydrationRemindersEnabled: false,
      language: "pt",
      themeMode: "light",
    });
  });

  it("identifica corretamente os 4 temas exclusivos Sol Pro", () => {
    expect(PRO_THEME_IDS.has("amoled")).toBe(true);
    expect(PRO_THEME_IDS.has("midnight")).toBe(true);
    expect(PRO_THEME_IDS.has("matcha")).toBe(true);
    expect(PRO_THEME_IDS.has("eink")).toBe(true);

    expect(PRO_THEME_IDS.has("light")).toBe(false);
    expect(PRO_THEME_IDS.has("dark")).toBe(false);
  });

  it("permite definir e persistir cada um dos 6 temas", () => {
    const themes: AppThemeMode[] = [
      "light",
      "dark",
      "amoled",
      "midnight",
      "matcha",
      "eink",
    ];

    for (const theme of themes) {
      useAppPreferencesStore.getState().setThemeMode(theme);
      expect(useAppPreferencesStore.getState().themeMode).toBe(theme);
    }
  });

  it("fornece paletas com cores contrastantes e válidas para todos os temas", () => {
    const amoledPalette = getColorPalette("amoled");
    expect(amoledPalette.background).toBe("#000000");
    expect(amoledPalette.success).toBe("#FFA01C");

    const midnightPalette = getColorPalette("midnight");
    expect(midnightPalette.background).toBe("#0D111A");
    expect(midnightPalette.success).toBe("#F0C05A");

    const matchaPalette = getColorPalette("matcha");
    expect(matchaPalette.background).toBe("#121815");
    expect(matchaPalette.success).toBe("#94BC4A");

    const einkPalette = getColorPalette("eink");
    expect(einkPalette.background).toBe("#141414");
    expect(einkPalette.success).toBe("#FFFFFF");

    const lightPalette = getColorPalette("light");
    expect(lightPalette.background).toBe("#EDE6D3");

    const darkPalette = getColorPalette("dark");
    expect(darkPalette.background).toBe("#1C1915");
  });
});
