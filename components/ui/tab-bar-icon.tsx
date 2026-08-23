import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View, type ColorValue } from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface TabBarIconProps {
  activeName: IconName;
  color: ColorValue;
  focused: boolean;
  inactiveName: IconName;
  size: number;
}

export function TabBarIcon({
  activeName,
  color,
  focused,
  inactiveName,
  size,
}: TabBarIconProps) {
  return (
    <View
      className={`h-9 w-12 items-center justify-center rounded-2xl ${focused ? 'bg-success/10' : ''}`}>
      <Ionicons color={color} name={focused ? activeName : inactiveName} size={size} />
    </View>
  );
}
