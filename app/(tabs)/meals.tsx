import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";

import { Card } from "@/components/ui/card";
import { DailyMealSummaryCard } from "@/components/ui/daily-meal-summary-card";
import { EmptyState } from "@/components/ui/empty-state";
import { MealAnalysisCard } from "@/components/ui/meal-analysis-card";
import { MealCameraModal } from "@/components/ui/meal-camera-modal";
import { MealCaptureCard } from "@/components/ui/meal-capture-card";
import { MealHistoryList } from "@/components/ui/meal-history-list";
import { FastingBreakCard } from "@/components/ui/fasting-break-card";
import { PageTitle } from "@/components/ui/page-title";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { PrivacyNote } from "@/components/ui/privacy-note";
import { ProBadge } from "@/components/ui/pro-badge";
import { Screen } from "@/components/ui/screen";
import { COLORS } from "@/constants/colors";
import { useDailyMealSummary } from "@/hooks/use-daily-meal-summary";
import { useMealAnalysis } from "@/hooks/use-meal-analysis";
import { analyzeFastingBreak } from "@/services/fastingBreakService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import type { FastingBreakAnalysis } from "@/types/fasting-break";

export default function MealsScreen() {
  const language = useAppPreferencesStore((state) => state.language);
  const [summaryRevision, setSummaryRevision] = useState(0);
  const [scanTarget, setScanTarget] = useState<'meal' | 'fasting_break'>('meal');
  const [fastingBreakResult, setFastingBreakResult] = useState<FastingBreakAnalysis | null>(null);
  const refreshSummary = useCallback(() => {
    setSummaryRevision((current) => current + 1);
  }, []);
  const dailySummary = useDailyMealSummary(summaryRevision);
  const {
    analysis,
    cameraVisible,
    canAnalyze,
    closeCamera,
    confirmMeal,
    description,
    editableNutrition,
    errorMessage,
    isAnalyzing,
    isSaving,
    openCamera,
    pickPhoto,
    portionQuantity,
    refineAnalysis,
    removePhoto,
    runAnalysis,
    savedMessage,
    selectedImage,
    setDescription,
    setPortionQuantity,
    useCapturedPhoto,
    updateNutrition,
    isPro,
    remainingScans,
    paywallVisible,
    openPaywall,
    closePaywall,
  } = useMealAnalysis({ onMealSaved: refreshSummary });


  return (
    <Screen>
      <MealCameraModal
        onClose={closeCamera}
        onUsePhoto={useCapturedPhoto}
        visible={cameraVisible}
      />

      <PaywallModal
        featureTrigger="análises de refeição ilimitadas com IA"
        onClose={closePaywall}
        visible={paywallVisible}
      />

      <View className="flex-row items-center justify-between">
        <PageTitle
          description="Fotografa ou descreve o que comeste e revê sempre as estimativas."
          title="Refeições"
        />
      </View>

      {/* Pro status or free quota pill */}
      <View className="mt-3 flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5">
        <View className="flex-row items-center gap-2">
          {isPro ? (
            <ProBadge size="small" />
          ) : (
            <Text className="font-label text-xs uppercase tracking-wider text-muted">
              {remainingScans > 0
                ? language === "en"
                  ? `${remainingScans} free ${remainingScans === 1 ? 'scan' : 'scans'} today`
                  : `${remainingScans} análises grátis hoje`
                : language === "en"
                ? "Daily AI quota reached"
                : "Quota diária de IA atingida"}
            </Text>
          )}
        </View>
        <Pressable onPress={openPaywall} className="flex-row items-center gap-1">
          <Text className="font-label text-xs font-bold text-success">
            {isPro
              ? language === "en"
                ? "Sol Pro Active ✦"
                : "Sol Pro Ativo ✦"
              : language === "en"
              ? "Unlock Pro →"
              : "Desbloquear Pro →"}
          </Text>
        </Pressable>
      </View>

      {/* Aviso não-bloqueante na última análise grátis do dia */}
      {!isPro && remainingScans === 1 ? (
        <Pressable
          accessibilityRole="button"
          className="mt-3 flex-row items-center gap-2.5 rounded-xl border border-xp/30 bg-xp/10 px-4 py-3 active:opacity-70"
          onPress={openPaywall}
          testID="last-free-scan-banner"
        >
          <Ionicons color={COLORS.xp} name="sparkles-outline" size={17} />
          <Text className="flex-1 font-body text-xs leading-4 text-foreground">
            Última análise grátis — desbloqueia ilimitado
          </Text>
          <Text className="font-label text-xs font-bold text-success">
            Desbloquear
          </Text>
        </Pressable>
      ) : null}


      <View className="mt-7">
        <DailyMealSummaryCard
          error={dailySummary.error}
          isLoading={dailySummary.isLoading}
          summary={dailySummary.summary}
        />
      </View>

      <View className="mt-5">
        {/* Alternador de Modo: Refeição vs Quebra de Jejum */}
        <View className="mb-3 flex-row rounded-xl border border-border bg-surface p-1">
          <Pressable
            accessibilityRole="button"
            className={`flex-1 items-center justify-center rounded-lg py-2 ${
              scanTarget === 'meal' ? 'bg-foreground' : 'bg-transparent'
            }`}
            onPress={() => {
              setScanTarget('meal');
              setFastingBreakResult(null);
            }}
          >
            <Text
              className={`font-label text-xs uppercase tracking-wider ${
                scanTarget === 'meal' ? 'text-background' : 'text-muted'
              }`}
            >
              {language === 'en' ? '🍽️ Meal' : '🍽️ Refeição'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className={`flex-1 items-center justify-center rounded-lg py-2 ${
              scanTarget === 'fasting_break' ? 'bg-foreground' : 'bg-transparent'
            }`}
            onPress={() => {
              setScanTarget('fasting_break');
            }}
          >
            <Text
              className={`font-label text-xs uppercase tracking-wider ${
                scanTarget === 'fasting_break' ? 'text-background' : 'text-muted'
              }`}
            >
              {language === 'en' ? '🏷️ Check Fast' : '🏷️ Verificar Jejum'}
            </Text>
          </Pressable>
        </View>

        <MealCaptureCard
          canAnalyze={canAnalyze}
          description={description}
          isAnalyzing={isAnalyzing}
          onAnalyze={async () => {
            if (scanTarget === 'fasting_break') {
              const res = analyzeFastingBreak({
                description: description || 'Suplemento / Bebida',
                language,
              });
              setFastingBreakResult(res);
            } else {
              setFastingBreakResult(null);
              await runAnalysis();
            }
          }}
          onChangeDescription={setDescription}
          onChangePortionQuantity={setPortionQuantity}
          onPickPhoto={pickPhoto}
          onRemovePhoto={removePhoto}
          onTakePhoto={openCamera}
          portionQuantity={portionQuantity}
          selectedImage={selectedImage}
        />
      </View>

      {/* Cartão de Resultado do Verificador de Quebra de Jejum */}
      {fastingBreakResult ? (
        <View className="mt-5">
          <FastingBreakCard
            analysis={fastingBreakResult}
            onDismiss={() => setFastingBreakResult(null)}
          />
        </View>
      ) : null}

      {errorMessage ? (
        <View
          accessibilityLiveRegion="polite"
          className="mt-4 flex-row items-start gap-2 rounded-xl border border-danger/20 bg-danger/10 p-4"
        >
          <Ionicons color={COLORS.danger} name="alert-circle-outline" size={19} />
          <Text className="flex-1 font-body text-sm leading-5 text-danger">
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {savedMessage ? (
        <View
          accessibilityLiveRegion="polite"
          className="mt-4 flex-row items-center gap-2 rounded-xl border border-xp/20 bg-xp/10 p-4"
        >
          <Ionicons color={COLORS.xp} name="sparkles" size={19} />
          <Text className="flex-1 font-headline text-sm text-foreground">
            {savedMessage}
          </Text>
        </View>
      ) : null}

      <View className="mt-5">
        {analysis ? (
          <MealAnalysisCard
            analysis={analysis}
            editableNutrition={editableNutrition}
            isAnalyzing={isAnalyzing}
            isSaving={isSaving}
            onChangeNutrition={updateNutrition}
            onConfirm={confirmMeal}
            onRefine={refineAnalysis}
          />
        ) : (

          <Card>
            <Text className="font-label text-[10px] uppercase tracking-widest text-success">
              Resultado estruturado
            </Text>
            <View className="mt-4">
              <EmptyState
                description="Calorias, macros, tags e confiança aparecerão aqui para revisão manual."
                icon="restaurant-outline"
                title="Nenhuma análise"
              />
            </View>
          </Card>
        )}
      </View>

      <MealHistoryList
        onMealDeleted={refreshSummary}
        refreshToken={summaryRevision}
      />

      <PrivacyNote />
    </Screen>
  );
}
