import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import {
  type AppLanguage,
  type AppThemeMode,
  PRO_THEME_IDS,
  useAppPreferencesStore,
} from "@/store/app-preferences-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";

interface Choice<T extends string> {
  id: T;
  label: string;
}

const LANGUAGE_CHOICES: Choice<AppLanguage>[] = [
  { id: "pt", label: "Português" },
  { id: "en", label: "English" },
];

interface ThemeOption {
  accentDot: string;
  bgDot: string;
  id: AppThemeMode;
  isPro: boolean;
  label: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    accentDot: "#D9922E",
    bgDot: "#EDE6D3",
    id: "light",
    isPro: false,
    label: "Original Claro",
  },
  {
    accentDot: "#E8A83E",
    bgDot: "#1C1915",
    id: "dark",
    isPro: false,
    label: "Original Noite",
  },
  {
    accentDot: "#FFA01C",
    bgDot: "#000000",
    id: "amoled",
    isPro: true,
    label: "AMOLED Eclipse",
  },
  {
    accentDot: "#F0C05A",
    bgDot: "#0D111A",
    id: "midnight",
    isPro: true,
    label: "Crepúsculo & Ouro",
  },
  {
    accentDot: "#94BC4A",
    bgDot: "#121815",
    id: "matcha",
    isPro: true,
    label: "Matcha & Salva",
  },
  {
    accentDot: "#FFFFFF",
    bgDot: "#141414",
    id: "eink",
    isPro: true,
    label: "Monocromo",
  },
];

interface SegmentedChoiceProps<T extends string> {
  choices: Choice<T>[];
  onChange: (value: T) => void;
  value: T;
}

function SegmentedChoice<T extends string>({
  choices,
  onChange,
  value,
}: SegmentedChoiceProps<T>) {
  return (
    <View className="flex-row rounded-xl bg-background p-1">
      {choices.map((choice) => {
        const isSelected = value === choice.id;

        return (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            className={`min-h-11 flex-1 items-center justify-center rounded-lg px-3 active:opacity-70 ${
              isSelected ? "bg-surface" : "bg-transparent"
            }`}
            key={choice.id}
            onPress={() => onChange(choice.id)}
          >
            <Text
              className={
                isSelected
                  ? "font-headline text-sm text-foreground"
                  : "font-body text-sm text-muted"
              }
            >
              {choice.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function PreferenceControls() {
  const language = useAppPreferencesStore((state) => state.language);
  const setLanguage = useAppPreferencesStore((state) => state.setLanguage);
  const setThemeMode = useAppPreferencesStore((state) => state.setThemeMode);
  const themeMode = useAppPreferencesStore((state) => state.themeMode);
  const isPro = useSubscriptionStore((state) => state.isPro);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const handleSelectTheme = (option: ThemeOption) => {
    if (option.isPro && !isPro) {
      setIsPaywallOpen(true);
      return;
    }
    setThemeMode(option.id);
  };

  return (
    <>
      <Card>
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-xp/10">
            <Ionicons color={COLORS.xp} name="options-outline" size={21} />
          </View>
          <View className="flex-1">
            <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
              Preferências
            </Text>
            <Text className="mt-1 font-headline text-lg text-foreground">
              Aparência e idioma
            </Text>
          </View>
        </View>

        {/* Seletor de Temas */}
        <View className="mb-2 mt-5 flex-row items-baseline justify-between">
          <Text className="font-label text-[10px] uppercase tracking-widest text-muted">
            Temas Visuais
          </Text>
          {!isPro ? (
            <Text className="font-label text-[10px] uppercase text-xp">
              4 temas Sol Pro ✦
            </Text>
          ) : null}
        </View>

        <View className="flex-row flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => {
            const isSelected = themeMode === option.id;
            const isLocked = option.isPro && !isPro;

            return (
              <Pressable
                accessibilityLabel={option.label}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                className={`min-h-[54px] w-[48.5%] flex-row items-center rounded-xl border p-2.5 active:opacity-75 ${
                  isSelected
                    ? "border-success bg-surface"
                    : "border-border bg-surface-raised"
                }`}
                key={option.id}
                onPress={() => handleSelectTheme(option)}
              >
                {/* Visual Swatch: Círculo de fundo com anel/ponto de acento */}
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: option.bgDot,
                    borderColor: option.accentDot,
                    borderWidth: 1.5,
                  }}
                >
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: option.accentDot }}
                  />
                </View>

                <View className="ml-2.5 min-w-0 flex-1">
                  <View className="flex-row items-center gap-1">
                    <Text
                      className={`truncate font-headline text-xs ${
                        isSelected ? "text-foreground font-bold" : "text-foreground"
                      }`}
                      numberOfLines={1}
                    >
                      {option.label}
                    </Text>
                  </View>
                  <Text className="mt-0.5 font-label text-[9px] uppercase tracking-wider text-muted">
                    {option.isPro
                      ? isLocked
                        ? "Sol Pro ✦"
                        : "Exclusivo Pro"
                      : "Gratuito"}
                  </Text>
                </View>

                {isLocked ? (
                  <Ionicons
                    color={COLORS.xp}
                    name="lock-closed"
                    size={13}
                    style={{ marginLeft: 2 }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-2 mt-6 font-label text-[10px] uppercase tracking-widest text-muted">
          Idioma
        </Text>
        <SegmentedChoice
          choices={LANGUAGE_CHOICES}
          onChange={setLanguage}
          value={language}
        />

        <Text className="mt-4 font-body text-xs leading-5 text-muted">
          As preferências ficam guardadas apenas neste dispositivo.
        </Text>
      </Card>

      <PaywallModal
        featureTrigger="Temas Exclusivos Sol Pro"
        onClose={() => setIsPaywallOpen(false)}
        visible={isPaywallOpen}
      />
    </>
  );
}
