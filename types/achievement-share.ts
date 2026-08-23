import type { RefObject } from "react";
import type { View } from "react-native";

import type { AppLanguage } from "@/store/app-preferences-store";

export interface AchievementSharePayload {
  badgeTitles: string[];
  language: AppLanguage;
  level: number;
  levelTitle: string;
  streakDays: number;
  totalXp: number;
}

export type AchievementCardRef = RefObject<View | null>;

export type AchievementShareResult =
  | { mode: "cancelled" }
  | { mode: "downloaded"; statusMessage: string }
  | { mode: "shared"; statusMessage: string };
