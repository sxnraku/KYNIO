import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";

interface SettingsActionCardProps {
  description: string;
  destructive?: boolean;
  disabled?: boolean;
  icon:
    | "compass-outline"
    | "download-outline"
    | "refresh-outline"
    | "trash-outline";
  isLoading: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}

export function SettingsActionCard({
  description,
  destructive = false,
  disabled = false,
  icon,
  isLoading,
  label,
  onPress,
  testID,
}: SettingsActionCardProps) {
  const accentColor = destructive ? COLORS.danger : COLORS.success;

  return (
    <View className="rounded-2xl border border-border bg-surface p-5">
      <View className="flex-row items-start gap-4">
        <View
          className={`h-11 w-11 items-center justify-center rounded-xl ${
            destructive ? "bg-danger/10" : "bg-success/10"
          }`}
        >
          <Ionicons color={accentColor} name={icon} size={23} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="font-headline text-lg text-foreground">{label}</Text>
          <Text className="mt-1 font-body text-sm leading-5 text-muted">
            {description}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || isLoading }}
        className={`mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-xl border px-4 active:opacity-70 ${
          destructive
            ? "border-danger/40 bg-danger/10"
            : "border-success/30 bg-success/10"
        } ${disabled ? "opacity-50" : ""}`}
        disabled={disabled || isLoading}
        onPress={onPress}
        testID={testID}
      >
        {isLoading ? (
          <ActivityIndicator color={accentColor} size="small" />
        ) : null}
        <Text
          className={`font-headline text-sm ${destructive ? "text-danger" : "text-success"}`}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
