import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

import { getUserProfile, saveScannedMealRecord } from "@/services/dbService";
import { analyzeMeal } from "@/services/aiMealService";
import { persistMealImage } from "@/services/localMealImageService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useSubscriptionStore } from "@/store/use-subscription-store";
import { useUserProgressStore } from "@/store/user-progress-store";
import type {
  EditableMealNutrition,
  EditableMealNutritionField,
  MealAnalysisResult,
  SelectedMealImage,
} from "@/types/meal";


const EMPTY_NUTRITION: EditableMealNutrition = {
  carbsGrams: "",
  estimatedCalories: "",
  fatGrams: "",
  proteinGrams: "",
};

function toEditableNutrition(
  result: MealAnalysisResult,
): EditableMealNutrition {
  return {
    carbsGrams: String(result.macros.carbs_g),
    estimatedCalories: String(result.estimated_calories),
    fatGrams: String(result.macros.fat_g),
    proteinGrams: String(result.macros.protein_g),
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function parseNonNegativeValue(value: string, label: string): number {
  const normalizedValue = value.trim().replace(",", ".");
  const parsedValue = Number(normalizedValue);

  if (
    normalizedValue.length === 0 ||
    !Number.isFinite(parsedValue) ||
    parsedValue < 0
  ) {
    throw new Error(`Introduz um valor válido para ${label}.`);
  }

  return parsedValue;
}

interface UseMealAnalysisOptions {
  onMealSaved?: () => void | Promise<void>;
}

export function useMealAnalysis(options: UseMealAnalysisOptions = {}) {
  const [analysis, setAnalysis] = useState<MealAnalysisResult | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [portionQuantity, setPortionQuantity] = useState("");
  const [editableNutrition, setEditableNutrition] =
    useState<EditableMealNutrition>(EMPTY_NUTRITION);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedMealImage | null>(
    null,
  );
  const [paywallVisible, setPaywallVisible] = useState(false);
  const language = useAppPreferencesStore((state) => state.language);
  const syncProfile = useUserProgressStore((state) => state.syncProfile);
  const canPerformAiScan = useSubscriptionStore((state) => state.canPerformAiScan);
  const consumeAiScan = useSubscriptionStore((state) => state.consumeAiScan);
  const isPro = useSubscriptionStore((state) => state.isPro);
  const remainingScans = useSubscriptionStore((state) => state.getRemainingAiScans());

  const setPickedImage = useCallback(
    (result: ImagePicker.ImagePickerResult) => {
      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];

      if (!asset?.base64) {
        setErrorMessage(
          "Não foi possível preparar a imagem. Escolhe outra fotografia.",
        );
        return;
      }

      setSelectedImage({
        base64: asset.base64,
        mimeType: "image/jpeg",
        sourceMimeType: asset.mimeType ?? "image/jpeg",
        uri: asset.uri,
      });
      setAnalysis(null);
      setEditableNutrition(EMPTY_NUTRITION);
      setErrorMessage(null);
      setSavedMessage(null);
    },
    [],
  );

  const openCamera = useCallback(() => {
    setErrorMessage(null);
    setSavedMessage(null);
    setCameraVisible(true);
  }, []);

  const closeCamera = useCallback(() => {
    setCameraVisible(false);
  }, []);

  const useCapturedPhoto = useCallback((image: SelectedMealImage) => {
    setSelectedImage(image);
    setAnalysis(null);
    setEditableNutrition(EMPTY_NUTRITION);
    setErrorMessage(null);
    setSavedMessage(null);
  }, []);

  const pickPhoto = useCallback(async () => {
    try {
      setErrorMessage(null);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setErrorMessage(
          "Autoriza o acesso às fotografias para escolher uma imagem.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        base64: true,
        mediaTypes: ["images"],
        quality: 0.7,
      });

      setPickedImage(result);
    } catch {
      setErrorMessage("Não foi possível abrir a galeria. Tenta novamente.");
    }
  }, [setPickedImage]);

  const removePhoto = useCallback(() => {
    setSelectedImage(null);
    setAnalysis(null);
    setEditableNutrition(EMPTY_NUTRITION);
    setErrorMessage(null);
    setSavedMessage(null);
  }, []);

  const updateDescription = useCallback((value: string) => {
    setDescription(value);
    setAnalysis(null);
    setEditableNutrition(EMPTY_NUTRITION);
    setErrorMessage(null);
    setSavedMessage(null);
  }, []);

  const updatePortionQuantity = useCallback((value: string) => {
    setPortionQuantity(value);
    setAnalysis(null);
    setEditableNutrition(EMPTY_NUTRITION);
    setErrorMessage(null);
    setSavedMessage(null);
  }, []);

  const closePaywall = useCallback(() => {
    setPaywallVisible(false);
  }, []);

  const openPaywall = useCallback(() => {
    setPaywallVisible(true);
  }, []);

  const runAnalysis = useCallback(async () => {
    if (!description.trim() && !portionQuantity.trim() && !selectedImage) {
      setErrorMessage("Adiciona uma fotografia ou descreve a refeição.");
      return;
    }

    if (!canPerformAiScan()) {
      setPaywallVisible(true);
      return;
    }

    setErrorMessage(null);
    setSavedMessage(null);
    setIsAnalyzing(true);

    const fullDescription = [
      description.trim(),
      portionQuantity.trim() ? `Quantidade/Porção: ${portionQuantity.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" - ");

    try {
      const result = await analyzeMeal({
        description: fullDescription || undefined,
        image: selectedImage
          ? { base64: selectedImage.base64, mimeType: selectedImage.mimeType }
          : undefined,
        ...(language === "en" ? { language: "en" as const } : {}),
      });

      consumeAiScan();
      setAnalysis(result);
      setEditableNutrition(toEditableNutrition(result));
    } catch (error) {
      setAnalysis(null);
      setEditableNutrition(EMPTY_NUTRITION);
      setErrorMessage(
        getErrorMessage(
          error,
          language === "en"
            ? "Could not analyze the meal."
            : "Não foi possível analisar a refeição.",
        ),
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [canPerformAiScan, consumeAiScan, description, language, portionQuantity, selectedImage]);

  const refineAnalysis = useCallback(
    async (clarificationText: string) => {
      if (!clarificationText.trim()) {
        return;
      }

      if (!canPerformAiScan()) {
        setPaywallVisible(true);
        return;
      }

      const refinedDescription = [
        description.trim(),
        portionQuantity.trim() ? `Porção: ${portionQuantity.trim()}` : "",
        `Clarificação/Ingredientes: ${clarificationText.trim()}`,
      ]
        .filter(Boolean)
        .join(" - ");

      setDescription(refinedDescription);
      setErrorMessage(null);
      setSavedMessage(null);
      setIsAnalyzing(true);

      try {
        const result = await analyzeMeal({
          description: refinedDescription,
          image: selectedImage
            ? { base64: selectedImage.base64, mimeType: selectedImage.mimeType }
            : undefined,
          ...(language === "en" ? { language: "en" as const } : {}),
        });

        consumeAiScan();
        setAnalysis(result);
        setEditableNutrition(toEditableNutrition(result));
      } catch (error) {
        setErrorMessage(
          getErrorMessage(
            error,
            language === "en"
              ? "Could not refine the analysis."
              : "Não foi possível refinar a análise.",
          ),
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [canPerformAiScan, consumeAiScan, description, language, portionQuantity, selectedImage],
  );


  const updateNutrition = useCallback(
    (field: EditableMealNutritionField, value: string) => {
      setEditableNutrition((current) => ({ ...current, [field]: value }));
      setErrorMessage(null);
    },
    [],
  );

  const confirmMeal = useCallback(async () => {
    if (!analysis) {
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);

    try {
      const estimatedCalories = Math.round(
        parseNonNegativeValue(editableNutrition.estimatedCalories, "calorias"),
      );
      const proteinGrams = parseNonNegativeValue(
        editableNutrition.proteinGrams,
        "proteína",
      );
      const carbsGrams = parseNonNegativeValue(
        editableNutrition.carbsGrams,
        "hidratos",
      );
      const fatGrams = parseNonNegativeValue(
        editableNutrition.fatGrams,
        "gordura",
      );
      const imageUrl = selectedImage
        ? await persistMealImage(
            selectedImage.uri,
            selectedImage.sourceMimeType,
          )
        : null;

      const dishName = analysis.dish_name?.trim();
      const tagsToSave = dishName
        ? [dishName, ...analysis.tags.filter((t) => t.trim().toLowerCase() !== dishName.toLowerCase())]
        : analysis.tags;

      await saveScannedMealRecord({
        carbsGrams,
        estimatedCalories,
        fatGrams,
        imageUrl,
        proteinGrams,
        tags: tagsToSave,
        timestamp: Date.now(),
      });

      syncProfile(await getUserProfile());
      setAnalysis(null);
      setDescription("");
      setEditableNutrition(EMPTY_NUTRITION);
      setSelectedImage(null);
      setSavedMessage("Refeição guardada localmente · +30 XP");
      await options.onMealSaved?.();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error, "Não foi possível guardar a refeição."),
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    analysis,
    editableNutrition,
    options.onMealSaved,
    selectedImage?.sourceMimeType,
    selectedImage?.uri,
    syncProfile,
  ]);

  return {
    analysis,
    cameraVisible,
    canAnalyze:
      description.trim().length > 0 ||
      portionQuantity.trim().length > 0 ||
      selectedImage !== null,
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
    setDescription: updateDescription,
    setPortionQuantity: updatePortionQuantity,
    useCapturedPhoto,
    updateNutrition,
    isPro,
    remainingScans,
    paywallVisible,
    openPaywall,
    closePaywall,
  };
}


