import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import type { WeightEntryRecord } from "@/db/schema";
import {
  deleteWeightEntry,
  getUserProfile,
  getWeightEntries,
  gramsToWeight,
  saveWeightEntry,
  type WeightUnit,
} from "@/services/dbService";
import { deleteRemoteWeightEntry } from "@/services/cloudSyncService";

function formatWeight(weightGrams: number, unit: WeightUnit): string {
  return `${gramsToWeight(weightGrams, unit).toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  })} ${unit}`;
}

export function WeightTrackingCard() {
  const [entries, setEntries] = useState<WeightEntryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [weight, setWeight] = useState("");

  const reload = useCallback(async () => {
    try {
      const [profile, records] = await Promise.all([
        getUserProfile(),
        getWeightEntries(),
      ]);
      setUnit(profile.weightUnit);
      setEntries(records);
      setError(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível carregar os registos de peso.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const delta = useMemo(() => {
    if (entries.length < 2) {
      return null;
    }

    const latest = gramsToWeight(entries[0].weightGrams, unit);
    const previous = gramsToWeight(entries[1].weightGrams, unit);
    const difference = Math.round((latest - previous) * 10) / 10;
    return `${difference > 0 ? "+" : ""}${difference.toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })} ${unit} desde o registo anterior`;
  }, [entries, unit]);

  const save = async () => {
    if (isSaving) {
      return;
    }

    const parsedWeight = Number(weight.trim().replace(",", "."));

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      setError("Introduz um peso válido superior a zero.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      await saveWeightEntry({ unit, weight: parsedWeight });
      setWeight("");
      setIsModalVisible(false);
      await reload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível guardar o registo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (entry: WeightEntryRecord) => {
    Alert.alert(
      "Eliminar este registo?",
      `${formatWeight(entry.weightGrams, unit)} · ${new Date(entry.timestamp).toLocaleDateString()}`,
      [
        { style: "cancel", text: "Cancelar" },
        {
          onPress: () => {
            void getUserProfile()
              .then(async (profile) => {
                if (profile.cloudUserId) {
                  await deleteRemoteWeightEntry(entry.timestamp);
                }
                await deleteWeightEntry(entry.id);
                await reload();
              })
              .catch(() => {
                setError("Não foi possível eliminar este registo.");
              });
          },
          style: "destructive",
          text: "Eliminar",
        },
      ],
    );
  };

  return (
    <>
      <Card>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-xp/10">
              <Ionicons color={COLORS.xp} name="analytics-outline" size={22} />
            </View>
            <View>
              <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
                Registo opcional
              </Text>
              <Text className="mt-1 font-headline text-xl text-foreground">
                Peso
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Adicionar registo de peso"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-xl border border-border bg-background active:opacity-70"
            onPress={() => {
              setError(null);
              setIsModalVisible(true);
            }}
          >
            <Ionicons color={COLORS.xp} name="add" size={23} />
          </Pressable>
        </View>

        {isLoading ? (
          <ActivityIndicator className="my-8" color={COLORS.xp} />
        ) : entries[0] ? (
          <View className="mt-5">
            <View className="flex-row items-center justify-between gap-3">
              <Text className="font-headline text-4xl text-foreground">
                {formatWeight(entries[0].weightGrams, unit)}
              </Text>
              <Pressable
                accessibilityLabel="Eliminar registo de peso"
                className="h-10 w-10 items-center justify-center rounded-xl bg-background active:opacity-60"
                onPress={() => confirmDelete(entries[0])}
              >
                <Ionicons color={COLORS.muted} name="trash-outline" size={18} />
              </Pressable>
            </View>
            <Text className="mt-1 font-body text-sm text-muted">
              {new Date(entries[0].timestamp).toLocaleDateString()}
            </Text>
            {delta ? (
              <View className="mt-3 self-start rounded-full bg-xp/10 px-3 py-1.5">
                <Text className="font-label text-[10px] text-xp">{delta}</Text>
              </View>
            ) : null}

            {entries.slice(1, 4).length ? (
              <View className="mt-5 border-t border-border pt-2">
                {entries.slice(1, 4).map((entry) => (
                  <View className="flex-row items-center py-2" key={entry.id}>
                    <Text className="flex-1 font-body text-sm text-muted">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </Text>
                    <Text className="font-headline text-sm text-foreground">
                      {formatWeight(entry.weightGrams, unit)}
                    </Text>
                    <Pressable
                      accessibilityLabel="Eliminar registo de peso"
                      className="ml-3 h-9 w-9 items-center justify-center active:opacity-60"
                      onPress={() => confirmDelete(entry)}
                    >
                      <Ionicons
                        color={COLORS.muted}
                        name="trash-outline"
                        size={18}
                      />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : (
          <View className="mt-5 rounded-2xl border border-dashed border-border bg-background p-5">
            <Text className="font-headline text-base text-foreground">
              Sem registos
            </Text>
            <Text className="mt-1 font-body text-sm leading-5 text-muted">
              Adiciona apenas se quiseres acompanhar esta medida ao longo do
              tempo.
            </Text>
          </View>
        )}

        {error && !isModalVisible ? (
          <Text className="mt-4 font-body text-xs leading-5 text-red-500">
            {error}
          </Text>
        ) : null}

        <Text className="mt-5 border-t border-border pt-4 font-body text-xs leading-5 text-muted">
          Acompanhamento pessoal descritivo. Não avalia a saúde, não define um
          peso ideal e não substitui orientação profissional.
        </Text>
      </Card>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
        statusBarTranslucent
        transparent
        visible={isModalVisible}
      >
        <SafeAreaView className="flex-1 justify-end bg-black/70 px-4 pb-4">
          <View
            className="rounded-[30px] border border-border bg-surface p-6"
            style={{ alignSelf: "center", maxWidth: 520, width: "100%" }}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
                  Acompanhamento pessoal
                </Text>
                <Text className="mt-1 font-headline text-2xl text-foreground">
                  Novo registo
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                className="h-10 w-10 items-center justify-center rounded-full bg-background"
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons color={COLORS.foreground} name="close" size={22} />
              </Pressable>
            </View>

            <View className="mt-6 flex-row gap-3">
              <TextInput
                accessibilityLabel="Peso"
                autoFocus
                className="min-h-14 flex-1 rounded-2xl border border-border bg-background px-4 font-headline text-lg text-foreground"
                keyboardType="decimal-pad"
                onChangeText={setWeight}
                placeholder="0,0"
                placeholderTextColor={COLORS.muted}
                value={weight}
              />
              <View className="flex-row rounded-2xl border border-border bg-background p-1">
                {(["kg", "lb"] as const).map((option) => (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: unit === option }}
                    className={`min-w-12 items-center justify-center rounded-xl ${
                      unit === option ? "bg-xp" : "bg-transparent"
                    }`}
                    key={option}
                    onPress={() => setUnit(option)}
                  >
                    <Text
                      className={`font-headline text-sm ${
                        unit === option ? "text-background" : "text-muted"
                      }`}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {error ? (
              <Text className="mt-3 font-body text-sm leading-5 text-red-500">
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              className="mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-xp px-5 active:opacity-80 disabled:opacity-50"
              disabled={isSaving}
              onPress={() => void save()}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.background} size="small" />
              ) : (
                <Ionicons
                  color={COLORS.background}
                  name="checkmark"
                  size={20}
                />
              )}
              <Text className="font-headline text-base text-background">
                Guardar registo
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
