import type { RefObject } from "react";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";

import {
  APP_SHARE_URL,
  buildFastCompletionShareMessage,
  getFastShareTitle,
} from "@/services/fastShareContent";
import { translateText } from "@/services/i18n";
import type { AchievementShareResult } from "@/types/achievement-share";
import type { CompletedFastSummary } from "@/store/useFastingStore";

function dataUriToFile(dataUri: string, fileName: string): File {
  const [metadata, encodedData] = dataUri.split(",");
  if (!metadata || !encodedData) {
    throw new Error("Não foi possível preparar a imagem para partilha.");
  }
  const mimeType = metadata.match(/data:(.*?);base64/)?.[1] ?? "image/png";
  const binary = window.atob(encodedData);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: mimeType });
}

function downloadFile(file: File): void {
  const objectUrl = window.URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.download = file.name;
  anchor.href = objectUrl;
  anchor.click();
  window.URL.revokeObjectURL(objectUrl);
}

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
  const fileName = `kynio-jejum-${hours}h.png`;

  const dataUri = await captureRef(cardRef, {
    format: "png",
    height: 1080,
    quality: 1,
    result: "data-uri",
    width: 1080,
  });

  const file = dataUriToFile(dataUri, fileName);
  const message = buildFastCompletionShareMessage(summary, language);

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      const shareData: ShareData = {
        text: message,
        title: getFastShareTitle(language),
        url: APP_SHARE_URL,
      };

      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        shareData.files = [file];
      }

      await navigator.share(shareData);
      return {
        mode: "shared",
        statusMessage: translateText(
          "Imagem e link partilhados com sucesso.",
          language,
        ),
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        return { mode: "cancelled" };
      }
    }
  }

  downloadFile(file);
  return {
    mode: "downloaded",
    statusMessage: translateText(
      "Imagem guardada com sucesso.",
      language,
    ),
  };
}
