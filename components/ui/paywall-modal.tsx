import React, { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Linking,
} from "react-native";
import { AppText } from "@/components/ui/text";
import { useSubscriptionStore, SubscriptionTier } from "@/store/use-subscription-store";


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

import { useAppPreferencesStore } from "@/store/app-preferences-store";

export function PaywallModal({ visible, onClose, featureTrigger }: PaywallModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>("annual");
  const [isProcessing, setIsProcessing] = useState(false);

  const activateSubscription = useSubscriptionStore((state) => state.activateSubscription);
  const activateFreeTrial = useSubscriptionStore((state) => state.activateFreeTrial);
  const trialStartedAt = useSubscriptionStore((state) => state.trialStartedAt);
  const isPro = useSubscriptionStore((state) => state.isPro);

  const hasTrialAvailable = !trialStartedAt;

  const handlePurchase = () => {
    if (selectedPlan === "annual" && hasTrialAvailable) {
      Alert.alert(
        language === "en"
          ? "Confirm 7-Day Free Trial 🎁"
          : "Confirmar Teste Grátis de 7 Dias 🎁",
        language === "en"
          ? "Today you pay 0.00 €.\n\nYou'll get 7 days of full access to Kynio Aura Pro. If you choose to continue, the annual subscription of 34.99 €/year (only 2.91 €/month) will renew automatically at the end of the trial period.\n\nYou can cancel anytime in Google Play Subscriptions at no cost."
          : "Hoje pagarás 0,00 €.\n\nTerás 7 dias de acesso total ao Kynio Aura Pro. Se decidires continuar, a subscrição anual de 34,99 €/ano (apenas 2,91 €/mês) será renovada automaticamente no final do período experimental.\n\nPodes cancelar a qualquer momento nas Subscrições da Google Play sem qualquer custo.",
        [
          { text: language === "en" ? "Back" : "Voltar", style: "cancel" },
          {
            text: language === "en" ? "Confirm (0.00 € Today)" : "Confirmar (0,00 € Hoje)",
            onPress: () => {
              setIsProcessing(true);
              setTimeout(() => {
                setIsProcessing(false);
                activateFreeTrial();
                Alert.alert(
                  language === "en"
                    ? "Free Trial Active! 🎉"
                    : "Subscrição com Teste Grátis Ativa! 🎉",
                  language === "en"
                    ? "Your 7-day free trial has started. Welcome to KYNIO Aura Pro!"
                    : "O teu período experimental de 7 dias começou. Bem-vindo ao KYNIO Aura Pro!",
                  [{ text: language === "en" ? "Get Started" : "Começar a Usar", onPress: onClose }]
                );
              }, 600);
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      language === "en" ? "Confirm Subscription 👑" : "Confirmar Subscrição 👑",
      selectedPlan === "annual"
        ? language === "en"
          ? "Annual KYNIO Aura Pro: 34.99 €/year (2.91 €/month). Auto-renews yearly with free cancellation on Google Play."
          : "Subscrição Anual KYNIO Aura Pro: 34,99 €/ano (2,91 €/mês). Renovação automática anual com cancelamento livre na Google Play."
        : selectedPlan === "monthly"
        ? language === "en"
          ? "Monthly KYNIO Aura Pro: 4.99 €/month. Billed monthly with free cancellation on Google Play."
          : "Subscrição Mensal KYNIO Aura Pro: 4,99 €/mês. Cobrado mensalmente com cancelamento livre na Google Play."
        : language === "en"
        ? "Lifetime KYNIO Aura Pro: 69.99 € (one-time payment)."
        : "Acesso Vitalício KYNIO Aura Pro: 69,99 € (pagamento único).",
      [
        { text: language === "en" ? "Back" : "Voltar", style: "cancel" },
        {
          text: language === "en" ? "Confirm Purchase" : "Confirmar Compra",
          onPress: () => {
            setIsProcessing(true);
            setTimeout(() => {
              setIsProcessing(false);
              activateSubscription(selectedPlan);
              Alert.alert(
                language === "en"
                  ? "Welcome to Kynio Aura Pro! 👑"
                  : "Bem-vindo ao Kynio Aura Pro! 👑",
                language === "en"
                  ? "Your Pro plan is now active across all features and logs."
                  : "O teu plano Pro está ativo em todos os teus registos e funcionalidades.",
                [{ text: language === "en" ? "Continue" : "Continuar", onPress: onClose }]
              );
            }, 600);
          },
        },
      ]
    );
  };

  const handleRestore = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (isPro) {
        Alert.alert(
          language === "en" ? "Purchases Restored" : "Compras Restauradas",
          language === "en"
            ? "Your active Pro subscription has been restored."
            : "A tua subscrição Pro ativa foi restaurada."
        );
      } else {
        Alert.alert(
          language === "en" ? "No Subscriptions" : "Sem Subscrições",
          language === "en"
            ? "No active purchases found for this Google Play account."
            : "Não foram encontradas compras ativas para esta conta Google Play."
        );
      }
    }, 800);
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
              <AppText style={styles.crownEmoji}>👑</AppText>
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
                  <AppText style={styles.featureIcon}>{item.icon}</AppText>
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
                <AppText style={styles.popularBadgeText}>POUPA 42% · MAIS POPULAR</AppText>
              </View>
              <View style={styles.planHeader}>
                <View style={styles.planInfoContainer}>
                  <AppText style={styles.planName}>Plano Anual</AppText>
                  <AppText style={styles.planTrial}>
                    {hasTrialAvailable ? "7 Dias Grátis · Depois 34,99 €/ano" : "34,99 € / ano"}
                  </AppText>
                </View>
                <View style={styles.priceContainer}>
                  <AppText style={styles.monthlyEquivalent}>2,91 €</AppText>
                  <AppText style={styles.perMonthText}>/mês</AppText>
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
                  <AppText style={styles.planName}>Plano Mensal</AppText>
                  <AppText style={styles.planTrial}>Cobrado mensalmente · Cancela quando quiseres</AppText>
                </View>
                <View style={styles.priceContainer}>
                  <AppText style={styles.monthlyEquivalent}>4,99 €</AppText>
                  <AppText style={styles.perMonthText}>/mês</AppText>
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
                  <AppText style={styles.planName}>Acesso Vitalício</AppText>
                  <AppText style={styles.planTrial}>Pagamento único · Acesso permanente</AppText>
                </View>
                <View style={styles.priceContainer}>
                  <AppText style={styles.monthlyEquivalent}>69,99 €</AppText>
                  <AppText style={styles.perMonthText}>único</AppText>
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
    backgroundColor: "#121214",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  header: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f23",
  },
  crownBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderWidth: 1,
    borderColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  crownEmoji: {
    fontSize: 24,
  },
  title: {
    color: "#f4f4f5",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: "#a1a1aa",
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
    backgroundColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#a1a1aa",
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginTop: 16,
    marginBottom: 20,
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#27272a",
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
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "600",
  },
  featureDesc: {
    color: "#71717a",
    fontSize: 12,
    marginTop: 1,
  },
  sectionLabel: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },
  planCard: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#27272a",
    position: "relative",
  },
  planCardSelected: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.08)",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#10B981",
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
    color: "#f4f4f5",
    fontSize: 15,
    fontWeight: "700",
  },
  planTrial: {
    color: "#a1a1aa",
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
    color: "#f4f4f5",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
  },
  perMonthText: {
    color: "#71717a",
    fontSize: 11,
    textAlign: "right",
    marginTop: 1,
  },

  ctaButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
    shadowColor: "#10B981",
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
    color: "#71717a",
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
    color: "#a1a1aa",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  legalDot: {
    color: "#52525b",
    marginHorizontal: 8,
  },
});
