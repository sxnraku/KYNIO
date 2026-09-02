import type { AppLanguage } from "@/store/app-preferences-store";

import { ENGLISH_BY_PORTUGUESE } from "@/services/i18n-translations";

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function translateText(value: string, language: AppLanguage): string {
  if (language === "pt") {
    return value;
  }

  const normalized = normalize(value);
  let translation = ENGLISH_BY_PORTUGUESE[normalized];

  if (!translation) {
    const levelLabel = normalized.match(/^Nível (\d+)\s*[-:]\s*(.+)$/i);
    const levelOnly = normalized.match(/^Nível (\d+)$/i);
    const pausedIntensity = normalized.match(
      /^Intensidade reduzida · (\d+) dias em pausa$/i,
    );
    const activityCount = normalized.match(/^(\d+) atividades registadas$/i);
    const fastProgress = normalized.match(/^(\d+)% do objetivo (.+)$/i);
    const readyTarget = normalized.match(/^Pronto para o objetivo (.+)$/i);
    const fastingWindow = normalized.match(
      /^(\d+)h de jejum · (\d+)h de janela$/i,
    );
    const fastingWindowWithDesc = normalized.match(
      /^(\d+)h de jejum · (\d+)h janela · (.+)$/i,
    );
    const nextLevel = normalized.match(/^(\d+) XP PARA NÍVEL (\d+)$/i);
    const weightDelta = normalized.match(
      /^([+-]?[\d.,]+) (kg|lb) desde o registo anterior$/i,
    );
    const confirmedMeals = normalized.match(/^(\d+) refeições confirmadas$/i);
    const remainingScans = normalized.match(/^(\d+) análises grátis hoje$/i);
    const activeTiers = normalized.match(/^(\d+)\/(\d+) Ativas$/i);
    const levelTierRequirement = normalized.match(/^Nv\. (\d+) \((\d+) XP\)$/i);
    const targetWithProtocol = normalized.match(/^Objetivo · (.+)$/i);
    const activePlanTier = normalized.match(/^Plano ativo \((.+)\) · Acesso total$/i);
    const exportPrepared = normalized.match(/^Exportação preparada: (.+)$/i);
    const dailyHours = normalized.match(/^Diário · (\d+)h$/i);
    const phaseNoLimit = normalized.match(/^Fase: (.+) · Sem limite pré-fixado$/i);
    const weightUnitPrompt = normalized.match(
      /^Introduz o teu peso em (kg|lb)\.$/i,
    );
    const unlockFeature = normalized.match(
      /^Desbloqueia (.+) e todas as ferramentas premium\.$/i,
    );
    const levelXpProgress = normalized.match(
      /^(\d+) de (\d+) XP neste nível$/i,
    );
    const nextLevelXpProgress = normalized.match(
      /^(\d+) de (\d+) XP para o próximo nível$/i,
    );
    const editGoalLabel = normalized.match(/^Editar Objetivo (.+)$/i);
    const fastingTimerStatus = normalized.match(
      /^Objetivo (.+), temporizador (.+), Jejum (Ativo|Inativo)$/i,
    );
    const badgeState = normalized.match(/^(.+), (desbloqueada|bloqueada)$/i);
    const currentPhaseLabel = normalized.match(
      /^(\S+), (.+), fase estimada atual$/i,
    );
    const phaseLabel = normalized.match(/^(\S+), (.+)$/i);

    if (levelLabel) {
      translation = `Level ${levelLabel[1]} - ${translateText(levelLabel[2], language)}`;
    } else if (levelOnly) {
      translation = `Level ${levelOnly[1]}`;
    } else if (pausedIntensity) {
      translation = `Reduced intensity · ${pausedIntensity[1]} days paused`;
    } else if (activityCount) {
      translation = `${activityCount[1]} activities logged`;
    } else if (normalized === "1 atividade registada") {
      translation = "1 activity logged";
    } else if (fastProgress) {
      translation = `${fastProgress[1]}% of target ${fastProgress[2]}`;
    } else if (readyTarget) {
      translation = `Ready for target ${readyTarget[1]}`;
    } else if (fastingWindow) {
      translation = `${fastingWindow[1]}h fasting · ${fastingWindow[2]}h eating window`;
    } else if (fastingWindowWithDesc) {
      translation = `${fastingWindowWithDesc[1]}h fasting · ${fastingWindowWithDesc[2]}h window · ${fastingWindowWithDesc[3]}`;
    } else if (nextLevel) {
      translation = `${nextLevel[1]} XP TO LEVEL ${nextLevel[2]}`;
    } else if (weightDelta) {
      translation = `${weightDelta[1]} ${weightDelta[2]} since the previous entry`;
    } else if (confirmedMeals) {
      translation = `${confirmedMeals[1]} confirmed meals`;
    } else if (remainingScans) {
      translation = `${remainingScans[1]} free analyses today`;
    } else if (activeTiers) {
      translation = `${activeTiers[1]}/${activeTiers[2]} Active`;
    } else if (levelTierRequirement) {
      translation = `Lv. ${levelTierRequirement[1]} (${levelTierRequirement[2]} XP)`;
    } else if (targetWithProtocol) {
      translation = `Target · ${targetWithProtocol[1]}`;
    } else if (activePlanTier) {
      translation = `Active plan (${activePlanTier[1]}) · Full access`;
    } else if (exportPrepared) {
      translation = `Export ready: ${exportPrepared[1]}`;
    } else if (dailyHours) {
      translation = `Daily · ${dailyHours[1]}h`;
    } else if (phaseNoLimit) {
      translation = `Phase: ${translateText(phaseNoLimit[1], language)} · No preset limit`;
    } else if (weightUnitPrompt) {
      translation = `Enter your weight in ${weightUnitPrompt[1]}.`;
    } else if (unlockFeature) {
      translation = `Unlock ${translateText(unlockFeature[1], language)} and all premium tools.`;
    } else if (levelXpProgress) {
      translation = `${levelXpProgress[1]} of ${levelXpProgress[2]} XP in this level`;
    } else if (nextLevelXpProgress) {
      translation = `${nextLevelXpProgress[1]} of ${nextLevelXpProgress[2]} XP to the next level`;
    } else if (editGoalLabel) {
      translation = `Edit target ${translateText(editGoalLabel[1], language)}`;
    } else if (fastingTimerStatus) {
      translation = `Target ${translateText(fastingTimerStatus[1], language)}, timer ${fastingTimerStatus[2]}, ${fastingTimerStatus[3].toLowerCase() === "ativo" ? "active" : "inactive"} fast`;
    } else if (badgeState) {
      translation = `${translateText(badgeState[1], language)}, ${badgeState[2].toLowerCase() === "desbloqueada" ? "unlocked" : "locked"}`;
    } else if (currentPhaseLabel) {
      translation = `${currentPhaseLabel[1]}, ${translateText(currentPhaseLabel[2], language)}, current estimated phase`;
    } else if (phaseLabel) {
      translation = `${phaseLabel[1]}, ${translateText(phaseLabel[2], language)}`;
    } else if (normalized.startsWith("Rotina: ")) {
      const routineContent = normalized.replace(/^Rotina:\s*/i, "");
      translation = `Routine: ${translateText(routineContent, language)}`;
    }
  }

  if (!translation) {
    return value;
  }

  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? "";
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? "";
  return `${leadingWhitespace}${translation}${trailingWhitespace}`;
}
