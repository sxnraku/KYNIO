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
import {
  PAYWALL_PRO_FEATURES,
  PAYWALL_COMPARISON_ROWS,
} from "@/components/ui/paywall-modal-data";
import { useSubscriptionStore, SubscriptionTier } from "@/store/use-subscription-store";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import {
  fetchStoreOfferings,
  buySubscriptionSku,
  buyOneTimeProductSku,
  buyConsumableProductSku,
  restoreActivePurchases,
  confirmPurchaseTransaction,
  IAP_SKUS,
  type FormattedOfferings,
} from "@/services/inAppPurchaseService";
import { openStripeCheckout } from "@/services/stripeSubscriptionService";
import { verifyPurchaseWithServer } from "@/services/purchaseVerificationService";
import { translateText } from "@/services/i18n";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  featureTrigger?: string;
}

export function PaywallModal({ visible, onClose, featureTrigger }: PaywallModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>("annual");
  const [isProcessing, setIsProcessing] = useState(false);
  const [offerings, setOfferings] = useState<FormattedOfferings>({});

  const activateSubscription = useSubscriptionStore((state) => state.activateSubscription);
  const activateFreeTrial = useSubscriptionStore((state) => state.activateFreeTrial);
  const trialStartedAt = useSubscriptionStore((state) => state.trialStartedAt);
  const addBonusAiScans = useSubscriptionStore((state) => state.addBonusAiScans);
  const addEmergencyShield = useSubscriptionStore((state) => state.addEmergencyShield);

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
        const opened = openStripeCheckout(selectedPlan);
        if (opened) {
          setIsProcessing(false);
          return;
        }

        if (selectedPlan === "annual" && hasTrialAvailable) {
          activateFreeTrial();
        } else {
          activateSubscription(selectedPlan);
        }
        Alert.alert(
          language === "en" ? "Welcome to Kynio Sol Pro! 👑" : "Bem-vindo ao Kynio Sol Pro! 👑",
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

        await confirmPurchaseTransaction(purchase, false);
        activateSubscription(
          selectedPlan,
          undefined,
          purchase.purchaseToken,
          purchase.transactionId,
        );

        Alert.alert(
          language === "en" ? "Welcome to Kynio Sol Pro! 👑" : "Bem-vindo ao Kynio Sol Pro! 👑",
          language === "en"
            ? "Your Pro plan is now active across all features and logs."
            : "O teu plano Pro está ativo em todos os teus registos e funcionalidades.",
          [{ text: language === "en" ? "Continue" : "Continuar", onPress: onClose }]
        );
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
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

  const handleBuyConsumable = async (type: "aiPack" | "shield") => {
    setIsProcessing(true);
    try {
      if (Platform.OS === "web") {
        if (type === "aiPack") addBonusAiScans(20);
        else addEmergencyShield(1);
        Alert.alert(
          language === "en" ? "Pack Activated! 🎉" : "Pack Ativado! 🎉",
          language === "en"
            ? type === "aiPack"
              ? "20 bonus AI Scans added to your account."
              : "Emergency Streak Shield added to your account."
            : type === "aiPack"
            ? "20 análises de IA adicionadas à tua conta."
            : "Escudo de Emergência adicionado à tua conta.",
          [{ text: "OK" }]
        );
        return;
      }

      const sku = type === "aiPack" ? IAP_SKUS.AI_PACK_20 : IAP_SKUS.STREAK_SHIELD_PACK;
      const purchase = await buyConsumableProductSku(sku);

      if (purchase) {
        if (purchase.purchaseToken) {
          await verifyPurchaseWithServer(
            { productId: purchase.productId, purchaseToken: purchase.purchaseToken },
            "product",
          );
        }
        await confirmPurchaseTransaction(purchase, true);

        if (type === "aiPack") {
          addBonusAiScans(20);
        } else {
          addEmergencyShield(1);
        }

        Alert.alert(
          language === "en" ? "Purchase Successful! 🎉" : "Compra Concluída! 🎉",
          language === "en"
            ? type === "aiPack"
              ? "20 bonus AI Scans added to your balance."
              : "Emergency Streak Shield added to your balance."
            : type === "aiPack"
            ? "20 análises de IA adicionadas ao teu saldo."
            : "Escudo de Emergência adicionado ao teu saldo.",
          [{ text: "OK" }]
        );
      }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err?.code !== "E_USER_CANCELLED") {
        console.warn("[IAP] Consumable error:", error);
        Alert.alert(
          language === "en" ? "Purchase Failed" : "Não foi possível concluir a compra",
          language === "en"
            ? "The transaction could not be completed. Please try again."
            : "A transação não pôde ser concluída. Por favor tenta novamente.",
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
            <AppText style={styles.title}>KYNIO SOL PRO</AppText>
            <AppText style={styles.subtitle}>
              {featureTrigger
                ? language === "en"
                  ? `Unlock ${translateText(featureTrigger, language)} and all premium tools.`
                  : `Desbloqueia ${featureTrigger} e todas as ferramentas premium.`
                : language === "en"
                ? "Elevate your fasting and nutrition to the next level with unlimited AI."
                : "Leva o teu jejum e nutrição ao próximo nível com IA ilimitada."}
            </AppText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeText}>✕</AppText>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Comparison Table (Gratuito vs Sol Pro) */}
            <AppText style={styles.sectionLabel}>
              {translateText("COMPARAÇÃO DE PLANOS", language)}
            </AppText>
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonHeader}>
                <AppText style={styles.compHeadColFeature}>
                  {language === "en" ? "FEATURE" : "FUNCIONALIDADE"}
                </AppText>
                <AppText style={styles.compHeadColFree}>
                  {translateText("GRATUITO", language)}
                </AppText>
                <AppText style={styles.compHeadColPro}>
                  SOL PRO 👑
                </AppText>
              </View>
              {PAYWALL_COMPARISON_ROWS.map((row, idx) => (
                <View
                  key={row.feature}
                  style={[
                    styles.compRow,
                    idx === PAYWALL_COMPARISON_ROWS.length - 1 && styles.compRowLast,
                  ]}
                >
                  <AppText style={styles.compFeatureText}>
                    {translateText(row.feature, language)}
                  </AppText>
                  <AppText style={styles.compFreeText}>
                    {translateText(row.free, language)}
                  </AppText>
                  <AppText style={styles.compProText}>
                    {translateText(row.pro, language)}
                  </AppText>
                </View>
              ))}
            </View>

            {/* Feature Highlights */}
            <View style={styles.featuresContainer}>
              {PAYWALL_PRO_FEATURES.slice(0, 4).map((item) => (
                <View key={item.title} style={styles.featureRow}>
                  <AppText
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={styles.featureIcon}
                  >
                    {item.icon}
                  </AppText>
                  <View style={styles.featureTextContainer}>
                    <AppText style={styles.featureTitle}>
                      {translateText(item.title, language)}
                    </AppText>
                    <AppText style={styles.featureDesc}>
                      {translateText(item.desc, language)}
                    </AppText>
                  </View>
                </View>
              ))}
            </View>

            {/* Plan Selector */}
            <AppText style={styles.sectionLabel}>
              {language === "en" ? "CHOOSE YOUR PLAN" : "ESCOLHE O TEU PLANO"}
            </AppText>

            {/* Annual Plan (Featured with daily anchor) */}
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

                  {/* Daily Anchor */}
                  <View style={styles.dailyAnchorContainer}>
                    <AppText style={styles.dailyAnchorPrice}>
                      {translateText("Apenas 0,09 € / dia", language)}
                    </AppText>
                    <AppText style={styles.dailyAnchorSub}>
                      {translateText("Menos de 1 café por mês", language)}
                    </AppText>
                  </View>
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

            {/* Lifetime Plan (Founder Offer) */}
            <Pressable
              onPress={() => setSelectedPlan("lifetime")}
              style={[
                styles.planCard,
                selectedPlan === "lifetime" && styles.planCardSelected,
              ]}
            >
              <View style={styles.founderBadge}>
                <AppText style={styles.founderBadgeText}>
                  {translateText("OFERTA DE FUNDADOR (BETA)", language)}
                </AppText>
              </View>
              <View style={styles.planHeader}>
                <View style={styles.planInfoContainer}>
                  <AppText style={styles.planName}>
                    {language === "en" ? "Lifetime Access" : "Acesso Vitalício"}
                  </AppText>
                  <AppText style={styles.planTrial}>
                    {translateText("ACESSO VITALÍCIO · SEMPRE TEU", language)}
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

            {/* Zero-Risk Guarantee Box */}
            <View style={styles.zeroRiskBox}>
              <AppText style={styles.zeroRiskTitle}>
                {translateText("0 € cobrados hoje · 7 dias para testar grátis", language)}
              </AppText>
              <AppText style={styles.zeroRiskSub}>
                {translateText("Cancela em 1 toque na Google Play", language)}
              </AppText>
            </View>

            {/* CTA Button */}
            <Pressable
              onPress={handlePurchase}
              disabled={isProcessing}
              style={styles.ctaButton}
            >
              <AppText style={styles.ctaButtonText}>
                {selectedPlan === "annual" && hasTrialAvailable
                  ? language === "en"
                    ? "Try 7 Days Free"
                    : "Experimentar 7 Dias Grátis"
                  : isProcessing
                  ? language === "en"
                    ? "Processing…"
                    : "A processar…"
                  : language === "en"
                  ? "Unlock Sol Pro"
                  : "Desbloquear Sol Pro"}
              </AppText>
            </Pressable>



            {/* Disclaimer & Legal Links */}
            <AppText style={styles.disclaimerText}>
              {language === "en"
                ? "Auto-renewing subscription via your Google Play account. Cancel anytime in Play Store settings at least 24h in advance."
                : "Subscrição com renovação automática através da tua conta Google Play. Cancela a qualquer momento nas definições da Play Store com pelo menos 24h de antecedência."}
            </AppText>

            <View style={styles.legalLinksRow}>
              <Pressable onPress={() => Linking.openURL("https://sxnraku.github.io/KYNIO/privacy.html")}>
                <AppText style={styles.legalLink}>
                  {language === "en" ? "Privacy" : "Privacidade"}
                </AppText>
              </Pressable>
              <AppText style={styles.legalDot}>•</AppText>
              <Pressable onPress={() => Linking.openURL("https://sxnraku.github.io/KYNIO/terms.html")}>
                <AppText style={styles.legalLink}>
                  {language === "en" ? "Terms" : "Termos"}
                </AppText>
              </Pressable>
              <AppText style={styles.legalDot}>•</AppText>
              <Pressable onPress={handleRestore}>
                <AppText style={styles.legalLink}>
                  {language === "en" ? "Restore" : "Restaurar"}
                </AppText>
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
    color: "#F1E9D6",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    color: "#A79D88",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 22,
    marginBottom: 10,
  },
  comparisonContainer: {
    backgroundColor: "#221D17",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3A3428",
    padding: 14,
    marginBottom: 14,
  },
  comparisonHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#3A3428",
    paddingBottom: 8,
    marginBottom: 8,
  },
  compHeadColFeature: {
    flex: 2,
    fontSize: 10,
    fontWeight: "700",
    color: "#A79D88",
    letterSpacing: 0.8,
  },
  compHeadColFree: {
    flex: 1.2,
    fontSize: 10,
    fontWeight: "700",
    color: "#7A7263",
    textAlign: "center",
  },
  compHeadColPro: {
    flex: 1.6,
    fontSize: 10,
    fontWeight: "800",
    color: "#E8A83E",
    textAlign: "right",
  },
  compRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(58, 52, 40, 0.4)",
  },
  compRowLast: {
    borderBottomWidth: 0,
  },
  compFeatureText: {
    flex: 2,
    fontSize: 12,
    color: "#F1E9D6",
    fontWeight: "500",
  },
  compFreeText: {
    flex: 1.2,
    fontSize: 11,
    color: "#7A7263",
    textAlign: "center",
  },
  compProText: {
    flex: 1.6,
    fontSize: 11,
    color: "#E8A83E",
    fontWeight: "700",
    textAlign: "right",
  },
  featuresContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2B2620",
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: "#F1E9D6",
    fontSize: 13.5,
    fontWeight: "700",
  },
  featureDesc: {
    color: "#A79D88",
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 15,
  },
  planCard: {
    backgroundColor: "#26221B",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#3A3428",
    padding: 16,
    marginBottom: 12,
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
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularBadgeText: {
    color: "#1C1915",
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  founderBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#D9922E",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  founderBadgeText: {
    color: "#1C1915",
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
  },
  planName: {
    color: "#F1E9D6",
    fontSize: 16,
    fontWeight: "700",
  },
  planTrial: {
    color: "#A79D88",
    fontSize: 12,
    marginTop: 3,
  },
  dailyAnchorContainer: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  dailyAnchorPrice: {
    color: "#E8A83E",
    fontSize: 13,
    fontWeight: "800",
  },
  dailyAnchorSub: {
    color: "#A79D88",
    fontSize: 11,
    fontStyle: "italic",
  },
  priceContainer: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  monthlyEquivalent: {
    color: "#F1E9D6",
    fontSize: 17,
    fontWeight: "800",
  },
  perMonthText: {
    color: "#A79D88",
    fontSize: 11,
  },
  zeroRiskBox: {
    backgroundColor: "rgba(232, 168, 62, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(232, 168, 62, 0.3)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  zeroRiskTitle: {
    color: "#F1E9D6",
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "center",
  },
  zeroRiskSub: {
    color: "#E8A83E",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 3,
    textAlign: "center",
  },
  ctaButton: {
    backgroundColor: "#E8A83E",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8A83E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: "#1C1915",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  disclaimerText: {
    color: "#7A7263",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
    marginTop: 14,
  },
  legalLinksRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 20,
    gap: 12,
  },
  legalLink: {
    color: "#A79D88",
    fontSize: 12,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  legalDot: {
    color: "#5A5243",
    fontSize: 12,
  },
});
