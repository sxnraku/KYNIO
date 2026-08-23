import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS } from "@/constants/colors";

interface XpCardProps {
  currentXp: number;
  targetXp: number;
}

export function XpCard({ currentXp, targetXp }: XpCardProps) {
  const progress = targetXp > 0 ? Math.min(currentXp / targetXp, 1) : 0;

  return (
    <View
      accessibilityLabel="Progresso de experiência indisponível"
      accessibilityRole="progressbar"
      accessibilityState={{ disabled: true }}
      accessibilityValue={{ max: targetXp, min: 0, now: currentXp }}
      className="rounded-2xl border border-xp/30 bg-surface p-5 opacity-60"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-xp/15">
            <Ionicons color={COLORS.xp} name="sparkles" size={16} />
          </View>
          <Text className="ml-3 font-label text-xs uppercase tracking-widest text-xp">
            Experiência
          </Text>
        </View>
        <Text className="font-label text-[10px] text-muted">EM BREVE</Text>
      </View>

      <View className="mt-5 h-2 overflow-hidden rounded-full bg-border">
        <View
          className="h-full rounded-full bg-xp"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <Text className="mt-3 text-right font-label text-[10px] text-muted">
        {currentXp} / {targetXp} XP
      </Text>
    </View>
  );
}
