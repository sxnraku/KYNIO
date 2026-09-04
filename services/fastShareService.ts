import type { RefObject } from "react";
import type { View } from "react-native";
import type { AchievementShareResult } from "@/types/achievement-share";
import type { CompletedFastSummary } from "@/store/useFastingStore";

export async function shareFastCompletionCard(
  _cardRef: RefObject<View | null>,
  _summary: CompletedFastSummary,
  _language: "en" | "pt",
): Promise<AchievementShareResult> {
  throw new Error(
    "A partilha de jejum concluído não está disponível nesta plataforma.",
  );
}
