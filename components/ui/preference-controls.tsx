import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import {
  type AppLanguage,
  type AppThemeMode,
  useAppPreferencesStore,
} from "@/store/app-preferences-store";

interface Choice<T extends string> {
  id: T;
  label: string;
}

const THEME_CHOICES: Choice<AppThemeMode>[] = [
  { id: "light", label: "Claro" },
  { id: "dark", label: "Escuro" },
];

const LANGUAGE_CHOICES: Choice<AppLanguage>[] = [
  { id: "pt", label: "Português" },
  { id: "en", label: "English" },
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

  return (
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

      <Text className="mb-2 mt-5 font-label text-[10px] uppercase tracking-widest text-muted">
        Aparência
      </Text>
      <SegmentedChoice
        choices={THEME_CHOICES}
        onChange={setThemeMode}
        value={themeMode}
      />

      <Text className="mb-2 mt-5 font-label text-[10px] uppercase tracking-widest text-muted">
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
  );
}
