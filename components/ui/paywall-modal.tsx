import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Linking,
} from "react-native";
import { AppText } from "@/components/ui/text";
import { useSubscriptionStore, SubscriptionTier } from "@/store/use-subscription-store";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import {
  fetchStoreOfferings,
  buySubscriptionSku,
  buyOneTimeProductSku,
  restoreActivePurchases,
  confirmPurchaseTransaction,
  IAP_SKUS,
  type FormattedPlanInfo,
} from "@/services/inAppPurchaseService";
import { verifyPurchaseWithServer } from "@/services/purchaseVerificationService";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  featureTrigger?: string;
}

const PRO_FEATURES = [
  {
    icon: "🥗",
    title: "Análises de IA Ilimitadas",
    desc: "Fotografa e analisa refeições sem limites diários de tokens.",
  },
  {
    icon: "⏱️",
    title: "Todos os Protocolos de Jejum",
    desc: "Acesso a 36h Monge, 48h Reset, OMAD e Jejum Livre prolongado.",
  },
  {
    icon: "🧬",
    title: "Fases Metabólicas Detalhadas",
    desc: "Explicações biológicas aprofundadas, cetose e autofagia celular.",
  },
  {
    icon: "📊",
    title: "Métricas & Tendências Avançadas",
    desc: "Histórico completo de consistência, peso e estimativas nutricionais.",
  },
  {
    icon: "✨",
    title: "Temas Exclusivos Aura",
    desc: "Personaliza a interface com visuais Obsidian Glow e Emerald Neon.",
  },
  {
    icon: "☁️",
    title: "Sincronização em Nuvem",
    desc: "Cópia de segurança encriptada e sincronização multi-dispositivo.",
  },
];

