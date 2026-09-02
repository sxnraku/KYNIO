import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { COLORS, successWithAlpha } from "@/constants/colors";
import {
  getXpRewardTiers,
  type XpRewardTier,
} from "@/services/gamificationService";

interface XpRewardsCardProps {
  level: number;
  totalXp: number;
}

export function XpRewardsCard({ level, totalXp }: XpRewardsCardProps) {
  const tiers: XpRewardTier[] = getXpRewardTiers(totalXp, level);
  const unlockedCount = tiers.filter((t) => t.isUnlocked).length;

  return (
    <View className="rounded-[28px] border border-border bg-surface p-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center">
            <View className="mr-2 h-6 w-6 items-center justify-center rounded-lg bg-xp/20">
              <Ionicons color={COLORS.xp} name="gift-outline" size={15} />
            </View>
            <Text className="font-headline text-lg text-foreground">
              Recompensas de XP
            </Text>
          </View>
          <Text className="mt-1 font-body text-xs text-muted">
            Desbloqueia vantagens Sol e passes premium com o teu progresso.
          </Text>
        </View>
        <View className="rounded-full bg-xp/15 px-2.5 py-1 border border-xp/30">
          <Text className="font-label text-xs text-xp">
            {unlockedCount}/{tiers.length} Ativas
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-2.5">
        {tiers.map((tier) => (
          <View
            className="flex-row items-center justify-between rounded-2xl border p-3.5"
            key={tier.id}
            style={{
              backgroundColor: tier.isUnlocked
                ? successWithAlpha(0.05)
                : COLORS.surfaceRaised,
              borderColor: tier.isUnlocked ? COLORS.success : COLORS.border,
            }}
          >
            <View className="flex-1 pr-3">
              <View className="flex-row items-center">
                <Text
                  className="font-headline text-sm"
                  style={{
                    color: tier.isUnlocked ? COLORS.foreground : COLORS.muted,
                  }}
                >
                  {tier.title}
                </Text>
                <View
                  className="ml-2 rounded px-1.5 py-0.5"
                  style={{
                    backgroundColor: tier.isUnlocked
                      ? successWithAlpha(0.15)
                      : "rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <Text
                    className="font-label text-[9px]"
                    style={{
                      color: tier.isUnlocked ? COLORS.success : COLORS.muted,
                    }}
                  >
                    {tier.perkBadge}
                  </Text>
                </View>
              </View>
              <Text className="mt-1 font-body text-xs leading-4 text-muted">
                {tier.description}
              </Text>
            </View>

            <View className="items-end">
              {tier.isUnlocked ? (
                <View className="h-7 w-7 items-center justify-center rounded-full bg-success/20">
                  <Ionicons color={COLORS.success} name="checkmark" size={16} />
                </View>
              ) : (
                <View className="items-end">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-background border border-border">
                    <Ionicons color={COLORS.muted} name="lock-closed" size={13} />
                  </View>
                  <Text className="mt-1 font-label text-[9px] text-muted">
                    Nv. {tier.levelRequired} ({tier.xpRequired} XP)
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
