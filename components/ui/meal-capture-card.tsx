import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/text-input";

import { Card } from "@/components/ui/card";
import { COLORS } from "@/constants/colors";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import type { SelectedMealImage } from "@/types/meal";

interface MealCaptureCardProps {
  canAnalyze: boolean;
  description: string;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onChangeDescription: (value: string) => void;
  onChangePortionQuantity?: (value: string) => void;
  onPickPhoto: () => void;
  onRemovePhoto: () => void;
  onTakePhoto: () => void;
  portionQuantity?: string;
  selectedImage: SelectedMealImage | null;
}


interface SourceButtonProps {
  icon: "camera-outline" | "images-outline";
  label: string;
  onPress: () => void;
}

function SourceButton({ icon, label, onPress }: SourceButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-3.5 active:opacity-70"
      onPress={onPress}
    >
      <Ionicons color={COLORS.success} name={icon} size={19} />
      <Text className="font-headline text-sm text-foreground">{label}</Text>
    </Pressable>
  );
}

export function MealCaptureCard({
  canAnalyze,
  description,
  isAnalyzing,
  onAnalyze,
  onChangeDescription,
  onChangePortionQuantity,
  onPickPhoto,
  onRemovePhoto,
  onTakePhoto,
  portionQuantity = "",
  selectedImage,
}: MealCaptureCardProps) {
  const language = useAppPreferencesStore((state) => state.language);

  return (
    <Card>
      <Text className="font-label text-[10px] uppercase tracking-widest text-success">
        {translateText("Nova análise", language)}
      </Text>
      <Text className="mt-2 font-headline text-lg text-foreground">
        {translateText("Mostra ou descreve a refeição", language)}
      </Text>
      <Text className="mt-1 font-body text-sm leading-5 text-muted">
        {translateText(
          "Abre a câmara em direto, escolhe uma imagem da galeria ou descreve o que comeste.",
          language,
        )}
      </Text>

      <View className="mt-5 flex-row gap-3">
        <SourceButton
          icon="camera-outline"
          label={translateText("Câmara", language)}
          onPress={onTakePhoto}
        />
        <SourceButton
          icon="images-outline"
          label={translateText("Galeria", language)}
          onPress={onPickPhoto}
        />
      </View>

      {selectedImage ? (
        <View className="mt-4 overflow-hidden rounded-xl border border-border">
          <Image
            accessibilityLabel={translateText(
              "Fotografia selecionada da refeição",
              language,
            )}
            className="h-48 w-full"
            resizeMode="cover"
            source={{ uri: selectedImage.uri }}
          />
          <Pressable
            accessibilityLabel={translateText("Remover fotografia", language)}
            accessibilityRole="button"
            className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-background/90 active:opacity-70"
            onPress={onRemovePhoto}
          >
            <Ionicons color={COLORS.foreground} name="close" size={20} />
          </Pressable>
        </View>
      ) : null}

      <Text className="mb-2 mt-5 font-label text-[10px] uppercase tracking-widest text-muted">
        {translateText("O que comeste?", language)}
      </Text>
      <TextInput
        accessibilityLabel={translateText("Descrição da refeição", language)}
        className="min-h-24 rounded-xl border border-border bg-background px-4 py-3 font-body text-base text-foreground"
        maxLength={500}
        multiline
        onChangeText={onChangeDescription}
        placeholder={
          language === "en"
            ? "e.g.: grilled salmon with rice and greens"
            : "Ex.: salmão grelhado com arroz e legumes"
        }
        placeholderTextColor={COLORS.muted}
        textAlignVertical="top"
        value={description}
      />

      <Text className="mb-2 mt-4 font-label text-[10px] uppercase tracking-widest text-muted">
        {language === "en"
          ? "Quantity / Portion (optional)"
          : "Quantidade / Porção (opcional)"}
      </Text>
      <TextInput
        accessibilityLabel={
          language === "en"
            ? "Meal portion or quantity"
            : "Quantidade ou porção da refeição"
        }
        className="rounded-xl border border-border bg-background px-4 py-3 font-body text-base text-foreground"
        maxLength={100}
        onChangeText={onChangePortionQuantity}
        placeholder={
          language === "en"
            ? "e.g.: 250g, 1 full plate, 2 slices, 1 bowl"
            : "Ex.: 250g, 1 prato cheio, 2 fatias, 1 taça"
        }
        placeholderTextColor={COLORS.muted}
        value={portionQuantity}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canAnalyze || isAnalyzing }}
        className={`mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-xl px-5 ${
          canAnalyze && !isAnalyzing
            ? "bg-success active:opacity-80"
            : "bg-border opacity-60"
        }`}
        disabled={!canAnalyze || isAnalyzing}
        onPress={onAnalyze}
      >
        {isAnalyzing ? (
          <ActivityIndicator color={COLORS.background} size="small" />
        ) : (
          <Ionicons color={COLORS.background} name="sparkles" size={20} />
        )}
        <Text className="font-headline text-base text-background">
          {isAnalyzing
            ? translateText("A analisar…", language)
            : translateText("Analisar refeição", language)}
        </Text>
      </Pressable>

      <View className="mt-4 flex-row items-start gap-2">
        <Ionicons
          color={COLORS.muted}
          name="shield-checkmark-outline"
          size={15}
        />
        <Text className="flex-1 font-body text-xs leading-4 text-muted">
          {translateText(
            "Ao tocar em Analisar, autorizas o envio desta fotografia e/ou descrição, através do KYNIO, para a Google Gemini. O restante histórico e o ID da conta não são enviados. A app não guarda a fotografia nem a resposta remotamente.",
            language,
          )}
        </Text>
      </View>
    </Card>
  );
}
