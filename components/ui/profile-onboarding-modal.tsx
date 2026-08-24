import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/text";
import { COLORS } from "@/constants/colors";
import {
  completeProfileOnboarding,
  getUserProfile,
  type WeightUnit,
} from "@/services/dbService";
import { useLegalConsentStore } from "@/store/legal-consent-store";

function parseOptionalWeight(value: string): number | undefined {
  const normalized = value.trim().replace(",", ".");

  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("Introduz um peso válido ou deixa o campo vazio.");
  }

  return parsed;
}

export function ProfileOnboardingModal() {
  const hasAcceptedTerms = useLegalConsentStore(
    (state) => state.hasAcceptedTerms,
  );
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [trackWeight, setTrackWeight] = useState(false);
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");

  useEffect(() => {
    if (!hasAcceptedTerms) {
      return;
    }

    let isMounted = true;

    void getUserProfile()
      .then((profile) => {
        if (!isMounted) {
          return;
        }

        setIsComplete(profile.onboardingCompletedAt !== null);
        setWeightUnit(profile.weightUnit);
        if (profile.displayName !== "Utilizador KYNIO") {
          setDisplayName(profile.displayName);
        }
        setIsReady(true);
        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setError("Não foi possível preparar o perfil. Tenta novamente.");
          setIsReady(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [hasAcceptedTerms]);

  const finishOnboarding = async () => {
    if (isLoading) {
      return;
    }

    const name = displayName.trim();

    if (!name) {
      setError("Escolhe um nome para o teu perfil.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await completeProfileOnboarding({
        displayName: name,
        initialWeight: trackWeight ? parseOptionalWeight(weight) : undefined,
        weightUnit,
      });
      setIsComplete(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível guardar o perfil.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isVisible = hasAcceptedTerms && isReady && !isComplete;

  return (
    <Modal
      animationType="slide"
      onRequestClose={() => undefined}
      statusBarTranslucent
      transparent
      visible={isVisible}
    >
      <SafeAreaView className="flex-1 justify-end bg-black/70">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            className="max-h-[92%] rounded-t-[34px] border border-border bg-surface"
            style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}
          >
            <ScrollView
              contentContainerStyle={{ padding: 24, paddingBottom: 30 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-5 h-1 w-10 self-center rounded-full bg-border" />
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-xp/10">
                <Ionicons color={COLORS.xp} name="sparkles-outline" size={25} />
              </View>

              <Text className="mt-5 font-headline text-2xl text-foreground">
                Dá identidade à tua jornada
              </Text>
              <Text className="mt-2 font-body text-base leading-6 text-muted">
                Escolhe o nome que aparece no teu perfil. Podes alterá-lo mais
                tarde.
              </Text>

              <Text className="mt-6 font-label text-[10px] uppercase tracking-widest text-success">
                Nome do perfil
              </Text>
              <TextInput
                accessibilityLabel="Nome do perfil"
                autoCapitalize="words"
                className="mt-2 min-h-14 rounded-2xl border border-border bg-background px-4 font-body text-base text-foreground"
                maxLength={40}
                onChangeText={setDisplayName}
                placeholder="Como queres aparecer?"
                placeholderTextColor={COLORS.muted}
                testID="profile-name-input"
                value={displayName}
              />

              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: trackWeight }}
                className="mt-5 flex-row items-center rounded-2xl border border-border bg-background p-4 active:opacity-70"
                onPress={() => setTrackWeight((current) => !current)}
              >
                <View
                  className={`h-6 w-6 items-center justify-center rounded-md border ${
                    trackWeight ? "border-xp bg-xp" : "border-muted"
                  }`}
                >
                  {trackWeight ? (
                    <Ionicons
                      color={COLORS.background}
                      name="checkmark"
                      size={18}
                    />
                  ) : null}
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-headline text-base text-foreground">
                    Quero acompanhar o meu peso
                  </Text>
                  <Text className="mt-1 font-body text-xs leading-4 text-muted">
                    Opcional, descritivo e sem metas obrigatórias.
                  </Text>
                </View>
              </Pressable>

              {trackWeight ? (
                <View className="mt-3 flex-row gap-3">
                  <TextInput
                    accessibilityLabel="Peso inicial opcional"
                    className="min-h-14 flex-1 rounded-2xl border border-border bg-background px-4 font-body text-base text-foreground"
                    keyboardType="decimal-pad"
                    onChangeText={setWeight}
                    placeholder="Peso atual (opcional)"
                    placeholderTextColor={COLORS.muted}
                    value={weight}
                  />
                  <View className="flex-row rounded-2xl border border-border bg-background p-1">
                    {(["kg", "lb"] as const).map((unit) => (
                      <Pressable
                        accessibilityRole="radio"
                        accessibilityState={{ checked: weightUnit === unit }}
                        className={`min-w-12 items-center justify-center rounded-xl px-3 ${
                          weightUnit === unit ? "bg-xp" : "bg-transparent"
                        }`}
                        key={unit}
                        onPress={() => setWeightUnit(unit)}
                      >
                        <Text
                          className={`font-headline text-sm ${
                            weightUnit === unit
                              ? "text-background"
                              : "text-muted"
                          }`}
                        >
                          {unit}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <View className="mt-5 flex-row items-start gap-3 rounded-2xl bg-xp/5 p-4">
                <Ionicons
                  color={COLORS.xp}
                  name="information-circle-outline"
                  size={20}
                />
                <Text className="flex-1 font-body text-xs leading-5 text-muted">
                  O registo de peso serve apenas para acompanhamento pessoal.
                  Não avalia a tua saúde, não define um peso ideal e não
                  substitui orientação profissional.
                </Text>
              </View>

              {error ? (
                <Text className="mt-4 font-body text-sm leading-5 text-red-500">
                  {error}
                </Text>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: isLoading || !displayName.trim(),
                }}
                className="mt-5 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-success px-5 active:opacity-80 disabled:opacity-50"
                disabled={isLoading || !displayName.trim()}
                onPress={() => void finishOnboarding()}
                testID="profile-onboarding-continue"
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : null}
                <Text className="font-headline text-base text-background">
                  Continuar
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
