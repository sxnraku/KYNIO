import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FastCompletionShareCard } from "@/components/ui/fast-completion-share-card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import { shareFastCompletionCard } from "@/services/fastShareService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import type { CompletedFastSummary } from "@/store/useFastingStore";

interface FastCompletionModalProps {
  onClose: () => void;
  summary: CompletedFastSummary | null;
  visible: boolean;
}

export function FastCompletionModal({
  onClose,
  summary,
  visible,
}: FastCompletionModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const isEn = language === "en";

  const cardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  if (!summary) {
    return null;
  }

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    setShareError(null);
    setShareStatus(null);

    try {
      const result = await shareFastCompletionCard(cardRef, summary, language);
      if (result.mode !== "cancelled" && result.statusMessage) {
        setShareStatus(result.statusMessage);
      }
    } catch (error: unknown) {
      setShareError(
        error instanceof Error
          ? error.message
          : "Não foi possível preparar a partilha.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <SafeAreaView className="flex-1 bg-black/80 px-4 py-4">
        <View
          className="flex-1 overflow-hidden rounded-[32px] border border-border bg-surface"
          style={{ alignSelf: "center", maxWidth: 480, width: "100%" }}
        >
          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header de Celebração */}
            <View className="mb-4 items-center">
              <View className="mb-3 h-1 w-10 self-center rounded-full bg-border" />
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-xp/10">
                <Ionicons color={COLORS.xp} name="flame" size={26} />
              </View>
              <Text className="mt-3 font-headline text-2xl text-foreground">
                {isEn ? "Fast Completed! ☀️" : "Jejum Concluído! ☀️"}
              </Text>
              <Text className="mt-1 text-center font-body text-sm text-muted">
                {isEn
                  ? "Outstanding consistency. Here is your circadian share card."
                  : "Excelente consistência. Aqui está o teu cartão circadiano."}
              </Text>
            </View>

            {/* Cartão Renderizado */}
            <View className="my-2">
              <FastCompletionShareCard ref={cardRef} summary={summary} />
            </View>

            {/* Ações de Partilha */}
            <View className="mt-5 gap-2.5">
              <Pressable
                accessibilityRole="button"
                className="min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-xp px-5 active:opacity-80"
                disabled={isSharing}
                onPress={() => void handleShare()}
                testID="share-fast-button"
              >
                {isSharing ? (
                  <ActivityIndicator color={COLORS.surface} size="small" />
                ) : (
                  <Ionicons
                    color={COLORS.surface}
                    name="share-social"
                    size={20}
                  />
                )}
                <Text className="font-headline text-base text-surface">
                  {isSharing
                    ? isEn
                      ? "Preparing..."
                      : "A preparar imagem…"
                    : isEn
                      ? "Share Achievement (Stories / WhatsApp)"
                      : "Partilhar Conquista (Stories / WhatsApp)"}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="min-h-12 items-center justify-center rounded-2xl border border-border bg-background px-4 active:opacity-70"
                onPress={onClose}
                testID="close-fast-completion-button"
              >
                <Text className="font-headline text-sm text-foreground">
                  {isEn ? "Continue to App" : "Continuar para a app"}
                </Text>
              </Pressable>
            </View>

            {shareStatus ? (
              <Text className="mt-3 text-center font-body text-xs text-success">
                {shareStatus}
              </Text>
            ) : null}

            {shareError ? (
              <Text className="mt-3 text-center font-body text-xs text-red-500">
                {shareError}
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
