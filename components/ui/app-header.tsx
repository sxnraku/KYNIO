import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { PaywallModal } from "@/components/ui/paywall-modal";
import { ProBadge } from "@/components/ui/pro-badge";
import { COLORS } from "@/constants/colors";
import { useUserProgress } from "@/hooks/use-user-progress";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";

export function AppHeader() {
  const progress = useUserProgress();
  const router = useRouter();
  const language = useAppPreferencesStore((state) => state.language);
  const isPro = useSubscriptionStore((state) => state.isPro);
  const [paywallOpen, setPaywallOpen] = useState(false);

  return (
    <View className="bg-background px-5 pb-3 pt-3">
      <PaywallModal
        onClose={() => setPaywallOpen(false)}
        visible={paywallOpen}
      />

      <View
        className="min-h-12"
        style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}
      >
        {/* Tira de estado: nível · classe · XP */}
        <View className="flex-row items-center justify-between">
          <View className="min-w-0 flex-1 flex-row items-center">
            <Image
              accessibilityLabel={translateText("Símbolo KYNIO", language)}
              resizeMode="cover"
              source={require("../../assets/images/icon-kynio-v1.png")}
              style={{ borderRadius: 9, height: 30, width: 30 }}
            />
            <Text
              className="ml-2.5 font-label text-[10px] uppercase text-foreground"
              numberOfLines={1}
              style={{ letterSpacing: 1.8 }}
              translate={false}
            >
              {`NÍVEL ${progress.level} · ${progress.levelTitle.toUpperCase()}`}
            </Text>
            {isPro ? (
              <View className="ml-2">
                <ProBadge size="small" />
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center gap-2">
            <Text
              accessibilityLabel={translateText(
                `${progress.currentXp} de ${progress.targetXp} XP neste nível`,
                language,
              )}
              className="font-label text-[10px] text-muted"
              style={{ letterSpacing: 1.4 }}
              translate={false}
            >
              {`${progress.currentXp} / ${progress.targetXp} XP`}
            </Text>

            {!isPro ? (
              <Pressable
                accessibilityLabel={translateText("Desbloquear Aura Pro", language)}
                accessibilityRole="button"
                className="flex-row items-center gap-1 rounded-lg border border-success/40 bg-success/10 px-2 py-1.5 active:opacity-70"
                hitSlop={6}
                onPress={() => setPaywallOpen(true)}
              >
                <Text
                  accessibilityElementsHidden
                  className="text-xs"
                  importantForAccessibility="no-hide-descendants"
                >
                  👑
                </Text>
                <Text className="font-label text-[10px] font-bold text-success">
                  PRO
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityLabel={translateText(
                "Abrir definições de privacidade",
                language,
              )}
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-lg active:opacity-70"
              hitSlop={8}
              onPress={() => router.push("/settings")}
              testID="privacy-settings-button"
            >
              <Ionicons
                color={COLORS.muted}
                name="shield-checkmark-outline"
                size={20}
              />
            </Pressable>
          </View>
        </View>

        {/* filete de progresso XP */}
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{
            max: progress.targetXp,
            min: 0,
            now: progress.currentXp,
          }}
          className="mt-2.5 h-0.5 w-full overflow-hidden rounded-full bg-border"
        >
          <View
            className="h-full rounded-full bg-success"
            style={{ width: `${Math.round(progress.progress * 100)}%` }}
          />
        </View>
      </View>
    </View>
  );
}
