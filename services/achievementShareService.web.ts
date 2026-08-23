import { captureRef } from "react-native-view-shot";

import {
  ACHIEVEMENT_SHARE_TITLE,
  APP_SHARE_URL,
  buildAchievementShareMessage,
} from "@/services/achievementShareContent";
import type {
  AchievementCardRef,
  AchievementSharePayload,
  AchievementShareResult,
} from "@/types/achievement-share";

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

async function copyShareMessage(message: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(message);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = message;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function wasCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export async function shareAchievementCard(
  cardRef: AchievementCardRef,
  payload: AchievementSharePayload,
): Promise<AchievementShareResult> {
  if (!cardRef.current) {
    throw new Error("O cartão de conquistas ainda não está pronto.");
  }

  const dataUri = await captureRef(cardRef, {
    format: "png",
    height: 1080,
    quality: 1,
    result: "data-uri",
    width: 1080,
  });
  const file = dataUriToFile(dataUri, `kynio-nivel-${payload.level}.png`);
  const message = buildAchievementShareMessage(payload);
  const shareData: ShareData = {
    files: [file],
    text: message,
    title: ACHIEVEMENT_SHARE_TITLE,
    url: APP_SHARE_URL,
  };

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share(shareData);
      return { mode: "shared", statusMessage: "Imagem e link partilhados." };
    } catch (error: unknown) {
      if (wasCancelled(error)) {
        return { mode: "cancelled" };
      }

      throw error;
    }
  }

  downloadFile(file);

  if (navigator.share) {
    try {
      await navigator.share({
        text: message,
        title: ACHIEVEMENT_SHARE_TITLE,
        url: APP_SHARE_URL,
      });
      return {
        mode: "downloaded",
        statusMessage: "Imagem descarregada e link aberto para partilha.",
      };
    } catch (error: unknown) {
      if (wasCancelled(error)) {
        return {
          mode: "downloaded",
          statusMessage:
            "Imagem descarregada. A partilha do link foi cancelada.",
        };
      }
    }
  }

  try {
    await copyShareMessage(message);
    return {
      mode: "downloaded",
      statusMessage: "Imagem descarregada e texto com o link copiado.",
    };
  } catch {
    return {
      mode: "downloaded",
      statusMessage: `Imagem descarregada. Link: ${APP_SHARE_URL}`,
    };
  }
}
