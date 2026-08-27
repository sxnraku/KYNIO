import { ActivityIndicator, View } from "react-native";
import { Text } from "@/components/ui/text";

import { BadgeCard } from "@/components/ui/badge-card";
import { ConsistencyLine } from "@/components/ui/consistency-line";
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

export default function ProgressScreen() {
  const { error, isLoading, snapshot } = useGamificationProgress();

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
        <View className="mt-7 rounded-2xl border border-[#FB7185]/40 bg-[#FB7185]/10 p-5">
          <Text className="font-headline text-lg text-[#FDA4AF]">
            Progresso indisponível
          </Text>
          <Text className="mt-2 font-body text-sm leading-5 text-[#FDA4AF]">
            {error}
          </Text>
        </View>
      ) : null}

      {snapshot ? (
        <>
          {/* 4 Hero Stats: Jejuns, Jejum mais longo, Tempo total, Dias com jejum */}
          <View className="mt-7">
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
    </Screen>
  );
}
