import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  View,
} from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import type { MealRecord } from '@/db/schema';
import { deleteMealRecord, getMealRecords } from '@/services/dbService';
import { translateText } from '@/services/i18n';
import { useAppPreferencesStore } from '@/store/app-preferences-store';

interface MealHistoryListProps {
  onMealDeleted?: () => void;
  refreshToken?: number;
}

function formatMealDate(timestamp: number, language: 'en' | 'pt'): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString(language === 'en' ? 'en-GB' : 'pt-PT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) {
    return language === 'en' ? `Today, ${timeStr}` : `Hoje, ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString(language === 'en' ? 'en-GB' : 'pt-PT', {
    day: 'numeric',
    month: 'short',
  });

  return `${dateStr}, ${timeStr}`;
}

export function MealHistoryList({
  onMealDeleted,
  refreshToken = 0,
}: MealHistoryListProps) {
  const language = useAppPreferencesStore((state) => state.language);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const records = await getMealRecords();
      const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
      setMeals(sorted);
    } catch {
      // Keep previous state if load fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadMeals();
    }, [loadMeals]),
  );

  useEffect(() => {
    void loadMeals();
  }, [loadMeals, refreshToken]);

  const handleDelete = useCallback(
    (mealId: number) => {
      Alert.alert(
        translateText('Eliminar refeição', language),
        translateText(
          'Tens a certeza que queres eliminar esta refeição do teu histórico?',
          language,
        ),
        [
          {
            style: 'cancel',
            text: language === 'en' ? 'Cancel' : 'Cancelar',
          },
          {
            onPress: async () => {
              try {
                setDeletingId(mealId);
                await deleteMealRecord(mealId);
                setMeals((prev) => prev.filter((m) => m.id !== mealId));
                onMealDeleted?.();
              } catch {
                Alert.alert(
                  language === 'en' ? 'Error' : 'Erro',
                  language === 'en'
                    ? 'Could not delete meal.'
                    : 'Não foi possível eliminar a refeição.',
                );
              } finally {
                setDeletingId(null);
              }
            },
            style: 'destructive',
            text: language === 'en' ? 'Delete' : 'Eliminar',
          },
        ],
      );
    },
    [language, onMealDeleted],
  );

  return (
    <View className="mt-8 border-t border-border pt-6">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-label text-[10px] uppercase tracking-widest text-success">
            {language === 'en' ? 'Activity Log' : 'Histórico'}
          </Text>
          <Text className="mt-1 font-headline text-lg text-foreground">
            {translateText('Refeições Registadas', language)}
          </Text>
        </View>
        <View className="flex-row items-center px-1 py-1">
          <Ionicons color={COLORS.muted} name="restaurant-outline" size={14} />
          <Text className="ml-1.5 font-mono text-xs text-muted">
            {meals.length} {language === 'en' ? 'meals' : 'refeições'}
          </Text>
        </View>
      </View>

      {isLoading && meals.length === 0 ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator color={COLORS.success} size="small" />
          <Text className="mt-2 font-body text-xs text-muted">
            {language === 'en' ? 'Loading meals…' : 'A carregar refeições…'}
          </Text>
        </View>
      ) : meals.length === 0 ? (
        <View className="mt-4 items-center rounded-2xl border border-border/60 bg-surface p-6">
          <Ionicons color={COLORS.muted} name="restaurant-outline" size={28} />
          <Text className="mt-2 text-center font-headline text-sm text-foreground">
            {translateText('Ainda não registaste refeições hoje', language)}
          </Text>
          <Text className="mt-1 text-center font-body text-xs leading-4 text-muted">
            {translateText(
              'As tuas refeições confirmadas aparecerão aqui com fotografia, calorias e macros.',
              language,
            )}
          </Text>
        </View>
      ) : (
        <View className="mt-4 gap-3">
          {meals.map((meal) => {
            const dishName =
              meal.tags && meal.tags.length > 0 && meal.tags[0]?.trim().length > 0
                ? meal.tags[0].trim()
                : translateText('Refeição', language);
            const calories = Math.round(meal.estimatedCalories ?? 0);
            const protein = Math.round(meal.proteinGrams ?? 0);
            const carbs = Math.round(meal.carbsGrams ?? 0);
            const fat = Math.round(meal.fatGrams ?? 0);
            const isDeleting = deletingId === meal.id;

            return (
              <View
                className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-3.5"
                key={meal.id}
              >
                {/* Miniatura ou Ícone */}
                <View className="mr-3">
                  {meal.imageUrl ? (
                    <Image
                      accessibilityLabel={dishName}
                      className="h-13 w-13 rounded-xl border border-border bg-background"
                      resizeMode="cover"
                      source={{ uri: meal.imageUrl }}
                      style={{ height: 52, width: 52 }}
                    />
                  ) : (
                    <View
                      className="items-center justify-center rounded-xl border border-border bg-background"
                      style={{ height: 52, width: 52 }}
                    >
                      <Ionicons
                        color={COLORS.success}
                        name="nutrition-outline"
                        size={22}
                      />
                    </View>
                  )}
                </View>

                {/* Detalhes do Prato e Macros */}
                <View className="min-w-0 flex-1 pr-2">
                  <Text
                    className="font-headline text-sm text-foreground"
                    numberOfLines={1}
                  >
                    {dishName}
                  </Text>
                  <Text className="mt-0.5 font-body text-[11px] text-muted">
                    {formatMealDate(meal.timestamp, language)}
                  </Text>

                  <View className="mt-1.5 flex-row items-center gap-1.5">
                    <Text className="font-label text-[10px] text-success">
                      {protein}g P
                    </Text>
                    <Text className="text-[10px] text-muted/50">·</Text>
                    <Text className="font-label text-[10px] text-xp">
                      {carbs}g H
                    </Text>
                    <Text className="text-[10px] text-muted/50">·</Text>
                    <Text className="font-label text-[10px] text-[#F59E0B]">
                      {fat}g G
                    </Text>
                  </View>
                </View>

                {/* Calorias e Botão Eliminar */}
                <View className="items-end gap-1.5">
                  <View className="flex-row items-baseline">
                    <Text className="font-headline text-base text-foreground">
                      {calories}
                    </Text>
                    <Text className="ml-1 font-body text-[10px] text-muted">
                      kcal
                    </Text>
                  </View>

                  <Pressable
                    accessibilityLabel={translateText('Eliminar refeição', language)}
                    accessibilityRole="button"
                    className="h-8 w-8 items-center justify-center rounded-lg bg-border/40 active:opacity-60"
                    disabled={isDeleting}
                    onPress={() => handleDelete(meal.id)}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="#F87171" size="small" />
                    ) : (
                      <Ionicons color="#F87171" name="trash-outline" size={16} />
                    )}
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
