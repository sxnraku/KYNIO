import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarIcon } from "@/components/ui/tab-bar-icon";
import { getColorPalette } from "@/constants/colors";
import { triggerLightImpact } from "@/services/hapticsService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

export default function TabsLayout() {
  const language = useAppPreferencesStore((state) => state.language);
  const themeMode = useAppPreferencesStore((state) => state.themeMode);
  const colors = getColorPalette(themeMode);
  const { bottom } = useSafeAreaInsets();

  const tabPressListener = {
    tabPress: () => {
      triggerLightImpact();
    },
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarBackground: () => (
          <BlurView
            intensity={Platform.OS === "android" ? 70 : 85}
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor:
                  themeMode === "dark"
                    ? "rgba(28, 25, 21, 0.80)"
                    : "rgba(237, 230, 211, 0.84)",
              },
            ]}
            tint={themeMode === "dark" ? "dark" : "light"}
          />
        ),
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: "HankenGrotesk_600SemiBold",
          fontSize: 10,
        },
        tabBarStyle: {
          alignSelf: "center",
          backgroundColor: "transparent",
          borderTopColor:
            themeMode === "dark"
              ? "rgba(241, 233, 214, 0.12)"
              : "rgba(58, 58, 56, 0.12)",
          borderTopWidth: 1,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          bottom: 0,
          elevation: 0,
          height: 72 + bottom,
          left: 0,
          maxWidth: 560,
          overflow: "hidden",
          paddingBottom: 10 + bottom,
          paddingTop: 7,
          position: "absolute",
          right: 0,
          width: "100%",
        },
      }}
    >
      <Tabs.Screen
        listeners={tabPressListener}
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
        listeners={tabPressListener}
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
        listeners={tabPressListener}
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
        listeners={tabPressListener}
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
        listeners={tabPressListener}
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
