import type {
  AchievementCardRef,
  AchievementSharePayload,
  AchievementShareResult,
} from "@/types/achievement-share";

// Metro troca este ficheiro por .native.ts ou .web.ts consoante a plataforma.
export async function shareAchievementCard(
  _cardRef: AchievementCardRef,
  _payload: AchievementSharePayload,
): Promise<AchievementShareResult> {
  throw new Error(
    "A partilha de conquistas não está disponível nesta plataforma.",
  );
}
