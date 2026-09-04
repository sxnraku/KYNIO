import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, type AppStateStatus, Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import { authenticateBiometric } from '@/services/biometricsService';
import { translateText } from '@/services/i18n';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useSubscriptionStore } from '@/store/use-subscription-store';

export function BiometricLockGuard() {
  const biometricLockEnabled = useAppPreferencesStore((state) => state.biometricLockEnabled);
  const language = useAppPreferencesStore((state) => state.language);
  const isPro = useSubscriptionStore((state) => state.isPro);

  const shouldProtect = biometricLockEnabled && isPro;
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isLocked = shouldProtect && !unlocked;

  const performUnlock = useCallback(async () => {
    setAuthError(null);
    const result = await authenticateBiometric(
      translateText('Desbloquear o KYNIO com biometria', language),
      translateText('Cancelar', language),
    );

    if (result.success) {
      setUnlocked(true);
      setAuthError(null);
    } else if (result.error) {
      setAuthError(result.error);
    }
  }, [language]);

  // Disparar autenticação logo na abertura se protegido
  useEffect(() => {
    if (shouldProtect) {
      void performUnlock();
    }
  }, [shouldProtect, performUnlock]);

  // Bloquear ao voltar de background
  useEffect(() => {
    if (!shouldProtect) {
      return;
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' || nextAppState === 'background') {
        setUnlocked(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [shouldProtect]);

  if (!shouldProtect || !isLocked) {
    return <View testID="biometric-guard-idle" style={{ height: 0, opacity: 0, width: 0 }} />;
  }

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      statusBarTranslucent
      transparent={false}
      visible={isLocked}
    >
      <View
        className="flex-1 items-center justify-between px-8 py-16"
        style={{ backgroundColor: COLORS.background }}
      >
        <View className="items-center pt-8">
          <Text className="font-label text-[11px] uppercase tracking-[0.3em] text-success">
            KYNIO · Sol Pro
          </Text>
          <Text className="mt-2 font-headline text-2xl text-foreground">
            {translateText('Cofre Biométrico', language)}
          </Text>
        </View>

        <View className="items-center">
          <View
            className="items-center justify-center rounded-full border-2 border-border p-8"
            style={{ backgroundColor: `${COLORS.success}10` }}
          >
            <Ionicons color={COLORS.success} name="finger-print" size={64} />
          </View>

          <Text className="mt-6 text-center font-headline text-base text-foreground">
            {translateText('Aplicação Bloqueada', language)}
          </Text>
          <Text className="mt-2 max-w-xs text-center font-body text-xs leading-5 text-muted">
            {translateText(
              'Usa a tua impressão digital ou biometria para aceder aos teus dados privados.',
              language,
            )}
          </Text>

          {authError ? (
            <Text className="mt-3 text-center font-body text-xs text-danger">
              {authError}
            </Text>
          ) : null}
        </View>

        <View className="w-full">
          <Pressable
            accessibilityRole="button"
            className="min-h-12 w-full flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80"
            onPress={() => void performUnlock()}
            style={{ backgroundColor: COLORS.foreground }}
            testID="biometric-unlock-button"
          >
            <Ionicons color={COLORS.background} name="lock-open-outline" size={18} />
            <Text
              className="font-headline text-sm font-semibold"
              style={{ color: COLORS.background }}
            >
              {translateText('Desbloquear com Biometria', language)}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
