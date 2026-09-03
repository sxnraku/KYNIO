import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { BadgeCard } from "@/components/ui/badge-card";
import { ConsistencyLine } from "@/components/ui/consistency-line";
import { FactualInsightsCard } from "@/components/ui/factual-insights-card";
import { FastingStatsOverview } from "@/components/ui/fasting-stats-overview";
import { LevelProgressCard } from "@/components/ui/level-progress-card";
import { PageTitle } from "@/components/ui/page-title";
import { PrivacyNote } from "@/components/ui/privacy-note";
import { Screen } from "@/components/ui/screen";
import { WeeklyChallengesCard } from "@/components/ui/weekly-challenges-card";
import { WeeklyFastingChart } from "@/components/ui/weekly-fasting-chart";
import { WeightTrackingCard } from "@/components/ui/weight-tracking-card";

import { XpRewardsCard } from "@/components/ui/xp-rewards-card";
import { COLORS } from "@/constants/colors";
import { useGamificationProgress } from "@/hooks/use-gamification-progress";
import { exportClinicalReportPdf } from "@/services/healthReportPdfService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";
import { PaywallModal } from "@/components/ui/paywall-modal";

export default function ProgressScreen() {
  const language = useAppPreferencesStore((state) => state.language);
  const isPro = useSubscriptionStore((state) => state.isPro);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const { error, isLoading, snapshot } = useGamificationProgress();

  const handleExportPdf = async () => {
    if (!isPro) {
      setIsPaywallOpen(true);
      return;
    }

    if (isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);
      await exportClinicalReportPdf(language);
    } catch {
      Alert.alert(
        translateText("Erro", language),
        translateText(
          "Não foi possível gerar o dossiê de hábitos em PDF.",
          language,
        ),
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Screen>
      <PageTitle
        description="Níveis, consistência e conquistas calculados apenas com os teus registos locais."
        title="Progresso"
      />

      {isLoading && !snapshot ? (
        <View className="mt-16 items-center">
          <ActivityIndicator color={COLORS.xp} size="large" />
          <Text className="mt-4 font-body text-sm text-muted">
            A calcular progresso local…
          </Text>
        </View>
      ) : null}

      {error ? (
        <View className="mt-7 rounded-2xl border border-danger/40 bg-danger/10 p-5">
          <Text className="font-headline text-lg text-danger">
            Progresso indisponível
          </Text>
          <Text className="mt-2 font-body text-sm leading-5 text-danger">
            {error}
          </Text>
        </View>
      ) : null}

      {snapshot ? (
        <>
          {/* Acesso a Relatório Clínico em PDF */}
          <View className="mt-7 flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4">
            <View className="flex-1 pr-3">
              <Text className="font-label text-[10px] uppercase tracking-wider text-success font-bold">
                {language === 'en' ? 'Habits & Consistency' : 'Hábitos & Consistência'}
              </Text>
              <Text className="mt-0.5 font-headline text-base text-foreground">
                {language === 'en'
                  ? 'Habits Dossier (PDF)'
                  : 'Dossiê de Hábitos (PDF)'}
              </Text>
              <Text className="mt-0.5 font-body text-xs text-muted">
                {language === 'en'
                  ? 'Visual report with fasting, weight and consistency logs.'
                  : 'Documento visual com médias de jejum, peso e consistência.'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center rounded-xl bg-success px-3.5 py-2.5 active:opacity-80 disabled:opacity-50"
              disabled={isGeneratingPdf}
              onPress={() => void handleExportPdf()}
            >
              {isGeneratingPdf ? (
                <ActivityIndicator color="#3A2200" size="small" />
              ) : (
                <>
                  <Ionicons
                    color="#3A2200"
                    name={!isPro ? "lock-closed" : "document-text"}
                    size={15}
                  />
                  <Text className="ml-1.5 font-label text-xs font-bold text-[#3A2200]">
                    {!isPro
                      ? language === "en"
                        ? "Export ✦"
                        : "Exportar ✦"
                      : language === "en"
                      ? "Export"
                      : "Exportar"}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* 4 Hero Stats: Jejuns, Jejum mais longo, Tempo total, Dias com jejum */}
          <View className="mt-5">
            <FastingStatsOverview />
          </View>

          {/* Gráfico de Peso com Filtros de Período e Objetivo */}
          <View className="mt-5">
            <WeightTrackingCard />
          </View>

          <View className="mt-5">
            <WeeklyFastingChart />
          </View>

          <View className="mt-5">
            <LevelProgressCard
              level={snapshot.level}
              levelProgress={snapshot.levelProgress}
              levelTitle={snapshot.levelTitle}
              totalXp={snapshot.profile.totalXp}
            />
          </View>

          <View className="mt-5">
            <XpRewardsCard
              level={snapshot.level}
              totalXp={snapshot.profile.totalXp}
            />
          </View>

          <View className="mt-5">
            <WeeklyChallengesCard />
          </View>

          <View className="mt-5">
            <FactualInsightsCard />
          </View>

          <View className="mt-5">
            <ConsistencyLine stats={snapshot.stats} />
          </View>



          <View className="mt-8">
            <View className="mb-4 flex-row items-end justify-between px-1">
              <View>
                <Text className="font-headline text-xl text-foreground">
                  Insígnias
                </Text>
                <Text className="mt-1 font-body text-sm text-muted">
                  Desbloqueadas pelos teus registos locais.
                </Text>
              </View>
              <Text className="font-label text-[10px] text-xp">
                {snapshot.badges.filter((badge) => badge.unlocked).length}/
                {snapshot.badges.length}
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-3">
              {snapshot.badges.map((badge) => (
                <BadgeCard badge={badge} key={badge.id} />
              ))}
            </View>
          </View>

          <PrivacyNote />
        </>
      ) : null}

      <PaywallModal
        featureTrigger="Dossiê de Hábitos em PDF"
        onClose={() => setIsPaywallOpen(false)}
        visible={isPaywallOpen}
      />
    </Screen>
  );
}