export function PaywallModal({ visible, onClose, featureTrigger }: PaywallModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [offerings, setOfferings] = useState<{
    annual?: FormattedPlanInfo;
    monthly?: FormattedPlanInfo;
    lifetime?: FormattedPlanInfo;
  }>({});

  const activateSubscription = useSubscriptionStore((state) => state.activateSubscription);
  const activateFreeTrial = useSubscriptionStore((state) => state.activateFreeTrial);
  const trialStartedAt = useSubscriptionStore((state) => state.trialStartedAt);

  const hasTrialAvailable = !trialStartedAt;

  useEffect(() => {
    if (visible && Platform.OS !== "web") {
      fetchStoreOfferings()
        .then((data) => setOfferings(data))
        .catch(() => {});
    }
  }, [visible]);

  const handlePurchase = async () => {
    setIsProcessing(true);

    try {
      if (Platform.OS === "web") {
        // Fallback local for web testing
        if (selectedPlan === "annual" && hasTrialAvailable) {
          activateFreeTrial();
        } else {
          activateSubscription(selectedPlan);
        }
        Alert.alert(
          language === "en" ? "Welcome to Kynio Aura Pro! 👑" : "Bem-vindo ao Kynio Aura Pro! 👑",
          language === "en"
            ? "Your Pro plan is now active across all features and logs."
            : "O teu plano Pro está ativo em todos os teus registos e funcionalidades.",
          [{ text: language === "en" ? "Continue" : "Continuar", onPress: onClose }]
        );
        return;
      }

      let purchase = null;

      if (selectedPlan === "annual") {
        purchase = await buySubscriptionSku(
          IAP_SKUS.ANNUAL_SUBSCRIPTION,
          offerings.annual?.offerToken,
        );
      } else if (selectedPlan === "monthly") {
        purchase = await buySubscriptionSku(
          IAP_SKUS.MONTHLY_SUBSCRIPTION,
          offerings.monthly?.offerToken,
        );
      } else if (selectedPlan === "lifetime") {
        purchase = await buyOneTimeProductSku(IAP_SKUS.LIFETIME_PRODUCT);
      }

      if (purchase) {
        if (purchase.purchaseToken) {
          const verification = await verifyPurchaseWithServer(
            {
              productId: purchase.productId,
              purchaseToken: purchase.purchaseToken,
            },
            selectedPlan === "lifetime" ? "product" : "subscription",
          );

          if (verification === "invalid") {
            console.warn("[IAP] Compra rejeitada na verificação do servidor.");
            Alert.alert(
              language === "en" ? "Purchase Failed" : "Não foi possível concluir a compra",
              language === "en"
                ? "The transaction could not be completed. Please try again or check your payment method on Google Play."
                : "A transação não pôde ser concluída. Por favor tenta novamente ou verifica o método de pagamento no Google Play.",
            );
            return;
          }
        }

        await confirmPurchaseTransaction(purchase);
        activateSubscription(
          selectedPlan,
          undefined,
          purchase.purchaseToken,
          purchase.transactionId,
        );

        Alert.alert(
          language === "en" ? "Welcome to Kynio Aura Pro! 👑" : "Bem-vindo ao Kynio Aura Pro! 👑",
          language === "en"
            ? "Your Pro plan is now active across all features and logs."
            : "O teu plano Pro está ativo em todos os teus registos e funcionalidades.",
          [{ text: language === "en" ? "Continue" : "Continuar", onPress: onClose }]
        );
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      // Ignore user cancellations
      if (err?.code !== "E_USER_CANCELLED") {
        console.warn("[IAP] Purchase error:", error);
        Alert.alert(
          language === "en" ? "Purchase Failed" : "Não foi possível concluir a compra",
          language === "en"
            ? "The transaction could not be completed. Please try again or check your payment method on Google Play."
            : "A transação não pôde ser concluída. Por favor tenta novamente ou verifica o método de pagamento no Google Play.",
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      if (Platform.OS === "web") {
        Alert.alert(
          language === "en" ? "No Subscriptions" : "Sem Subscrições",
          language === "en"
            ? "No active purchases found for this account."
            : "Não foram encontradas compras ativas para esta conta.",
        );
        return;
      }

      const result = await restoreActivePurchases();

      if (result.hasActiveSubscription && result.tier !== "free") {
        const tierSku =
          result.tier === "lifetime"
            ? IAP_SKUS.LIFETIME_PRODUCT
            : result.tier === "annual"
            ? IAP_SKUS.ANNUAL_SUBSCRIPTION
            : IAP_SKUS.MONTHLY_SUBSCRIPTION;
        const restoredPurchase = result.purchases.find(
          (p) => p.productId === tierSku && p.purchaseToken,
        );

        if (restoredPurchase?.purchaseToken) {
          const verification = await verifyPurchaseWithServer(
            {
              productId: restoredPurchase.productId,
              purchaseToken: restoredPurchase.purchaseToken,
            },
            result.tier === "lifetime" ? "product" : "subscription",
          );

          if (verification === "invalid") {
            console.warn("[IAP] Restore rejeitado na verificação do servidor.");
            Alert.alert(
              language === "en" ? "No Active Subscriptions" : "Sem Subscrições Ativas",
              language === "en"
                ? "No active subscriptions found for this Google account."
                : "Não foram encontradas subscrições ativas para esta conta Google.",
            );
            return;
          }
        }

        activateSubscription(result.tier);
        Alert.alert(
          language === "en" ? "Purchases Restored! 🎉" : "Compras Restauradas! 🎉",
          language === "en"
            ? "Your active Google Play subscription has been successfully restored."
            : "A tua subscrição ativa da Google Play foi restaurada com sucesso.",
        );
      } else {
        Alert.alert(
          language === "en" ? "No Active Subscriptions" : "Sem Subscrições Ativas",
          language === "en"
            ? "No active subscriptions found for this Google account."
            : "Não foram encontradas subscrições ativas para esta conta Google.",
        );
      }
    } catch (error) {
      console.warn("[IAP] Restore error:", error);
      Alert.alert(
        language === "en" ? "Restore Failed" : "Erro ao Restaurar",
        language === "en"
          ? "Could not check subscriptions. Please check your internet connection."
          : "Não foi possível verificar as subscrições. Verifica a ligação à internet.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.crownBadge}>
              <AppText
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={styles.crownEmoji}
              >
                👑
              </AppText>
            </View>
            <AppText style={styles.title}>KYNIO AURA PRO</AppText>
            <AppText style={styles.subtitle}>
              {featureTrigger
                ? `Desbloqueia ${featureTrigger} e todas as ferramentas premium.`
                : "Leva o teu jejum e nutrição ao próximo nível com IA ilimitada."}
            </AppText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeText}>✕</AppText>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Feature List */}
            <View style={styles.featuresContainer}>
              {PRO_FEATURES.map((item, index) => (
                <View key={index} style={styles.featureRow}>
                  <AppText
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={styles.featureIcon}
                  >
                    {item.icon}
                  </AppText>
                  <View style={styles.featureTextContainer}>
                    <AppText style={styles.featureTitle}>{item.title}</AppText>
                    <AppText style={styles.featureDesc}>{item.desc}</AppText>
                  </View>
                </View>
              ))}
            </View>

            {/* Plan Selector */}
            <AppText style={styles.sectionLabel}>ESCOLHE O TEU PLANO</AppText>

            {/* Annual Plan (Featured) */}
            <Pressable
              onPress={() => setSelectedPlan("annual")}
              style={[
                styles.planCard,
                selectedPlan === "annual" && styles.planCardSelected,
              ]}
            >
              <View style={styles.popularBadge}>
                <AppText style={styles.popularBadgeText}>
                  {language === "en" ? "SAVE 42% · MOST POPULAR" : "POUPA 42% · MAIS POPULAR"}
                </AppText>
              </View>
              <View style={styles.planHeader}>
                <View style={styles.planInfoContainer}>
                  <AppText style={styles.planName}>
                    {language === "en" ? "Annual Plan" : "Plano Anual"}
                  </AppText>
                  <AppText style={styles.planTrial}>
                    {hasTrialAvailable
                      ? language === "en"
                        ? `7 Days Free · Then ${offerings.annual?.priceFormatted || "34.99 €"}/year`
                        : `7 Dias Grátis · Depois ${offerings.annual?.priceFormatted || "34,99 €"}/ano`
                      : language === "en"
                      ? `${offerings.annual?.priceFormatted || "34.99 €"} / year`
                      : `${offerings.annual?.priceFormatted || "34,99 €"} / ano`}
                  </AppText>
                </View>
                <View style={styles.priceContainer}>
                  <AppText style={styles.monthlyEquivalent}>
                    {offerings.annual?.monthlyEquivalentFormatted || (language === "en" ? "2.91 €" : "2,91 €")}
                  </AppText>
                  <AppText style={styles.perMonthText}>
                    {language === "en" ? "/mo" : "/mês"}
                  </AppText>
                </View>
              </View>
            </Pressable>

            {/* Monthly Plan */}
            <Pressable
              onPress={() => setSelectedPlan("monthly")}
              style={[
                styles.planCard,
                selectedPlan === "monthly" && styles.planCardSelected,
              ]}
            >
              <View style={styles.planHeader}>
                <View style={styles.planInfoContainer}>
                  <AppText style={styles.planName}>
                    {language === "en" ? "Monthly Plan" : "Plano Mensal"}
                  </AppText>
                  <AppText style={styles.planTrial}>
                    {language === "en" ? "Billed monthly · Cancel anytime" : "Cobrado mensalmente · Cancela quando quiseres"}
                  </AppText>
                </View>
                <View style={styles.priceContainer}>
                  <AppText style={styles.monthlyEquivalent}>
                    {offerings.monthly?.priceFormatted || (language === "en" ? "4.99 €" : "4,99 €")}
                  </AppText>
                  <AppText style={styles.perMonthText}>
                    {language === "en" ? "/mo" : "/mês"}
                  </AppText>
                </View>
              </View>
            </Pressable>

            {/* Lifetime Plan */}
            <Pressable
              onPress={() => setSelectedPlan("lifetime")}
              style={[
                styles.planCard,
                selectedPlan === "lifetime" && styles.planCardSelected,
              ]}
            >
              <View style={styles.planHeader}>
                <View style={styles.planInfoContainer}>
                  <AppText style={styles.planName}>
                    {language === "en" ? "Lifetime Access" : "Acesso Vitalício"}
                  </AppText>
                  <AppText style={styles.planTrial}>
                    {language === "en" ? "One-time payment · Permanent access" : "Pagamento único · Acesso permanente"}
                  </AppText>
                </View>
                <View style={styles.priceContainer}>
                  <AppText style={styles.monthlyEquivalent}>
                    {offerings.lifetime?.priceFormatted || (language === "en" ? "69.99 €" : "69,99 €")}
                  </AppText>
                  <AppText style={styles.perMonthText}>
                    {language === "en" ? "once" : "único"}
                  </AppText>
                </View>
              </View>
            </Pressable>


            {/* CTA Button */}
            <Pressable
              onPress={handlePurchase}
              disabled={isProcessing}
              style={styles.ctaButton}
            >
              <AppText style={styles.ctaButtonText}>
                {selectedPlan === "annual" && hasTrialAvailable
                  ? "Experimentar 7 Dias Grátis"
                  : isProcessing
                  ? "A processar…"
                  : "Desbloquear Aura Pro"}
              </AppText>
            </Pressable>

            {/* Disclaimer & Legal Links */}
            <AppText style={styles.disclaimerText}>
              Subscrição com renovação automática através da tua conta Google Play. Cancela a qualquer momento nas definições da Play Store com pelo menos 24h de antecedência.
            </AppText>

            <View style={styles.legalLinksRow}>
              <Pressable onPress={() => Linking.openURL("https://sxnraku.github.io/KYNIO/privacy.html")}>
                <AppText style={styles.legalLink}>Privacidade</AppText>
              </Pressable>
              <AppText style={styles.legalDot}>•</AppText>
              <Pressable onPress={() => Linking.openURL("https://sxnraku.github.io/KYNIO/terms.html")}>
                <AppText style={styles.legalLink}>Termos</AppText>
              </Pressable>
              <AppText style={styles.legalDot}>•</AppText>
              <Pressable onPress={handleRestore}>
                <AppText style={styles.legalLink}>Restaurar</AppText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#1C1915",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: "#3A3428",
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2B2620",
  },
  crownBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(232, 168, 62, 0.15)",
    borderWidth: 1,
    borderColor: "#E8A83E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  crownEmoji: {
    fontSize: 24,
  },
  title: {
    color: "#F1E9D6",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: "#A79D88",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    top: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3A3428",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#A79D88",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "#26221C",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3A3428",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: "#F1E9D6",
    fontSize: 14,
    fontWeight: "600",
  },
  featureDesc: {
    color: "#8D8471",
    fontSize: 12,
    marginTop: 1,
  },
  sectionLabel: {
    color: "#8D8471",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  planCard: {
    backgroundColor: "#26221C",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#3A3428",
    position: "relative",
  },
  planCardSelected: {
    borderColor: "#E8A83E",
    backgroundColor: "rgba(232, 168, 62, 0.08)",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#E8A83E",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularBadgeText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planInfoContainer: {
    flex: 1,
    paddingRight: 14,
  },
  planName: {
    color: "#F1E9D6",
    fontSize: 15,
    fontWeight: "700",
  },
  planTrial: {
    color: "#A79D88",
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  priceContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    flexShrink: 0,
    minWidth: 65,
  },
  monthlyEquivalent: {
    color: "#F1E9D6",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },
  perMonthText: {
    color: "#8D8471",
    fontSize: 11,
    textAlign: "right",
    marginTop: 1,
  },

  ctaButton: {
    backgroundColor: "#E8A83E",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
    shadowColor: "#E8A83E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  ctaButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  disclaimerText: {
    color: "#8D8471",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 14,
    marginBottom: 14,
  },
  legalLinksRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  legalLink: {
    color: "#A79D88",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  legalDot: {
    color: "#6B6353",
    marginHorizontal: 8,
  },
});
