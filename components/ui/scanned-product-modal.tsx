import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import {
  assessFastingImpact,
  calculatePortionNutrition,
  type ScannedFoodProduct,
} from "@/services/barcodeFoodService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

interface ScannedProductModalProps {
  onClose: () => void;
  onSaveMeal: (mealData: {
    carbsGrams: number;
    dishName: string;
    estimatedCalories: number;
    fatGrams: number;
    imageUrl?: string;
    proteinGrams: number;
    tags: string[];
  }) => Promise<void>;
  product: ScannedFoodProduct | null;
  visible: boolean;
}

export function ScannedProductModal({
  onClose,
  onSaveMeal,
  product,
  visible,
}: ScannedProductModalProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [portionGrams, setPortionGrams] = useState<number>(100);
  const [isSaving, setIsSaving] = useState(false);
  const [customInput, setCustomInput] = useState("100");

  useEffect(() => {
    if (product) {
      const initialGrams = product.servingQuantityGrams || 100;
      setPortionGrams(initialGrams);
      setCustomInput(String(initialGrams));
    }
  }, [product]);

  const portionNutrition = useMemo(() => {
    if (!product) return null;
    return calculatePortionNutrition(product, portionGrams);
  }, [product, portionGrams]);

  const fastingAssessment = useMemo(() => {
    if (!portionNutrition) return null;
    return assessFastingImpact(
      portionNutrition.calories,
      portionNutrition.carbs,
      language,
    );
  }, [portionNutrition, language]);

  if (!product || !portionNutrition) {
    return null;
  }

  const handleCustomGramsChange = (text: string) => {
    setCustomInput(text);
    const parsed = parseInt(text.replace(/[^\d]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setPortionGrams(Math.min(2000, parsed));
    }
  };

  const handleSelectPreset = (grams: number) => {
    setPortionGrams(grams);
    setCustomInput(String(grams));
  };

  const handleConfirmSave = async () => {
    if (isSaving || !portionNutrition) return;

    setIsSaving(true);
    try {
      const tags = [
        product.name,
        `barcode:${product.barcode}`,
        `${portionGrams}g`,
      ];
      if (product.brand) {
        tags.push(product.brand);
      }
      if (fastingAssessment) {
        tags.push(fastingAssessment.tag);
      }

      await onSaveMeal({
        carbsGrams: portionNutrition.carbs,
        dishName: product.name,
        estimatedCalories: portionNutrition.calories,
        fatGrams: portionNutrition.fat,
        imageUrl: product.imageUrl,
        proteinGrams: portionNutrition.protein,
        tags,
      });

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      visible={visible}
    >
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-border px-5 py-3.5">
          <View className="flex-row items-center gap-2">
            <Ionicons color={COLORS.xp} name="barcode" size={20} />
            <Text className="font-headline text-base text-foreground">
              {language === "en" ? "Scanned Product" : "Alimento Identificado"}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Fechar"
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full bg-surface active:opacity-70"
            onPress={onClose}
          >
            <Ionicons color={COLORS.foreground} name="close" size={20} />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cartão de Detalhes do Produto */}
          <View className="flex-row items-center gap-4 rounded-2xl border border-border bg-surface p-4">
            {product.imageUrl ? (
              <Image
                className="h-20 w-20 rounded-xl bg-surface"
                resizeMode="contain"
                source={{ uri: product.imageUrl }}
              />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-xl bg-surface border border-border">
                <Ionicons color={COLORS.muted} name="fast-food-outline" size={32} />
              </View>
            )}

            <View className="flex-1">
              <Text className="font-headline text-base leading-5 text-foreground">
                {product.name}
              </Text>
              {product.brand ? (
                <Text className="mt-1 font-body text-xs text-muted">
                  {product.brand}
                </Text>
              ) : null}
              <Text className="mt-1 font-label text-[10px] tracking-wider text-muted">
                EAN: {product.barcode}
              </Text>
            </View>
          </View>

          {/* Seletor de Porção */}
          <View className="mt-5">
            <Text className="font-label text-xs uppercase tracking-wider text-muted">
              {language === "en" ? "Portion Quantity" : "Quantidade da Porção"}
            </Text>

            <View className="mt-2.5 flex-row gap-2">
              <Pressable
                className={`flex-1 items-center justify-center rounded-xl border py-2.5 ${
                  portionGrams === 100
                    ? "border-foreground bg-foreground"
                    : "border-border bg-surface"
                }`}
                onPress={() => handleSelectPreset(100)}
              >
                <Text
                  className={`font-label text-xs uppercase ${
                    portionGrams === 100 ? "text-background" : "text-foreground"
                  }`}
                >
                  100g / ml
                </Text>
              </Pressable>

              {product.servingQuantityGrams && product.servingQuantityGrams !== 100 ? (
                <Pressable
                  className={`flex-1 items-center justify-center rounded-xl border py-2.5 ${
                    portionGrams === product.servingQuantityGrams
                      ? "border-foreground bg-foreground"
                      : "border-border bg-surface"
                  }`}
                  onPress={() => handleSelectPreset(product.servingQuantityGrams!)}
                >
                  <Text
                    className={`font-label text-xs uppercase ${
                      portionGrams === product.servingQuantityGrams
                        ? "text-background"
                        : "text-foreground"
                    }`}
                  >
                    {product.servingSize || `${product.servingQuantityGrams}g`}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {/* Input personalizado de gramas */}
            <View className="mt-3 flex-row items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
              <Ionicons color={COLORS.muted} name="scale-outline" size={18} />
              <TextInput
                className="flex-1 font-body text-sm text-foreground"
                keyboardType="numeric"
                maxLength={4}
                onChangeText={handleCustomGramsChange}
                placeholder="100"
                placeholderTextColor={COLORS.muted}
                value={customInput}
              />
              <Text className="font-label text-xs uppercase text-muted">g / ml</Text>
            </View>
          </View>

          {/* Resumo Nutricional Recalculado */}
          <View className="mt-5">
            <Text className="font-label text-xs uppercase tracking-wider text-muted">
              {language === "en"
                ? `Nutrition for ${portionNutrition.grams}g`
                : `Informação Nutricional (${portionNutrition.grams}g)`}
            </Text>

            <View className="mt-2.5 rounded-2xl border border-border bg-surface p-4">
              <View className="items-center pb-3 border-b border-border">
                <Text className="font-headline text-4xl text-foreground">
                  {portionNutrition.calories}
                </Text>
                <Text className="font-label text-xs uppercase tracking-wider text-muted">
                  {language === "en" ? "Calories (kcal)" : "Calorias (kcal)"}
                </Text>
              </View>

              <View className="mt-3 flex-row justify-between">
                <View className="items-center flex-1">
                  <Text className="font-headline text-base text-foreground">
                    {portionNutrition.protein}g
                  </Text>
                  <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                    {language === "en" ? "Protein" : "Proteína"}
                  </Text>
                </View>
                <View className="items-center flex-1 border-x border-border">
                  <Text className="font-headline text-base text-foreground">
                    {portionNutrition.carbs}g
                  </Text>
                  <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                    {language === "en" ? "Carbs" : "Hidratos"}
                  </Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="font-headline text-base text-foreground">
                    {portionNutrition.fat}g
                  </Text>
                  <Text className="font-label text-[10px] uppercase tracking-wider text-muted">
                    {language === "en" ? "Fat" : "Gordura"}
                  </Text>
                </View>
              </View>

              {(portionNutrition.fiber !== undefined ||
                portionNutrition.sugars !== undefined) && (
                <View className="mt-3 pt-3 border-t border-border flex-row justify-around">
                  {portionNutrition.fiber !== undefined ? (
                    <Text className="font-body text-xs text-muted">
                      {language === "en" ? "Fiber: " : "Fibra: "}
                      <Text className="font-headline text-xs text-foreground">
                        {portionNutrition.fiber}g
                      </Text>
                    </Text>
                  ) : null}
                  {portionNutrition.sugars !== undefined ? (
                    <Text className="font-body text-xs text-muted">
                      {language === "en" ? "Sugars: " : "Açúcares: "}
                      <Text className="font-headline text-xs text-foreground">
                        {portionNutrition.sugars}g
                      </Text>
                    </Text>
                  ) : null}
                </View>
              )}
            </View>
          </View>

          {/* Avaliação de Impacto no Jejum */}
          {fastingAssessment ? (
            <View className="mt-5">
              <View
                className={`rounded-xl border p-3.5 ${
                  fastingAssessment.breaksFast
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-emerald-500/30 bg-emerald-500/10"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    color={
                      fastingAssessment.breaksFast ? COLORS.xp : COLORS.success
                    }
                    name={
                      fastingAssessment.breaksFast
                        ? "warning-outline"
                        : "checkmark-circle-outline"
                    }
                    size={18}
                  />
                  <Text
                    className="font-headline text-xs"
                    style={{
                      color: fastingAssessment.breaksFast
                        ? COLORS.xp
                        : COLORS.success,
                    }}
                  >
                    {fastingAssessment.title}
                  </Text>
                </View>
                <Text className="mt-1 font-body text-xs leading-4 text-foreground/80">
                  {fastingAssessment.description}
                </Text>
              </View>
            </View>
          ) : null}

          {/* Botão de Guardar Refeição */}
          <Pressable
            accessibilityRole="button"
            className="mt-6 flex-row items-center justify-center gap-2 rounded-2xl bg-foreground py-4 active:opacity-90"
            disabled={isSaving}
            onPress={handleConfirmSave}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <>
                <Ionicons color={COLORS.background} name="checkmark" size={20} />
                <Text className="font-headline text-sm text-background">
                  {language === "en"
                    ? "Log Meal · +30 XP"
                    : "Registar Refeição · +30 XP"}
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
