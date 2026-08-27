import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { PaywallModal } from "@/components/ui/paywall-modal";
import { ProBadge } from "@/components/ui/pro-badge";
import { COLORS } from "@/constants/colors";
import { useUserProgress } from "@/hooks/use-user-progress";
import { formatLevelLabel } from "@/services/progress";
import { useSubscriptionStore } from "@/store/use-subscription-store";

export function AppHeader() {
  const progress = useUserProgress();
  const router = useRouter();
  const isPro = useSubscriptionStore((state) => state.isPro);
  const [paywallOpen, setPaywallOpen] = useState(false);

  return (
    <View className="bg-background px-5 pb-3 pt-3">
      <PaywallModal
        onClose={() => setPaywallOpen(false)}
        visible={paywallOpen}
      />

      <View
        className="min-h-12 flex-row items-center justify-between"
        style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}
      >
        <View className="min-w-0 flex-1 flex-row items-center">
          <Image
            accessibilityLabel="Símbolo KYNIO"
            resizeMode="cover"
            source={require("../../assets/images/icon-kynio-v1.png")}
            style={{ borderRadius: 16, height: 44, width: 44 }}
          />
          <View className="ml-3 min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="font-headline text-xl leading-6 text-foreground">
                KYNIO
              </Text>
              {isPro ? <ProBadge size="small" /> : null}
            </View>
            <Text className="mt-0.5 font-body text-xs text-muted">
              {formatLevelLabel(progress)}
            </Text>
            <View
              accessibilityLabel={`${progress.currentXp} de ${progress.targetXp} XP neste nível`}
              accessibilityRole="progressbar"
              accessibilityValue={{
                max: progress.targetXp,
                min: 0,
                now: progress.currentXp,
              }}
              className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-border"
            >
              <View
                className="h-full rounded-full bg-xp"
                style={{ width: `${progress.progress * 100}%` }}
              />
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {!isPro ? (
            <Pressable
              accessibilityLabel="Desbloquear Aura Pro"
              accessibilityRole="button"
              className="flex-row items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-2 active:opacity-70"
              hitSlop={6}
              onPress={() => setPaywallOpen(true)}
            >
              <Text className="text-sm">👑</Text>
              <Text className="font-label text-xs font-bold text-emerald-400">
                PRO
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityLabel="Abrir definições de privacidade"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface active:opacity-70"
            hitSlop={8}
            onPress={() => router.push("/settings")}
            testID="privacy-settings-button"
          >
            <Ionicons
              color={COLORS.foreground}
              name="shield-checkmark-outline"
              size={21}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

