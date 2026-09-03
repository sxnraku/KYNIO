import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Switch, View } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrivacyNote } from "@/components/ui/privacy-note";
import { CloudAccountCard } from "@/components/ui/cloud-account-card";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { PreferenceControls } from "@/components/ui/preference-controls";
import { ProBadge } from "@/components/ui/pro-badge";
import { SettingsActionCard } from "@/components/ui/settings-action-card";
import { COLORS } from "@/constants/colors";
import {
  deleteAllLocalData,
  exportAllLocalData,
} from "@/services/dataPrivacyService";
import {
  cancelHydrationReminders,
  requestNotificationPermission,
  scheduleHydrationReminders,
} from "@/services/fastingNotificationService";
import { openHealthConnectSettings } from "@/services/healthConnectService";
import { exportClinicalReportPdf } from "@/services/healthReportPdfService";
import { translateText } from "@/services/i18n";
import {
  IAP_SKUS,
  restoreActivePurchases,
} from "@/services/inAppPurchaseService";
import { getLegalDocumentUrl, type LegalDocument } from "@/services/legalLinks";
import { verifyPurchaseWithServer } from "@/services/purchaseVerificationService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useGuidedTutorialStore } from "@/store/guided-tutorial-store";
import { useLegalConsentStore } from "@/store/legal-consent-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";
import { useUserProgressStore } from "@/store/user-progress-store";
import { useFastingStore } from "@/store/useFastingStore";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function SettingsScreen() {
  const router = useRouter();
  const hydrationRemindersEnabled = useAppPreferencesStore(
    (state) => state.hydrationRemindersEnabled,
  );
  const healthConnectEnabled = useAppPreferencesStore(
    (state) => state.healthConnectEnabled,
  );
  const setHealthConnectEnabled = useAppPreferencesStore(
    (state) => state.setHealthConnectEnabled,
  );
  const language = useAppPreferencesStore((state) => state.language);
  const setHydrationRemindersEnabled = useAppPreferencesStore(
    (state) => state.setHydrationRemindersEnabled,
  );
  const isPro = useSubscriptionStore((state) => state.isPro);
  const tier = useSubscriptionStore((state) => state.tier);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRestorePurchases = async () => {
    if (isRestoring || isDeleting || isExporting) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRestoring(true);

    try {
      const result = await restoreActivePurchases();

      if (!result.hasActiveSubscription || result.tier === "free") {
        Alert.alert(
          translateText("Sem compras ativas", language),
          translateText(
            "Não foram encontradas compras ou subscrições ativas para esta conta Google.",
            language,
          ),
        );
        return;
      }

      const tierSku =
        result.tier === "lifetime"
          ? IAP_SKUS.LIFETIME_PRODUCT
          : result.tier === "annual"
            ? IAP_SKUS.ANNUAL_SUBSCRIPTION
            : IAP_SKUS.MONTHLY_SUBSCRIPTION;
      const restoredPurchase = result.purchases.find(
        (purchase) => purchase.productId === tierSku && purchase.purchaseToken,
      );

      // Replica o fluxo do paywall: verificação server-side antes de ativar.
      if (restoredPurchase?.purchaseToken) {
        const verification = await verifyPurchaseWithServer(
          {
            productId: restoredPurchase.productId,
            purchaseToken: restoredPurchase.purchaseToken,
          },
          result.tier === "lifetime" ? "product" : "subscription",
        );

        if (verification === "invalid") {
          Alert.alert(
            translateText("Erro ao restaurar", language),
            translateText(
              "Não foi possível validar a compra restaurada. Tenta novamente.",
              language,
            ),
          );
          return;
        }
      }

      useSubscriptionStore.getState().activateSubscription(
        result.tier,
        undefined,
        restoredPurchase?.purchaseToken,
        restoredPurchase?.transactionId,
      );
      Alert.alert(
        translateText("Compras restauradas", language),
        translateText(
          "A tua subscrição Pro foi restaurada neste dispositivo.",
          language,
        ),
      );
    } catch {
      Alert.alert(
        translateText("Erro ao restaurar", language),
        translateText(
          "Não foi possível verificar as compras. Verifica a ligação à internet e tenta novamente.",
          language,
        ),
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const openLegalDocument = async (document: LegalDocument) => {
    try {
      setErrorMessage(null);
      await Linking.openURL(getLegalDocumentUrl(document));
    } catch {
      setErrorMessage("Não foi possível abrir o documento. Tenta novamente.");
    }
  };

  const handleExport = async () => {
    if (isExporting || isDeleting) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsExporting(true);

    try {
      const fileName = await exportAllLocalData();
      setSuccessMessage(
        language === "en"
          ? `Export ready: ${fileName}`
          : `Exportação preparada: ${fileName}`,
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          language === "en"
            ? "Could not export local data."
            : "Não foi possível exportar os dados locais.",
        ),
      );
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
      useGuidedTutorialStore.getState().resetTutorial();
      router.replace("/(tabs)");
      useLegalConsentStore.getState().resetConsent();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          language === "en"
            ? "Could not delete all local data."
            : "Não foi possível eliminar todos os dados locais.",
        ),
      );
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      translateText("Eliminar todos os dados?", language),
      translateText(
        "Esta ação elimina permanentemente jejuns, refeições, peso, XP, perfil, consentimento, fotografias privadas e, se existir, a conta sincronizada. Não elimina ficheiros que já tenhas exportado e não pode ser anulada.",
        language,
      ),
      [
        { style: "cancel", text: translateText("Cancelar", language) },
        {
          onPress: () => void handleDelete(),
          style: "destructive",
          text: translateText("Eliminar definitivamente", language),
        },
      ],
    );
  };

  const handleHydrationRemindersToggle = async (enabled: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!enabled) {
      setHydrationRemindersEnabled(false);
      await cancelHydrationReminders();
      return;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      setHydrationRemindersEnabled(false);
      setErrorMessage(
        translateText(
          "Ativa as notificações nas definições do sistema para receberes lembretes de hidratação.",
          language,
        ),
      );
      return;
    }

    setHydrationRemindersEnabled(true);
    await scheduleHydrationReminders();
  };

  const handleExportPdf = async () => {
    if (isGeneratingPdf || isDeleting || isExporting) {
      return;
    }

    try {
      setIsGeneratingPdf(true);
      await exportClinicalReportPdf(language);
    } catch {
      Alert.alert(
        translateText("Erro", language),
        translateText(
          "Não foi possível gerar o relatório clínico em PDF.",
          language,
        ),
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center border-b border-border px-5 pb-4 pt-3">
        <Pressable
          accessibilityLabel={translateText("Voltar", language)}
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-surface active:opacity-70"
          onPress={() => router.back()}
        >
          <Ionicons color={COLORS.foreground} name="arrow-back" size={20} />
        </Pressable>
        <Text className="ml-3 font-headline text-xl text-foreground">
          {translateText("Definições", language)}
        </Text>
      </View>

      <PaywallModal
        onClose={() => setPaywallOpen(false)}
        visible={paywallOpen}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription / Pro Card */}
        <View className="mb-5 rounded-2xl border border-success/30 bg-success/5 p-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-success/15 border border-success/30">
                <Text
                  accessibilityElementsHidden
                  className="text-xl"
                  importantForAccessibility="no-hide-descendants"
                >
                  👑
                </Text>
              </View>
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-headline text-base text-foreground">
                    KYNIO SOL PRO
                  </Text>
                  {isPro ? <ProBadge size="small" /> : null}
                </View>
                <Text className="font-body text-xs text-muted">
                  {isPro
                    ? language === "en"
                      ? `Active plan (${tier}) · Full access`
                      : `Plano ativo (${tier}) · Acesso total`
                    : language === "en"
                    ? "Unlimited AI, all fasts and exclusive themes"
                    : "IA ilimitada, todos os jejuns e temas exclusivos"}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => setPaywallOpen(true)}
              className="rounded-xl bg-success px-3.5 py-2 active:opacity-80"
            >
              <Text className="font-label text-xs font-bold" style={{ color: "#3A2200" }}>
                {isPro
                  ? language === "en"
                    ? "Manage"
                    : "Gerir"
                  : language === "en"
                  ? "Unlock"
                  : "Desbloquear"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-5">
          <SettingsActionCard
            description={translateText("Recupera a subscrição ou compra Pro ativa na tua conta Google Play.", language)}
            disabled={isDeleting || isExporting}
            icon="refresh-outline"
            isLoading={isRestoring}
            label={translateText("Restaurar compras", language)}
            onPress={() => void handleRestorePurchases()}
            testID="restore-purchases-button"
          />
        </View>

        <PreferenceControls />

        {/* Lembretes de hidratação */}
        <View className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <Ionicons color={COLORS.success} name="water-outline" size={21} />
            </View>
            <View className="flex-1 pr-3">
              <Text className="font-headline text-base text-foreground">
                {translateText("Lembretes de hidratação", language)}
              </Text>
              <Text className="mt-1 font-body text-xs leading-4 text-muted">
                {translateText(
                  "Pausas diárias para um copo de água às 10:00, 13:00, 16:00 e 19:00.",
                  language,
                )}
              </Text>
            </View>
            <Switch
              accessibilityLabel={translateText(
                "Lembretes de hidratação",
                language,
              )}
              onValueChange={(value) =>
                void handleHydrationRemindersToggle(value)
              }
              testID="hydration-reminders-toggle"
              thumbColor={
                hydrationRemindersEnabled ? COLORS.surfaceRaised : COLORS.muted
              }
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              value={hydrationRemindersEnabled}
            />
          </View>
        </View>

        {/* Google Health Connect */}
        <View className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <Ionicons color={COLORS.success} name="fitness-outline" size={21} />
            </View>
            <View className="flex-1 pr-3">
              <Text className="font-headline text-base text-foreground">
                Google Health Connect
              </Text>
              <Text className="mt-1 font-body text-xs leading-4 text-muted">
                {language === 'en'
                  ? 'Import weight from smart scales and workouts from smartwatches.'
                  : 'Importa peso de balanças inteligentes e treinos de smartwatches.'}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Google Health Connect"
              onValueChange={(value) => {
                setHealthConnectEnabled(value);
                if (value) {
                  void openHealthConnectSettings();
                }
              }}
              thumbColor={
                healthConnectEnabled ? COLORS.surfaceRaised : COLORS.muted
              }
              trackColor={{ false: COLORS.border, true: COLORS.success }}
              value={healthConnectEnabled}
            />
          </View>
        </View>

        <View className="mt-5">
          <SettingsActionCard
            description={translateText("Volta a apresentar o guia de Jejum, Refeições, Treinos, Progresso e Privacidade.", language)}
            icon="compass-outline"
            isLoading={false}
            label={translateText("Rever tutorial guiado", language)}
            onPress={() =>
              useGuidedTutorialStore.getState().restartTutorial()
            }
            testID="replay-tutorial-button"
          />
        </View>

        <View className="mt-5">
          <CloudAccountCard onLocalDataChanged={() => undefined} />
        </View>

        <View className="mt-5 rounded-2xl border border-success/20 bg-success/5 p-5">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <Ionicons
                color={COLORS.success}
                name="phone-portrait-outline"
                size={22}
              />
            </View>
            <View className="flex-1">
              <Text className="font-headline text-lg text-foreground">
                {translateText("Privacidade e controlo", language)}
              </Text>
              <Text className="mt-1 font-body text-sm text-muted">
                {translateText("Local por defeito · cloud opcional", language)}
              </Text>
            </View>
          </View>

          <View className="mt-5 gap-3">
            <Text className="font-body text-sm leading-5 text-muted">
              {translateText("• Jejuns, refeições, peso, progresso e fotografias confirmadas ficam sempre disponíveis neste dispositivo.", language)}
            </Text>
            <Text className="font-body text-sm leading-5 text-muted">
              {translateText("• Ao ligares uma conta Google, perfil, peso e registos são também sincronizados para permitir utilização em vários dispositivos.", language)}
            </Text>
            <Text className="font-body text-sm leading-5 text-muted">
              {translateText("• A análise de refeição envia apenas a fotografia e/ou descrição escolhida, através do KYNIO, para a Google Gemini; o restante histórico e o ID da conta não acompanham esse pedido.", language)}
            </Text>
            <Text className="font-body text-sm leading-5 text-muted">
              {translateText("• A exportação abre o seletor do sistema; só sai do dispositivo quando escolhes um destino.", language)}
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <View
            accessibilityLiveRegion="polite"
            className="mt-4 rounded-xl border border-danger/20 bg-danger/10 p-4"
          >
            <Text className="font-body text-sm leading-5 text-danger">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {successMessage ? (
          <View
            accessibilityLiveRegion="polite"
            className="mt-4 rounded-xl border border-success/20 bg-success/10 p-4"
            testID="export-success-message"
          >
            <Text className="font-body text-sm leading-5 text-foreground">
              {successMessage}
            </Text>
          </View>
        ) : null}

        <View className="mt-5">
          <SettingsActionCard
            description={translateText("Gera um documento visual em PDF com médias de jejum, evolução do peso e macronutrientes para partilha com médicos ou nutricionistas.", language)}
            disabled={isDeleting || isExporting}
            icon="document-text-outline"
            isLoading={isGeneratingPdf}
            label={translateText("Relatório Clínico (PDF)", language)}
            onPress={() => void handleExportPdf()}
            testID="export-clinical-pdf-button"
          />
        </View>

        <View className="mt-4">
          <SettingsActionCard
            description={translateText("Cria um ficheiro JSON com todo o histórico da SQLite local e abre as opções do sistema para o guardar.", language)}
            disabled={isDeleting || isGeneratingPdf}
            icon="download-outline"
            isLoading={isExporting}
            label={translateText("Exportar os meus Dados (JSON)", language)}
            onPress={() => void handleExport()}
            testID="export-data-button"
          />
        </View>

        <View className="mt-4">
          <SettingsActionCard
            description={translateText("Remove a base SQLite, fotografias privadas e, quando ligada, a conta e os dados sincronizados.", language)}
            destructive
            disabled={isExporting}
            icon="trash-outline"
            isLoading={isDeleting}
            label={translateText("Eliminar Todos os Dados", language)}
            onPress={confirmDelete}
          />
        </View>

        <View className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
            {translateText("Aviso legal", language)}
          </Text>
          <Text className="mt-3 font-body text-sm leading-6 text-muted">
            {translateText("Esta app é uma ferramenta de acompanhamento pessoal de estilo de vida e gamificação. Não presta aconselhamento médico, nutricional ou de treino.", language)}
          </Text>
        </View>

        <View className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            {translateText("Documentos e suporte", language)}
          </Text>
          <View className="mt-3">
            {(
              [
                [
                  "Política de Privacidade",
                  "privacy",
                  "shield-checkmark-outline",
                ],
                ["Termos de Utilização", "terms", "document-text-outline"],
                [
                  "Eliminar conta pela web",
                  "account-deletion",
                  "person-remove-outline",
                ],
                ["Ajuda e suporte", "support", "help-circle-outline"],
              ] as const
            ).map(([label, document, icon], index) => (
              <Pressable
                accessibilityRole="link"
                className={`min-h-14 flex-row items-center py-3 active:opacity-70 ${
                  index > 0 ? "border-t border-border" : ""
                }`}
                key={document}
                onPress={() => void openLegalDocument(document)}
              >
                <Ionicons color={COLORS.success} name={icon} size={21} />
                <Text className="ml-3 flex-1 font-headline text-sm text-foreground">
                  {translateText(label, language)}
                </Text>
                <Ionicons color={COLORS.muted} name="open-outline" size={18} />
              </Pressable>
            ))}
          </View>
        </View>

        <PrivacyNote />
      </ScrollView>
    </SafeAreaView>
  );
}
