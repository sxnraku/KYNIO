import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "@/components/ui/text";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MealAnalysisCard } from "@/components/ui/meal-analysis-card";
import { MealCameraModal } from "@/components/ui/meal-camera-modal";
import { MealCaptureCard } from "@/components/ui/meal-capture-card";
import { PageTitle } from "@/components/ui/page-title";
import { PrivacyNote } from "@/components/ui/privacy-note";
import { Screen } from "@/components/ui/screen";
import { COLORS } from "@/constants/colors";
import { useMealAnalysis } from "@/hooks/use-meal-analysis";

export default function MealsScreen() {
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
    removePhoto,
    runAnalysis,
    savedMessage,
    selectedImage,
    setDescription,
    useCapturedPhoto,
    updateNutrition,
  } = useMealAnalysis();

  return (
    <Screen>
      <MealCameraModal
        onClose={closeCamera}
        onUsePhoto={useCapturedPhoto}
        visible={cameraVisible}
      />

      <PageTitle
        description="Fotografa ou descreve o que comeste e revê sempre as estimativas."
        title="Refeições"
      />

      <View className="mt-7">
        <MealCaptureCard
          canAnalyze={canAnalyze}
          description={description}
          isAnalyzing={isAnalyzing}
          onAnalyze={runAnalysis}
          onChangeDescription={setDescription}
          onPickPhoto={pickPhoto}
          onRemovePhoto={removePhoto}
          onTakePhoto={openCamera}
          selectedImage={selectedImage}
        />
      </View>

      {errorMessage ? (
        <View
          accessibilityLiveRegion="polite"
          className="mt-4 flex-row items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
        >
          <Ionicons color="#F87171" name="alert-circle-outline" size={19} />
          <Text className="flex-1 font-body text-sm leading-5 text-red-300">
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
            isSaving={isSaving}
            onChangeNutrition={updateNutrition}
            onConfirm={confirmMeal}
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
