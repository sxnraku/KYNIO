import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { PaywallModal } from "@/components/ui/paywall-modal";
import { COLORS } from "@/constants/colors";
import type { LocalGamificationStats } from "@/services/gamificationService";

import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface ConsistencyLineProps {
  stats: LocalGamificationStats;
}

function getIntensityLabel(stats: LocalGamificationStats, language: "en" | "pt"): string {
  const { daysSinceLastActivity, missedDaysInLine } = stats;

  if (daysSinceLastActivity === null) {
    return language === "en" ? "No logged activity" : "Sem atividade registada";
  }

  if (stats.isShieldActive) {
    return language === "en"
      ? "Streak saved by Streak Shield 🛡️"
      : "Sequência salva pelo Escudo de Sol 🛡️";
  }

  if (missedDaysInLine === 1 && daysSinceLastActivity === 0) {
    return language === "en"
      ? "High intensity · 1 grace day used"
      : "Intensidade alta · 1 dia de tolerância usado";
  }

  if (daysSinceLastActivity === 0) {
    return language === "en"
      ? "Peak intensity · activity today"
      : "Intensidade máxima · atividade hoje";
  }

  if (daysSinceLastActivity === 1) {
    return language === "en"
      ? "Gentle intensity · 1 day break"
      : "Intensidade suave · 1 dia em pausa";
  }

  return language === "en"
    ? `Reduced intensity · ${daysSinceLastActivity} days break`
    : `Intensidade reduzida · ${daysSinceLastActivity} dias em pausa`;
}

export function ConsistencyLine({ stats }: ConsistencyLineProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  return (
    <>
      <View className="rounded-3xl border border-border bg-surface p-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <Ionicons color={COLORS.success} name="pulse" size={20} />
            </View>
            <View className="ml-3">
              <Text className="font-label text-[10px] uppercase tracking-widest text-success">
                {language === "en" ? "Consistency Line" : "Linha de Consistência"}
              </Text>
              <Text className="mt-1 font-body text-sm text-muted">
                {getIntensityLabel(stats, language)}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="font-headline text-3xl text-foreground">
              {stats.streakDays}
            </Text>
            <Text className="font-label text-[9px] text-muted">
              {language === "en" ? "DAYS" : "DIAS"}
            </Text>
          </View>
        </View>

        {/* Badge do Escudo de Sol */}
        <View className="mt-4">
          {stats.hasStreakShield ? (
            <View className="flex-row items-center justify-between rounded-xl border border-success/30 bg-success/10 px-3 py-2">
              <View className="flex-row items-center gap-2">
                <Ionicons color={COLORS.success} name="shield-checkmark" size={15} />
                <Text className="font-headline text-xs text-foreground">
                  {stats.isShieldActive
                    ? language === "en"
                      ? "Streak Shield in action (Streak protected)"
                      : "Escudo de Sol em ação (Streak protegido)"
                    : language === "en"
                    ? "Streak Shield active (2 shields/month)"
                    : "Escudo de Sol ativo (2 proteções/mês)"}
                </Text>
              </View>
              <Text className="font-label text-[10px] uppercase text-success">
                Sol Pro ✦
              </Text>
            </View>
          ) : (
            <Pressable
              accessibilityLabel={
                language === "en"
                  ? "Protect streak with Streak Shield"
                  : "Proteger sequência com Escudo de Sol"
              }
              accessibilityRole="button"
              className="flex-row items-center justify-between rounded-xl border border-border bg-surface-raised px-3 py-2 active:opacity-70"
              onPress={() => setIsPaywallOpen(true)}
            >
              <View className="flex-row items-center gap-2">
                <Ionicons color={COLORS.xp} name="shield-outline" size={15} />
                <Text className="font-body text-xs text-muted">
                  {language === "en" ? (
                    <>
                      Protect your days with{" "}
                      <Text className="font-headline text-foreground">Streak Shield</Text>
                    </>
                  ) : (
                    <>
                      Protege os teus dias com o{" "}
                      <Text className="font-headline text-foreground">Escudo de Sol</Text>
                    </>
                  )}
                </Text>
              </View>
              <Text className="font-label text-[10px] uppercase text-xp">
                {language === "en" ? "Unlock ✦" : "Desbloquear ✦"}
              </Text>
            </Pressable>
          )}
        </View>

        <View className="mt-5 flex-row gap-2">
          {Array.from({ length: 7 }, (_, index) => {
            const segmentStrength = Math.min(
              1,
              stats.streakIntensity * (0.55 + index * 0.075),
            );

            return (
              <View
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-background"
                key={index}
              >
                <View
                  className="h-full w-full rounded-full bg-success"
                  style={{ opacity: segmentStrength }}
                />
              </View>
            );
          })}
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="min-w-0 flex-1 pr-3 font-body text-xs text-muted">
            A intensidade suaviza quando há uma pausa; o histórico permanece.
          </Text>
          <Text className="shrink-0 font-label text-[10px] text-success">
            {Math.round(stats.streakIntensity * 100)}%
          </Text>
        </View>
      </View>

      <PaywallModal
        featureTrigger="Escudo de Sol (Proteção de Sequência)"
        onClose={() => setIsPaywallOpen(false)}
        visible={isPaywallOpen}
      />
    </>
  );
}
