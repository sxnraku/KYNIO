import type { AchievementSharePayload } from "@/types/achievement-share";
import { translateText } from "@/services/i18n";

const configuredShareUrl = process.env.EXPO_PUBLIC_APP_SHARE_URL?.trim();

export const APP_SHARE_URL =
  configuredShareUrl && /^https:\/\//i.test(configuredShareUrl)
    ? configuredShareUrl
    : "https://github.com/sxnraku/KYNIO";

export const ACHIEVEMENT_SHARE_TITLE = "As minhas conquistas no KYNIO";

export function buildAchievementShareMessage(
  payload: AchievementSharePayload,
): string {
  if (payload.language === "en") {
    const badges = payload.badgeTitles.length
      ? `Badges: ${payload.badgeTitles
          .map((badge) => translateText(badge, payload.language))
          .join(", ")}.`
      : "My journey has just begun.";

    return `I reached Level ${payload.level} · ${translateText(payload.levelTitle, payload.language)} on KYNIO. ${badges} Tracking habits at my own pace.\n\nDiscover KYNIO: ${APP_SHARE_URL}`;
  }

  const badges = payload.badgeTitles.length
    ? `Insígnias: ${payload.badgeTitles.join(", ")}.`
    : "A minha jornada começou agora.";

  return `No KYNIO alcancei o Nível ${payload.level} · ${payload.levelTitle}. ${badges} A acompanhar hábitos ao meu ritmo.\n\nDescobre o KYNIO: ${APP_SHARE_URL}`;
}

export function getShareUrlLabel(): string {
  return APP_SHARE_URL.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}
