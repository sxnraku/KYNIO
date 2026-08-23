import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrivacyNote } from '@/components/ui/privacy-note';
import { SettingsActionCard } from '@/components/ui/settings-action-card';
import { COLORS } from '@/constants/colors';
import { deleteAllLocalData, exportAllLocalData } from '@/services/dataPrivacyService';
import { useLegalConsentStore } from '@/store/legal-consent-store';
import { useUserProgressStore } from '@/store/user-progress-store';
import { useFastingStore } from '@/store/useFastingStore';

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleExport = async () => {
    if (isExporting || isDeleting) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsExporting(true);

    try {
      const fileName = await exportAllLocalData();
      setSuccessMessage(`Exportação preparada: ${fileName}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Não foi possível exportar os dados locais.'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || isExporting) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsDeleting(true);

    try {
      await deleteAllLocalData();
      useFastingStore.getState().resetFasting();
      useUserProgressStore.getState().resetProgress();
      router.replace('/(tabs)');
      useLegalConsentStore.getState().resetConsent();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Não foi possível eliminar todos os dados locais.'));
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Eliminar todos os dados?',
      'Esta ação elimina permanentemente jejuns, refeições, XP, perfil, consentimento, fotografias privadas e, se existir, a conta sincronizada. Não elimina ficheiros que já tenhas exportado e não pode ser anulada.',
      [
        { style: 'cancel', text: 'Cancelar' },
        {
          onPress: () => void handleDelete(),
          style: 'destructive',
          text: 'Eliminar definitivamente',
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View className="flex-row items-center border-b border-border px-5 pb-4 pt-3">
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-surface active:opacity-70"
          onPress={() => router.back()}>
          <Ionicons color={COLORS.foreground} name="arrow-back" size={20} />
        </Pressable>
        <Text className="ml-3 font-headline text-xl text-foreground">Privacidade e dados</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <View className="rounded-2xl border border-success/20 bg-success/5 p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <Ionicons color={COLORS.success} name="phone-portrait-outline" size={22} />
            </View>
            <View className="flex-1">
              <Text className="font-headline text-lg text-foreground">Privacidade e controlo</Text>
              <Text className="mt-1 font-body text-sm text-muted">
                Local por defeito · cloud opcional
              </Text>
            </View>
          </View>

          <View className="mt-5 gap-3">
            <Text className="font-body text-sm leading-5 text-muted">
              • Jejuns, refeições, progresso e fotografias confirmadas ficam sempre disponíveis
              neste dispositivo.
            </Text>
            <Text className="font-body text-sm leading-5 text-muted">
              • Ao ligares uma conta Google, perfil, amigos e registos são também sincronizados
              para permitir utilização em vários dispositivos.
            </Text>
            <Text className="font-body text-sm leading-5 text-muted">
              • A análise de refeição envia apenas a fotografia e/ou descrição escolhida para a
              API; o restante histórico não acompanha esse pedido.
            </Text>
            <Text className="font-body text-sm leading-5 text-muted">
              • A exportação abre o seletor do sistema; só sai do dispositivo quando escolhes um
              destino.
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View
            accessibilityLiveRegion="polite"
            className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <Text className="font-body text-sm leading-5 text-red-300">{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View
            accessibilityLiveRegion="polite"
            className="mt-4 rounded-xl border border-success/20 bg-success/10 p-4"
            testID="export-success-message">
            <Text className="font-body text-sm leading-5 text-foreground">{successMessage}</Text>
          </View>
        ) : null}

        <View className="mt-5">
          <SettingsActionCard
            description="Cria um ficheiro JSON com todo o histórico da SQLite local e abre as opções do sistema para o guardar."
            disabled={isDeleting}
            icon="download-outline"
            isLoading={isExporting}
            label="Exportar os meus Dados"
            onPress={() => void handleExport()}
            testID="export-data-button"
          />
        </View>

        <View className="mt-4">
          <SettingsActionCard
            description="Remove a base SQLite, fotografias privadas e, quando ligada, a conta e os dados sincronizados."
            destructive
            disabled={isExporting}
            icon="trash-outline"
            isLoading={isDeleting}
            label="Eliminar Todos os Dados"
            onPress={confirmDelete}
          />
        </View>

        <View className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
            Aviso legal
          </Text>
          <Text className="mt-3 font-body text-sm leading-6 text-muted">
            Esta app é uma ferramenta de acompanhamento pessoal de estilo de vida e gamificação.
            Não presta aconselhamento médico, nutricional ou de treino.
          </Text>
        </View>

        <PrivacyNote />
      </ScrollView>
    </SafeAreaView>
  );
}
