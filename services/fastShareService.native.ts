import type { RefObject } from "react";
import type { View } from "react-native";
import Share from "react-native-share";
import { captureRef, releaseCapture } from "react-native-view-shot";

import {
  buildFastCompletionShareMessage,
  getFastShareTitle,
} from "@/services/fastShareContent";
import { translateText } from "@/services/i18n";
import type { AchievementShareResult } from "@/types/achievement-share";
import type { CompletedFastSummary } from "@/store/useFastingStore";

export async function shareFastCompletionCard(
  cardRef: RefObject<View | null>,
  summary: CompletedFastSummary,
  language: "en" | "pt",
): Promise<AchievementShareResult> {
  if (!cardRef.current) {
    throw new Error(
      translateText(
        "O cartão de jejum ainda não está pronto para partilhar.",
        language,
      ),
    );
  }

  const hours = Math.floor(summary.elapsedHours);
  const imageUri = await captureRef(cardRef, {
    fileName: `kynio-jejum-${hours}h`,
    format: "png",
    height: 1080,
    quality: 1,
    result: "tmpfile",
    width: 1080,
  });

  try {
    const result = await Share.open({
      failOnCancel: false,
      filename: `kynio-jejum-${hours}h`,
      message: buildFastCompletionShareMessage(summary, language),
      title: getFastShareTitle(language),
      type: "image/png",
      url: imageUri,
      useInternalStorage: true,
    });

    if (result.dismissedAction) {
      return { mode: "cancelled" };
    }

    return {
      mode: "shared",
      statusMessage: translateText(
        "Imagem e link partilhados com sucesso.",
        language,
      ),
    };
  } finally {
    releaseCapture(imageUri);
  }
}
