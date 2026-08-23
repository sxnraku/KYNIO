import { Tabs } from "expo-router";

import { TabBarIcon } from "@/components/ui/tab-bar-icon";
import { getColorPalette } from "@/constants/colors";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

export default function TabsLayout() {
  const language = useAppPreferencesStore((state) => state.language);
  const themeMode = useAppPreferencesStore((state) => state.themeMode);
  const colors = getColorPalette(themeMode);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: "HankenGrotesk_600SemiBold",
          fontSize: 10,
        },
        tabBarStyle: {
          alignSelf: "center",
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          height: 82,
          maxWidth: 560,
          overflow: "hidden",
          paddingBottom: 10,
          paddingTop: 7,
          width: "100%",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: translateText("Jejum", language),
          tabBarActiveTintColor: colors.success,
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              activeName="timer"
              color={color}
              focused={focused}
              inactiveName="timer-outline"
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: translateText("Refeições", language),
          tabBarActiveTintColor: colors.success,
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              activeName="camera"
              color={color}
              focused={focused}
              inactiveName="camera-outline"
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: translateText("Treinos", language),
          tabBarActiveTintColor: colors.success,
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              activeName="barbell"
              color={color}
              focused={focused}
              inactiveName="barbell-outline"
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: translateText("Progresso", language),
          tabBarActiveTintColor: colors.xp,
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              activeName="medal"
              color={color}
              focused={focused}
              inactiveName="medal-outline"
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: translateText("Perfil", language),
          tabBarActiveTintColor: colors.success,
          tabBarIcon: ({ color, focused, size }) => (
            <TabBarIcon
              activeName="person-circle"
              color={color}
              focused={focused}
              inactiveName="person-circle-outline"
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
