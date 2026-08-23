import { Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/ui/tab-bar-icon';
import { COLORS } from '@/constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.background },
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: {
          fontFamily: 'HankenGrotesk_600SemiBold',
          fontSize: 10,
        },
        tabBarStyle: {
          alignSelf: 'center',
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          height: 82,
          maxWidth: 560,
          overflow: 'hidden',
          paddingBottom: 10,
          paddingTop: 7,
          width: '100%',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jejum',
          tabBarActiveTintColor: COLORS.success,
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
          title: 'Refeições',
          tabBarActiveTintColor: COLORS.success,
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
          title: 'Treinos',
          tabBarActiveTintColor: COLORS.success,
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
          title: 'Progresso',
          tabBarActiveTintColor: COLORS.xp,
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
          title: 'Perfil',
          tabBarActiveTintColor: COLORS.success,
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
