import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";

import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import type { FastRecord } from "@/db/schema";
import { deleteFastRecord, getFastRecords } from "@/services/dbService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useFastingStore } from "@/store/useFastingStore";

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.floor(ms / (1000 * 60)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

function formatFastDate(timestamp: number, language: "en" | "pt"): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString(language === "en" ? "en-GB" : "pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) {
    return language === "en" ? `Today, ${timeStr}` : `Hoje, ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString(language === "en" ? "en-GB" : "pt-PT", {
    day: "numeric",
    month: "short",
  });

  return `${dateStr}, ${timeStr}`;
}

export function FastingHistoryCard() {
  const language = useAppPreferencesStore((state) => state.language);
  const historyRevision = useFastingStore((state) => state.historyRevision);
  const [fasts, setFasts] = useState<FastRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const records = await getFastRecords();
      const sorted = [...records].sort((a, b) => b.endTime - a.endTime);
      setFasts(sorted);
    } catch {
      // Keep previous
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  useEffect(() => {
    let isMounted = true;
    void getFastRecords().then((records) => {
      if (isMounted) {
        const sorted = [...records].sort((a, b) => b.endTime - a.endTime);
        setFasts(sorted);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [historyRevision]);


  const handleDeleteFast = useCallback(
    (fastId: number) => {
      Alert.alert(
        language === "en" ? "Delete Fast" : "Eliminar Jejum",
        language === "en"
          ? "Are you sure you want to delete this fast from your history?"
          : "Tens a certeza que queres eliminar este registo de jejum do teu histórico?",
        [
          { text: language === "en" ? "Cancel" : "Cancelar", style: "cancel" },
          {
            text: language === "en" ? "Delete" : "Eliminar",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteFastRecord(fastId);
                setFasts((prev) => prev.filter((f) => f.id !== fastId));
              } catch {
                Alert.alert(
                  language === "en" ? "Error" : "Erro",
                  language === "en"
                    ? "Could not delete the record."
                    : "Não foi possível eliminar o registo.",
                );
              }
            },
          },
        ],
      );
    },
    [language],
  );

  return (
    <View className="border-t border-border pt-5">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            {language === "en" ? "Activity Log" : "Histórico"}
          </Text>
          <Text className="mt-1 font-headline text-lg text-foreground">
            {language === "en" ? "Recent Fasts" : "Jejuns Recentes"}
          </Text>
        </View>
        <View className="flex-row items-center px-1 py-1">
          <Ionicons color={COLORS.muted} name="time-outline" size={14} />
          <Text className="ml-1.5 font-mono text-xs text-muted">
            {fasts.length} {language === "en" ? "records" : "registos"}
          </Text>
        </View>
      </View>

      {isLoading && fasts.length === 0 ? (
        <View className="py-8 items-center justify-center">
          <ActivityIndicator color={COLORS.success} size="small" />
          <Text className="mt-2 font-body text-xs text-muted">
            {language === "en" ? "Loading history…" : "A carregar histórico…"}
          </Text>
        </View>
      ) : fasts.length === 0 ? (
        <View className="mt-4 items-center p-4 text-center">
          <Ionicons color={COLORS.muted} name="calendar-outline" size={28} />
          <Text className="mt-2 font-headline text-sm text-foreground text-center">
            {language === "en" ? "No completed fasts yet" : "Ainda sem jejuns registados"}
          </Text>
          <Text className="mt-1 font-body text-xs leading-4 text-muted text-center">
            {language === "en"
              ? "When you finish your first fast, it will appear here with duration, goal details, and XP earned."
              : "Quando terminares o teu primeiro jejum, ele aparecerá aqui com a duração, meta e XP ganho."}
          </Text>
        </View>
      ) : (
        <View className="mt-4">
          {fasts.slice(0, 10).map((fast) => {
            const durationMs = Math.max(0, fast.endTime - fast.startTime);
            const isCompleted = fast.completed;

            return (
              <View
                key={fast.id}
                className="flex-row items-center justify-between border-b border-border/70 py-3"
              >
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-headline text-base text-foreground">
                      {formatDuration(durationMs)}
                    </Text>
                    <View
                      className={`rounded-md px-1.5 py-0.5 ${
                        isCompleted
                          ? "bg-success/15 border border-success/30"
                          : "bg-[#F59E0B]/15 border border-[#F59E0B]/30"
                      }`}
                    >
                      <Text
                        className={`font-label text-[9px] uppercase tracking-wider font-bold ${
                          isCompleted ? "text-success" : "text-[#FBBF24]"
                        }`}
                      >
                        {isCompleted
                          ? language === "en"
                            ? "Completed"
                            : "Concluído"
                          : language === "en"
                          ? "Ended"
                          : "Terminado"}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-1 flex-row items-center gap-2">
                    <Text className="font-body text-xs text-muted">
                      {formatFastDate(fast.endTime, language)}
                    </Text>
                    <Text className="font-body text-xs text-muted/60">·</Text>
                    <Text className="font-body text-xs text-muted">
                      {fast.targetHours > 0
                        ? `${language === "en" ? "Goal" : "Meta"}: ${fast.targetHours}h`
                        : language === "en"
                        ? "Open Fast"
                        : "Jejum Livre"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  {fast.xpEarned > 0 ? (
                    <View className="flex-row items-center rounded-lg bg-xp/10 px-2 py-1 border border-xp/20">
                      <Ionicons color={COLORS.xp} name="sparkles" size={12} />
                      <Text className="ml-1 font-headline text-xs text-xp">
                        +{fast.xpEarned} XP
                      </Text>
                    </View>
                  ) : null}

                  <Pressable
                    accessibilityLabel={language === "en" ? "Delete fast" : "Eliminar registo de jejum"}
                    accessibilityRole="button"
                    className="h-8 w-8 items-center justify-center rounded-lg bg-border/40 active:opacity-60"
                    onPress={() => handleDeleteFast(fast.id)}
                  >
                    <Ionicons color="#F87171" name="trash-outline" size={16} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
