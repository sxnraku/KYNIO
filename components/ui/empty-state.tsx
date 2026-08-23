import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface EmptyStateProps {
  description: string;
  icon: IconName;
  title: string;
}

export function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-success/10">
        <Ionicons color={COLORS.success} name={icon} size={27} />
      </View>
      <Text className="mt-4 text-center font-headline text-lg text-foreground">
        {title}
      </Text>
      <Text className="mt-2 text-center font-body text-sm leading-5 text-muted">
        {description}
      </Text>
    </View>
  );
}
