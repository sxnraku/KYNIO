import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/colors';
import { useLegalConsentStore } from '@/store/legal-consent-store';

const LEGAL_DISCLAIMER =
  'Esta app é uma ferramenta de acompanhamento pessoal de estilo de vida e gamificação. Não presta aconselhamento médico, nutricional ou de treino.';

export function LegalOnboardingModal() {
  const [isChecked, setIsChecked] = useState(false);
  const acceptTerms = useLegalConsentStore((state) => state.acceptTerms);
  const errorMessage = useLegalConsentStore((state) => state.errorMessage);
  const hasAcceptedTerms = useLegalConsentStore((state) => state.hasAcceptedTerms);
  const hydrateConsent = useLegalConsentStore((state) => state.hydrateConsent);
  const isAccepting = useLegalConsentStore((state) => state.isAccepting);
  const isHydrated = useLegalConsentStore((state) => state.isHydrated);
  const isLoading = useLegalConsentStore((state) => state.isLoading);

  useEffect(() => {
    if (!isHydrated && !isLoading) {
      void hydrateConsent();
    }
  }, [hydrateConsent, isHydrated, isLoading]);

  useEffect(() => {
    if (!hasAcceptedTerms) {
      setIsChecked(false);
    }
  }, [hasAcceptedTerms]);

  const isVisible = !isHydrated || !hasAcceptedTerms;

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => undefined}
      statusBarTranslucent
      transparent
      visible={isVisible}>
      <SafeAreaView className="flex-1 justify-end bg-black/80 px-4 pb-4">
        <View
          className="rounded-[32px] border border-border bg-surface p-6"
          style={{ alignSelf: 'center', maxWidth: 560, width: '100%' }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-border" />
          <View className="h-12 w-12 items-center justify-center rounded-2xl border border-success/20 bg-success/10">
            <Ionicons color={COLORS.success} name="shield-checkmark-outline" size={27} />
          </View>

          <Text className="mt-5 font-headline text-2xl text-foreground">Antes de começar</Text>

          {!isHydrated || isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={COLORS.success} size="large" />
              <Text className="mt-4 font-body text-sm text-muted">
                A preparar o armazenamento local…
              </Text>
            </View>
          ) : (
            <>
              <Text className="mt-3 font-body text-base leading-6 text-muted">
                {LEGAL_DISCLAIMER}
              </Text>

              <View className="mt-5 rounded-2xl border border-border bg-background p-4">
                <View className="flex-row items-start gap-3">
                  <Ionicons color={COLORS.success} name="lock-closed-outline" size={19} />
                  <Text className="flex-1 font-body text-sm leading-5 text-muted">
                    O histórico é guardado no dispositivo. Uma fotografia ou descrição só é
                    enviada à API quando pedes uma análise de refeição.
                  </Text>
                </View>
              </View>

              {errorMessage ? (
                <View
                  accessibilityLiveRegion="polite"
                  className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3">
                  <Text className="font-body text-sm leading-5 text-red-300">{errorMessage}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityLabel="Compreendo e aceito os termos"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isChecked }}
                className="mt-5 flex-row items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4 active:opacity-70"
                onPress={() => setIsChecked((current) => !current)}
                testID="legal-terms-checkbox">
                <View
                  className={`h-6 w-6 items-center justify-center rounded-md border ${
                    isChecked ? 'border-success bg-success' : 'border-muted bg-background'
                  }`}>
                  {isChecked ? (
                    <Ionicons color={COLORS.background} name="checkmark" size={18} />
                  ) : null}
                </View>
                <Text className="flex-1 font-headline text-base text-foreground">
                  Compreendo e aceito os termos.
                </Text>
              </Pressable>

              <Pressable
                accessibilityLabel="Entrar"
                accessibilityRole="button"
                accessibilityState={{ disabled: !isChecked || isAccepting }}
                className={`mt-4 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl px-5 ${
                  isChecked && !isAccepting
                    ? 'bg-success active:opacity-80'
                    : 'bg-border opacity-60'
                }`}
                disabled={!isChecked || isAccepting}
                onPress={() => void acceptTerms()}
                testID="legal-enter-button">
                {isAccepting ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : null}
                <Text className="font-headline text-base text-background">
                  {isAccepting ? 'A guardar…' : 'Entrar'}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}
