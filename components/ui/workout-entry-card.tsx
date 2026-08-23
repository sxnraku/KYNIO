import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/text";
import { TextInput } from "@/components/ui/text-input";

import { Card } from "@/components/ui/card";
import { COLORS } from "@/constants/colors";
import {
  EFFORT_LABELS,
  type WorkoutEffort,
  WORKOUT_OPTIONS,
} from "@/types/workout";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, IconName> = {
  cycling: "bicycle-outline",
  mobility: "body-outline",
  other: "add-circle-outline",
  run: "walk-outline",
  strength: "barbell-outline",
  walk: "footsteps-outline",
};

const DURATION_PRESETS = ["15", "30", "45", "60"];
const EFFORT_OPTIONS: WorkoutEffort[] = ["light", "moderate", "intense"];

interface WorkoutEntryCardProps {
  duration: string;
  effort: WorkoutEffort;
  isSaving: boolean;
  notes: string;
  onChangeDuration: (value: string) => void;
  onChangeEffort: (value: WorkoutEffort) => void;
  onChangeNotes: (value: string) => void;
  onChangeType: (value: string) => void;
  onSave: () => void;
  selectedType: string;
}

export function WorkoutEntryCard({
  duration,
  effort,
  isSaving,
  notes,
  onChangeDuration,
  onChangeEffort,
  onChangeNotes,
  onChangeType,
  onSave,
  selectedType,
}: WorkoutEntryCardProps) {
  return (
    <Card>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-headline text-xl text-foreground">
            Registar atividade
          </Text>
          <Text className="mt-1 font-body text-sm text-muted">
            O que fizeste hoje?
          </Text>
        </View>
        <View className="rounded-full bg-xp/10 px-3 py-2">
          <Text className="font-label text-[10px] text-xp">+50 XP</Text>
        </View>
      </View>

      <ScrollView
        className="-mx-5 mt-5"
        contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {WORKOUT_OPTIONS.map((option) => {
          const selected = selectedType === option.id;
          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "min-w-[84px] items-center rounded-2xl bg-success px-3 py-4"
                  : "min-w-[84px] items-center rounded-2xl border border-border bg-surface-raised px-3 py-4"
              }
              key={option.id}
              onPress={() => onChangeType(option.id)}
            >
              <Ionicons
                color={selected ? "#FFFFFF" : COLORS.foreground}
                name={ICONS[option.id]}
                size={22}
              />
              <Text
                className={
                  selected
                    ? "mt-2 font-headline text-xs text-white"
                    : "mt-2 font-headline text-xs text-foreground"
                }
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text className="mb-3 mt-6 font-label text-[10px] uppercase tracking-widest text-muted">
        Duração em minutos
      </Text>
      <View className="flex-row gap-2">
        {DURATION_PRESETS.map((preset) => {
          const selected = duration === preset;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "flex-1 items-center rounded-xl border border-success bg-success-dark py-3"
                  : "flex-1 items-center rounded-xl border border-border bg-surface-raised py-3"
              }
              key={preset}
              onPress={() => onChangeDuration(preset)}
            >
              <Text
                className={
                  selected
                    ? "font-headline text-sm text-success"
                    : "font-headline text-sm text-muted"
                }
              >
                {preset}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-2 flex-row items-center rounded-xl border border-border bg-surface-raised px-4">
        <TextInput
          accessibilityLabel="Duração personalizada em minutos"
          className="min-w-0 flex-1 py-3 font-body text-base text-foreground"
          inputMode="numeric"
          maxLength={4}
          onChangeText={onChangeDuration}
          placeholder="Outra duração"
          placeholderTextColor={COLORS.muted}
          value={duration}
        />
        <Text className="font-body text-sm text-muted">min</Text>
      </View>

      <Text className="mb-3 mt-6 font-label text-[10px] uppercase tracking-widest text-muted">
        Esforço percebido
      </Text>
      <View className="flex-row rounded-2xl bg-background p-1">
        {EFFORT_OPTIONS.map((option) => {
          const selected = effort === option;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={
                selected
                  ? "flex-1 items-center rounded-xl bg-surface py-3"
                  : "flex-1 items-center py-3"
              }
              key={option}
              onPress={() => onChangeEffort(option)}
            >
              <Text
                className={
                  selected
                    ? "font-headline text-xs text-foreground"
                    : "font-body text-xs text-muted"
                }
              >
                {EFFORT_LABELS[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        accessibilityLabel="Notas opcionais sobre a atividade"
        className="mt-4 min-h-[72px] rounded-xl border border-border bg-surface-raised px-4 py-3 font-body text-sm text-foreground"
        maxLength={240}
        multiline
        onChangeText={onChangeNotes}
        placeholder="Notas opcionais: percurso, como te sentiste…"
        placeholderTextColor={COLORS.muted}
        textAlignVertical="top"
        value={notes}
      />

      <Pressable
        accessibilityRole="button"
        className={
          isSaving
            ? "mt-5 flex-row items-center justify-center rounded-2xl bg-success/50 py-4"
            : "mt-5 flex-row items-center justify-center rounded-2xl bg-success py-4"
        }
        disabled={isSaving}
        onPress={onSave}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Ionicons color="#FFFFFF" name="add" size={20} />
        )}
        <Text className="ml-2 font-headline text-sm text-white">
          {isSaving ? "A guardar…" : "Guardar atividade · +50 XP"}
        </Text>
      </Pressable>

      <View className="mt-4 flex-row items-start gap-2 rounded-xl bg-background p-3">
        <Ionicons
          color={COLORS.muted}
          name="information-circle-outline"
          size={17}
        />
        <Text className="flex-1 font-body text-xs leading-[18px] text-muted">
          Regista apenas atividade já realizada. A app não recomenda duração,
          intensidade ou um plano de treino.
        </Text>
      </View>
    </Card>
  );
}
