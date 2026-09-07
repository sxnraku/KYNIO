import type { FastRecord } from "@/db/schema";
import type { AppLanguage } from "@/store/app-preferences-store";

export interface MealFastingWindowContext {
  type: "eating_window" | "fast_break";
  label: string;
  hoursFasted?: number;
}

export interface ActiveFastReference {
  startTime: number;
  targetHours?: number;
  endTime?: number;
}

/**
 * Determina se uma refeição ocorreu dentro de uma janela de alimentação aberta
 * ou se coincidiu com um período de jejum (quebrando-o ou decorrendo durante o mesmo).
 */
export function getMealFastingContext(
  mealTimestamp: number,
  completedFasts: FastRecord[] = [],
  activeFast?: ActiveFastReference | null,
  language: AppLanguage = "pt",
): MealFastingWindowContext {
  const safeFasts = Array.isArray(completedFasts) ? completedFasts : [];

  // 1. Verificar se coincide com o jejum atualmente ativo
  if (activeFast && mealTimestamp >= activeFast.startTime) {
    const elapsedMs = Math.max(0, mealTimestamp - activeFast.startTime);
    const totalMinutes = Math.floor(elapsedMs / (1000 * 60));
    const hoursInt = Math.floor(totalMinutes / 60);
    const minsInt = totalMinutes % 60;
    const hoursFasted = Math.round((totalMinutes / 60) * 10) / 10;

    const timeFormatted =
      hoursInt > 0
        ? `${hoursInt}h${minsInt > 0 ? ` ${minsInt}m` : ""}`
        : minsInt > 0
          ? `${minsInt}m`
          : "< 1m";

    return {
      hoursFasted,
      label:
        language === "en"
          ? `Broke Fast (${timeFormatted})`
          : `Quebrou Jejum (${timeFormatted})`,
      type: "fast_break",
    };
  }

  // 2. Verificar se coincide com algum jejum histórico concluído
  for (const fast of safeFasts) {
    if (mealTimestamp >= fast.startTime && mealTimestamp <= fast.endTime) {
      const elapsedMs = Math.max(0, mealTimestamp - fast.startTime);
      const totalMinutes = Math.floor(elapsedMs / (1000 * 60));
      const hoursInt = Math.floor(totalMinutes / 60);
      const minsInt = totalMinutes % 60;
      const hoursFasted = Math.round((totalMinutes / 60) * 10) / 10;

      const timeFormatted =
        hoursInt > 0
          ? `${hoursInt}h${minsInt > 0 ? ` ${minsInt}m` : ""}`
          : minsInt > 0
            ? `${minsInt}m`
            : "< 1m";

      return {
        hoursFasted,
        label:
          language === "en"
            ? `During Fast (${timeFormatted})`
            : `Durante Jejum (${timeFormatted})`,
        type: "fast_break",
      };
    }
  }

  // 3. Caso contrário, ocorreu na janela de alimentação
  return {
    label: language === "en" ? "Eating Window" : "Janela Alimentar",
    type: "eating_window",
  };
}
