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
import { PageTitle } from "@/components/ui/page-title";
import { PaywallModal } from "@/components/ui/paywall-modal";
import { PrivacyNote } from "@/components/ui/privacy-note";
import { ProBadge } from "@/components/ui/pro-badge";
import { Screen } from "@/components/ui/screen";
import { COLORS } from "@/constants/colors";
import { useDailyMealSummary } from "@/hooks/use-daily-meal-summary";
import { useMealAnalysis } from "@/hooks/use-meal-analysis";

export default function MealsScreen() {
  const [summaryRevision, setSummaryRevision] = useState(0);
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
                ? `${remainingScans} análises grátis hoje`
                : "Quota diária de IA atingida"}
            </Text>
          )}
        </View>
        <Pressable onPress={openPaywall} className="flex-row items-center gap-1">
          <Text className="font-label text-xs font-bold text-success">
            {isPro ? "Aura Pro Ativo ✦" : "Desbloquear Pro →"}
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
        <MealCaptureCard
          canAnalyze={canAnalyze}
          description={description}
          isAnalyzing={isAnalyzing}
          onAnalyze={runAnalysis}
          onChangeDescription={setDescription}
          onChangePortionQuantity={setPortionQuantity}
          onPickPhoto={pickPhoto}
          onRemovePhoto={removePhoto}
          onTakePhoto={openCamera}
          portionQuantity={portionQuantity}
          selectedImage={selectedImage}
        />
      </View>

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

      <PrivacyNote />
    </Screen>
  );
}
