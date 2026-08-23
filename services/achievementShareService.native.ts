import Share from "react-native-share";
import { captureRef, releaseCapture } from "react-native-view-shot";

import {
  ACHIEVEMENT_SHARE_TITLE,
  buildAchievementShareMessage,
} from "@/services/achievementShareContent";
import type {
  AchievementCardRef,
  AchievementSharePayload,
  AchievementShareResult,
} from "@/types/achievement-share";

export async function shareAchievementCard(
  cardRef: AchievementCardRef,
  payload: AchievementSharePayload,
): Promise<AchievementShareResult> {
  if (!cardRef.current) {
    throw new Error("O cartão de conquistas ainda não está pronto.");
  }

  const imageUri = await captureRef(cardRef, {
    fileName: `kynio-nivel-${payload.level}`,
    format: "png",
    height: 1080,
    quality: 1,
    result: "tmpfile",
    width: 1080,
  });

  try {
    const result = await Share.open({
      failOnCancel: false,
      filename: `kynio-nivel-${payload.level}`,
      message: buildAchievementShareMessage(payload),
      title: ACHIEVEMENT_SHARE_TITLE,
      type: "image/png",
      url: imageUri,
      useInternalStorage: true,
    });

    if (result.dismissedAction) {
      return { mode: "cancelled" };
    }

    return {
      mode: "shared",
      statusMessage: "Imagem e link enviados para a app escolhida.",
    };
  } finally {
    releaseCapture(imageUri);
  }
}
