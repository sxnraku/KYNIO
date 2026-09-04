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
import { useCloudAccount } from "@/hooks/use-cloud-account";
import {
  completeProfileOnboarding,
  getUserProfile,
  type WeightUnit,
} from "@/services/dbService";
import { translateText } from "@/services/i18n";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useFastingScheduleStore } from "@/store/use-fasting-schedule-store";
import { useLegalConsentStore } from "@/store/legal-consent-store";
import { useGuidedTutorialStore } from "@/store/guided-tutorial-store";
import { useFastingStore, type FastingGoalId } from "@/store/useFastingStore";

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

const FASTING_GOALS = [12, 14, 16, 18, 20] as const;

export type OnboardingFocus = "fat_loss" | "autophagy" | "discipline";
export type OnboardingExperience = "beginner" | "intermediate" | "advanced";

export function calculateSuggestedProtocol(
  focus: OnboardingFocus,
  experience: OnboardingExperience,
): number {
  if (experience === "beginner") {
    return focus === "discipline" ? 14 : 16;
  }
  if (experience === "intermediate") {
    return focus === "discipline" ? 16 : 18;
  }
  return 20;
}

export function ProfileOnboardingModal() {
  const cloudAccount = useCloudAccount();
  const language = useAppPreferencesStore((state) => state.language);
  const hasAcceptedTerms = useLegalConsentStore(
    (state) => state.hasAcceptedTerms,
  );
  const [step, setStep] = useState<1 | 2>(1);
  const [focusGoal, setFocusGoal] = useState<OnboardingFocus>("fat_loss");
  const [experience, setExperience] =
    useState<OnboardingExperience>("beginner");

  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [trackWeight, setTrackWeight] = useState(false);
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const setProfileOnboardingComplete = useGuidedTutorialStore(
    (state) => state.setProfileOnboardingComplete,
  );
  const currentTargetHours = useFastingScheduleStore(
    (state) => state.targetHours,
  );
  const setTargetHours = useFastingScheduleStore(
    (state) => state.setTargetHours,
  );
  const [fastingGoal, setFastingGoal] = useState<number>(currentTargetHours);

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

        const onboardingIsComplete = profile.onboardingCompletedAt !== null;
        setIsComplete(onboardingIsComplete);
        setProfileOnboardingComplete(onboardingIsComplete);
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
  }, [hasAcceptedTerms, setProfileOnboardingComplete]);

  const suggestedHours = calculateSuggestedProtocol(focusGoal, experience);

  const handleStep1Continue = () => {
    setFastingGoal(suggestedHours);
    setStep(2);
  };

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
      setTargetHours(fastingGoal);

      // Sincronizar com o timer principal de jejum se for uma meta correspondente
      const matchingGoalId: FastingGoalId =
        fastingGoal === 16
          ? "16:8"
          : fastingGoal === 18
            ? "18:6"
            : fastingGoal === 20
              ? "20:4"
              : "16:8";
      useFastingStore.getState().setGoal(matchingGoalId);

      await completeProfileOnboarding({
        displayName: name,
        initialWeight: trackWeight ? parseOptionalWeight(weight) : undefined,
        weightUnit,
      });
      setIsComplete(true);
      setProfileOnboardingComplete(true);
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
      <SafeAreaView className="flex-1 bg-black/75 px-4 py-3">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-center"
        >
          <View
            className="max-h-[90%] rounded-[32px] border border-border bg-surface"
            style={{ alignSelf: "center", maxWidth: 560, width: "100%" }}
          >
            <ScrollView
              contentContainerStyle={{ padding: 20 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-3 h-1 w-10 self-center rounded-full bg-border" />

              {step === 1 ? (
                /* PASSO 1: QUESTIONÁRIO DE OBJETIVOS & EXPERIÊNCIA */
                <View testID="onboarding-step-1">
                  <View className="flex-row items-center justify-between">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-xp/10">
                      <Ionicons
                        color={COLORS.xp}
                        name="compass-outline"
                        size={24}
                      />
                    </View>
                    <View className="rounded-full border border-xp/20 bg-xp/10 px-3 py-1">
                      <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
                        {translateText("Passo 1 de 2", language)}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-4 font-headline text-2xl text-foreground">
                    {translateText("Personaliza a tua rotina", language)}
                  </Text>
                  <Text className="mt-1 font-body text-sm leading-5 text-muted">
                    {translateText(
                      "Responde a duas perguntas para adaptarmos o mostrador ao teu ritmo.",
                      language,
                    )}
                  </Text>

                  {/* Pergunta 1: Foco Principal */}
                  <Text className="mt-5 font-label text-[10px] uppercase tracking-widest text-success">
                    {translateText(
                      "Qual é o foco principal da tua rotina?",
                      language,
                    )}
                  </Text>
                  <View className="mt-2.5 gap-2">
                    {[
                      {
                        desc: "Estimular o metabolismo e a queima de reservas corporais.",
                        icon: "flame-outline" as const,
                        id: "fat_loss" as const,
                        title: "Queima de Gordura & Leveza",
                      },
                      {
                        desc: "Promover a longevidade e a limpeza metabólica celular.",
                        icon: "leaf-outline" as const,
                        id: "autophagy" as const,
                        title: "Autofagia & Renovação Celular",
                      },
                      {
                        desc: "Estabilizar níveis de energia e foco cognitivo constante.",
                        icon: "bulb-outline" as const,
                        id: "discipline" as const,
                        title: "Clareza Mental & Disciplina",
                      },
                    ].map((item) => {
                      const selected = focusGoal === item.id;
                      return (
                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          className={`flex-row items-center rounded-2xl border p-3.5 active:opacity-75 ${
                            selected
                              ? "border-xp bg-xp/10"
                              : "border-border bg-background"
                          }`}
                          key={item.id}
                          onPress={() => setFocusGoal(item.id)}
                          testID={`focus-option-${item.id}`}
                        >
                          <View
                            className={`h-9 w-9 items-center justify-center rounded-xl ${
                              selected ? "bg-xp" : "bg-surface-raised"
                            }`}
                          >
                            <Ionicons
                              color={
                                selected ? COLORS.background : COLORS.foreground
                              }
                              name={item.icon}
                              size={18}
                            />
                          </View>
                          <View className="ml-3 flex-1">
                            <Text
                              className={`font-headline text-sm ${
                                selected ? "text-xp" : "text-foreground"
                              }`}
                            >
                              {translateText(item.title, language)}
                            </Text>
                            <Text className="mt-0.5 font-body text-xs leading-4 text-muted">
                              {translateText(item.desc, language)}
                            </Text>
                          </View>
                          {selected ? (
                            <Ionicons
                              color={COLORS.xp}
                              name="checkmark-circle"
                              size={20}
                            />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Pergunta 2: Nível de Experiência */}
                  <Text className="mt-5 font-label text-[10px] uppercase tracking-widest text-success">
                    {translateText(
                      "Qual é a tua experiência com jejum?",
                      language,
                    )}
                  </Text>
                  <View className="mt-2.5 gap-2">
                    {[
                      {
                        desc: "Primeira vez ou faço jejum de forma esporádica.",
                        id: "beginner" as const,
                        title: "Iniciante",
                      },
                      {
                        desc: "Já pratico 14h ou 16h com frequência semanal.",
                        id: "intermediate" as const,
                        title: "Intermédio",
                      },
                      {
                        desc: "Habituado a janelas longas (18h, 20h ou 24h).",
                        id: "advanced" as const,
                        title: "Avançado",
                      },
                    ].map((item) => {
                      const selected = experience === item.id;
                      return (
                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          className={`flex-row items-center rounded-2xl border p-3.5 active:opacity-75 ${
                            selected
                              ? "border-xp bg-xp/10"
                              : "border-border bg-background"
                          }`}
                          key={item.id}
                          onPress={() => setExperience(item.id)}
                          testID={`experience-option-${item.id}`}
                        >
                          <View className="flex-1">
                            <Text
                              className={`font-headline text-sm ${
                                selected ? "text-xp" : "text-foreground"
                              }`}
                            >
                              {translateText(item.title, language)}
                            </Text>
                            <Text className="mt-0.5 font-body text-xs leading-4 text-muted">
                              {translateText(item.desc, language)}
                            </Text>
                          </View>
                          {selected ? (
                            <Ionicons
                              color={COLORS.xp}
                              name="checkmark-circle"
                              size={20}
                            />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Cartão de Sugestão Dinâmica */}
                  <View className="mt-4 rounded-2xl border border-xp/30 bg-xp/10 p-3.5">
                    <View className="flex-row items-center gap-2">
                      <Ionicons
                        color={COLORS.xp}
                        name="sparkles"
                        size={16}
                      />
                      <Text className="font-label text-[10px] uppercase tracking-wider text-xp">
                        {translateText("SUGESTÃO INICIAL", language)}
                      </Text>
                      <Text className="font-headline text-xs text-foreground">
                        {`· Protocolo ${suggestedHours}:${24 - suggestedHours}`}
                      </Text>
                    </View>
                    <Text className="mt-1 font-body text-xs leading-4 text-muted">
                      {translateText(
                        "Sugerimos esta janela para começares com equilíbrio. Terás total liberdade para ajustar nas definições.",
                        language,
                      )}
                    </Text>
                  </View>

                  <Text className="mt-3 text-center font-body text-[11px] text-muted">
                    {translateText(
                      "Acompanhamento de estilo de vida; não constitui prescrição médica ou dietética.",
                      language,
                    )}
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    className="mt-4 min-h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-success px-5 active:opacity-80"
                    onPress={handleStep1Continue}
                    testID="onboarding-step1-continue"
                  >
                    <Text className="font-headline text-base text-background">
                      {translateText("Continuar", language)}
                    </Text>
                    <Ionicons
                      color={COLORS.background}
                      name="arrow-forward"
                      size={18}
                    />
                  </Pressable>
                </View>
              ) : (
                /* PASSO 2: IDENTIDADE DO PERFIL & CONFIRMAÇÃO */
                <View testID="onboarding-step-2">
                  <View className="flex-row items-center justify-between">
                    <Pressable
                      accessibilityRole="button"
                      className="flex-row items-center gap-1 py-1 pr-3 active:opacity-70"
                      onPress={() => setStep(1)}
                      testID="onboarding-back-to-step1"
                    >
                      <Ionicons
                        color={COLORS.muted}
                        name="arrow-back"
                        size={18}
                      />
                      <Text className="font-headline text-xs text-muted">
                        {translateText("Voltar", language)}
                      </Text>
                    </Pressable>
                    <View className="rounded-full border border-xp/20 bg-xp/10 px-3 py-1">
                      <Text className="font-label text-[10px] uppercase tracking-widest text-xp">
                        {translateText("Passo 2 de 2", language)}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-3 font-headline text-2xl text-foreground">
                    {translateText("Dá identidade à tua jornada", language)}
                  </Text>
                  <Text className="mt-1 font-body text-sm leading-5 text-muted">
                    {translateText(
                      "Escolhe o nome que aparece no teu perfil. Podes alterá-lo mais tarde.",
                      language,
                    )}
                  </Text>

                  <Text className="mt-5 font-label text-[10px] uppercase tracking-widest text-success">
                    {translateText("Nome do perfil", language)}
                  </Text>
                  <TextInput
                    accessibilityLabel={translateText(
                      "Nome do perfil",
                      language,
                    )}
                    autoCapitalize="words"
                    className="mt-2 min-h-14 rounded-2xl border border-border bg-background px-4 font-body text-base text-foreground"
                    maxLength={40}
                    onChangeText={setDisplayName}
                    placeholder={translateText("Como queres aparecer?", language)}
                    placeholderTextColor={COLORS.muted}
                    testID="profile-name-input"
                    value={displayName}
                  />

                  {cloudAccount.account ? (
                    <View className="mt-3 flex-row items-center rounded-2xl border border-success/20 bg-success/10 p-3">
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-success">
                        <Ionicons
                          color={COLORS.background}
                          name="checkmark"
                          size={20}
                        />
                      </View>
                      <View className="ml-3 min-w-0 flex-1">
                        <Text className="font-headline text-sm text-foreground">
                          {translateText("Conta Google ligada", language)}
                        </Text>
                        <Text
                          className="mt-0.5 font-body text-xs text-muted"
                          numberOfLines={1}
                        >
                          {cloudAccount.account.email ??
                            cloudAccount.account.displayName}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ disabled: cloudAccount.isLoading }}
                      className="mt-3 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 active:opacity-70 disabled:opacity-60"
                      disabled={cloudAccount.isLoading}
                      onPress={() => void cloudAccount.signIn()}
                    >
                      {cloudAccount.isLoading ? (
                        <ActivityIndicator
                          color={COLORS.foreground}
                          size="small"
                        />
                      ) : (
                        <Ionicons
                          color="#4285F4"
                          name="logo-google"
                          size={19}
                        />
                      )}
                      <Text className="font-headline text-sm text-foreground">
                        {translateText("Ligar Google agora · opcional", language)}
                      </Text>
                    </Pressable>
                  )}

                  {cloudAccount.error ? (
                    <Text className="mt-2 font-body text-xs leading-4 text-red-500">
                      {cloudAccount.error}
                    </Text>
                  ) : null}

                  {/* Acompanhar Peso Opcional */}
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: trackWeight }}
                    className="mt-3 flex-row items-center rounded-2xl border border-border bg-background p-3 active:opacity-70"
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
                        {translateText("Quero acompanhar o meu peso", language)}
                      </Text>
                      <Text className="mt-0.5 font-body text-xs leading-4 text-muted">
                        {translateText(
                          "Opcional, descritivo e sem metas obrigatórias.",
                          language,
                        )}
                      </Text>
                    </View>
                  </Pressable>

                  {trackWeight ? (
                    <View className="mt-3 flex-row gap-3">
                      <TextInput
                        accessibilityLabel={translateText(
                          "Peso inicial opcional",
                          language,
                        )}
                        className="min-h-14 flex-1 rounded-2xl border border-border bg-background px-4 font-body text-base text-foreground"
                        keyboardType="decimal-pad"
                        onChangeText={setWeight}
                        placeholder={translateText("Peso atual (opcional)", language)}
                        placeholderTextColor={COLORS.muted}
                        value={weight}
                      />
                      <View className="flex-row rounded-2xl border border-border bg-background p-1">
                        {(["kg", "lb"] as const).map((unit) => (
                          <Pressable
                            accessibilityRole="radio"
                            accessibilityState={{
                              checked: weightUnit === unit,
                            }}
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

                  {/* Objetivo Diário (Com Protocolo Sugerido Já Pré-selecionado) */}
                  <Text className="mt-5 font-label text-[10px] uppercase tracking-widest text-success">
                    {translateText("Objetivo de jejum diário", language)}
                  </Text>
                  <Text className="mt-1 font-body text-xs leading-4 text-muted">
                    {translateText(
                      "Escolhe a meta com que queres começar. Podes mudá-la quando quiseres.",
                      language,
                    )}
                  </Text>
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    {FASTING_GOALS.map((hours) => {
                      const selected = fastingGoal === hours;
                      return (
                        <Pressable
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          className={`min-h-11 min-w-14 items-center justify-center rounded-full border px-4 active:opacity-70 ${
                            selected
                              ? "border-xp bg-xp"
                              : "border-border bg-background"
                          }`}
                          key={hours}
                          onPress={() => setFastingGoal(hours)}
                          testID={`fasting-goal-${hours}`}
                        >
                          <Text
                            className={`font-headline text-sm ${
                              selected ? "text-background" : "text-foreground"
                            }`}
                          >
                            {`${hours}:${24 - hours}`}
                          </Text>
                        </Pressable>
                      );
                    })}
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
                      <ActivityIndicator
                        color={COLORS.background}
                        size="small"
                      />
                    ) : null}
                    <Text className="font-headline text-base text-background">
                      {translateText("Começar a Minha Jornada", language)}
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
