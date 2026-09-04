import { APP_SHARE_URL } from "@/services/achievementShareContent";
import type { CompletedFastSummary } from "@/store/useFastingStore";

export { APP_SHARE_URL };
export const FAST_SHARE_TITLE = "KYNIO — Jejum Concluído";

export function getFastShareTitle(language: "en" | "pt"): string {
  return language === "en" ? "KYNIO — Fast Completed" : "KYNIO — Jejum Concluído";
}

export function buildFastCompletionShareMessage(
  summary: CompletedFastSummary,
  language: "en" | "pt",
): string {
  const totalMinutes = Math.round(summary.elapsedHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeLabel = `${hours}h ${minutes}m`;

  if (language === "en") {
    return `☀️ Completed ${timeLabel} of fasting with KYNIO! Tracking circadian rhythms and metabolic health. Download free: ${APP_SHARE_URL}`;
  }

  return `☀️ Concluí ${timeLabel} de jejum intermitente com o KYNIO! A acompanhar o ritmo circadiano e a saúde metabólica. Descarrega grátis: ${APP_SHARE_URL}`;
}
