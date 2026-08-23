import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";

interface AchievementRowProps {
  description: string;
  title: string;
}

export function AchievementRow({ description, title }: AchievementRowProps) {
  return (
    <View className="flex-row items-center border-b border-border py-4 opacity-55 last:border-b-0">
      <View className="h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
        <Ionicons color={COLORS.muted} name="lock-closed" size={16} />
      </View>
      <View className="ml-4 flex-1">
        <Text className="font-headline text-base text-foreground">{title}</Text>
        <Text className="mt-1 font-body text-sm text-muted">{description}</Text>
      </View>
      <Text className="font-label text-[9px] uppercase text-muted">
        Bloqueado
      </Text>
    </View>
  );
}
