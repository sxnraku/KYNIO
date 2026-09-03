import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/constants/colors';
import type { AppLanguage } from '@/store/app-preferences-store';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useGuidedTutorialStore } from '@/store/guided-tutorial-store';
import { useLegalConsentStore } from '@/store/legal-consent-store';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface TutorialBullet {
  description: string;
  icon: IoniconName;
  title: string;
}

interface TutorialStep {
  accent: string;
  badge: string;
  bullets: readonly TutorialBullet[];
  description: string;
  icon: IoniconName;
  previewLabels: readonly string[];
  title: string;
}

interface TutorialCopy {
  back: string;
  finish: string;
  next: string;
  replayHint: string;
  skip: string;
  stepLabel: (current: number, total: number) => string;
  steps: readonly TutorialStep[];
}

const TUTORIAL_COPY: Record<AppLanguage, TutorialCopy> = {
  pt: {
    back: 'Voltar',
    finish: 'Entrar na KYNIO',
    next: 'Continuar',
    replayHint: 'Podes rever este guia em Perfil → Definições.',
    skip: 'Saltar guia',
    stepLabel: (current, total) => `Passo ${current} de ${total}`,
    steps: [
      {
        accent: '#D9922E',
        badge: 'JEJUM',
        bullets: [
          {
            description:
              'Inicia agora ou indica quando já tinhas começado; o relógio continua com a app fechada.',
            icon: 'time-outline',
            title: 'O teu horário real',
          },
          {
            description:
              'Escolhe 16:8, 18:6, 20:4 ou 24h como referência ajustável.',
            icon: 'options-outline',
            title: 'Objetivo flexível',
          },
          {
            description:
              'As fases apresentadas são estimativas gerais e variam entre pessoas.',
            icon: 'information-circle-outline',
            title: 'Estimativas, não diagnóstico',
          },
        ],
        description:
          'Acompanha o tempo ao teu ritmo, sem teres de manter a aplicação aberta.',
        icon: 'timer-outline',
        previewLabels: ['16:8', '18:6', '20:4', '24h'],
        title: 'Jejum que acompanha a vida real',
      },
      {
        accent: '#14B8A6',
        badge: 'REFEIÇÕES',
        bullets: [
          {
            description:
              'Usa a câmara em direto, a galeria ou uma descrição escrita.',
            icon: 'camera-outline',
            title: 'Registo à tua escolha',
          },
          {
            description:
              'Calorias e macros são aproximações e ficam sempre editáveis antes de guardar.',
            icon: 'create-outline',
            title: 'Revê antes de confirmar',
          },
          {
            description:
              'Só a fotografia e/ou descrição escolhida é enviada à Gemini quando pedes a análise.',
            icon: 'shield-checkmark-outline',
            title: 'Envio limitado ao pedido',
          },
        ],
        description:
          'A IA organiza uma estimativa estruturada; tu manténs sempre o controlo dos valores.',
        icon: 'restaurant-outline',
        previewLabels: ['Foto', 'Descrição', 'Editar'],
        title: 'Refeições com revisão humana',
      },
      {
        accent: '#D9922E',
        badge: 'RITMO',
        bullets: [
          {
            description:
              'Regista apenas a atividade que decidiste realizar; não há planos ou intensidades obrigatórias.',
            icon: 'barbell-outline',
            title: 'Movimento já realizado',
          },
          {
            description:
              'Jejuns, refeições e atividades confirmadas atribuem XP de forma transparente.',
            icon: 'diamond-outline',
            title: 'XP por consistência',
          },
          {
            description:
              'Uma pausa suaviza a linha de consistência sem apagar o teu histórico.',
            icon: 'flame-outline',
            title: 'Sem castigos drásticos',
          },
        ],
        description:
          'A gamificação descreve os teus registos e incentiva continuidade, sem prescrever treino.',
        icon: 'analytics-outline',
        previewLabels: ['+100 XP', '+30 XP', '+50 XP'],
        title: 'Progresso sem pressão',
      },
      {
        accent: '#F59E0B',
        badge: 'CONTROLO',
        bullets: [
          {
            description:
              'O perfil, a bio e o peso opcional começam no dispositivo.',
            icon: 'person-outline',
            title: 'Perfil pessoal',
          },
          {
            description:
              'A conta Google é opcional e permite sincronizar os teus registos entre dispositivos.',
            icon: 'cloud-outline',
            title: 'Sincronização opcional',
          },
          {
            description:
              'Nas Definições podes rever este guia, exportar dados ou eliminar tudo.',
            icon: 'settings-outline',
            title: 'Tu decides',
          },
        ],
        description:
          'Privacidade, sincronização e histórico ficam reunidos num local simples e verificável.',
        icon: 'lock-closed-outline',
        previewLabels: ['Perfil', 'Exportar', 'Eliminar'],
        title: 'Os teus dados, as tuas escolhas',
      },
    ],
  },
  en: {
    back: 'Back',
    finish: 'Enter KYNIO',
    next: 'Continue',
    replayHint: 'You can replay this guide in Profile → Settings.',
    skip: 'Skip guide',
    stepLabel: (current, total) => `Step ${current} of ${total}`,
    steps: [
      {
        accent: '#D9922E',
        badge: 'FASTING',
        bullets: [
          {
            description:
              'Start now or enter when you had already begun; the timer continues while the app is closed.',
            icon: 'time-outline',
            title: 'Your real start time',
          },
          {
            description:
              'Choose 16:8, 18:6, 20:4 or 24h as an adjustable reference.',
            icon: 'options-outline',
            title: 'Flexible target',
          },
          {
            description:
              'Displayed phases are general estimates and vary from person to person.',
            icon: 'information-circle-outline',
            title: 'Estimates, not diagnosis',
          },
        ],
        description:
          'Track time at your own pace without keeping the application open.',
        icon: 'timer-outline',
        previewLabels: ['16:8', '18:6', '20:4', '24h'],
        title: 'Fasting that fits real life',
      },
      {
        accent: '#14B8A6',
        badge: 'MEALS',
        bullets: [
          {
            description:
              'Use the live camera, your gallery or a written description.',
            icon: 'camera-outline',
            title: 'Your choice of input',
          },
          {
            description:
              'Calories and macros are approximations and remain editable before saving.',
            icon: 'create-outline',
            title: 'Review before confirming',
          },
          {
            description:
              'Only the selected photo and/or description is sent to Gemini when you request analysis.',
            icon: 'shield-checkmark-outline',
            title: 'Limited to your request',
          },
        ],
        description:
          'AI prepares a structured estimate; you always keep control of the values.',
        icon: 'restaurant-outline',
        previewLabels: ['Photo', 'Description', 'Edit'],
        title: 'Meals with human review',
      },
      {
        accent: '#D9922E',
        badge: 'RHYTHM',
        bullets: [
          {
            description:
              'Only log activity you chose to complete; there are no mandatory plans or intensities.',
            icon: 'barbell-outline',
            title: 'Completed movement',
          },
          {
            description:
              'Confirmed fasts, meals and activities award XP transparently.',
            icon: 'diamond-outline',
            title: 'XP for consistency',
          },
          {
            description:
              'A pause softens your consistency line without deleting history.',
            icon: 'flame-outline',
            title: 'No harsh penalties',
          },
        ],
        description:
          'Gamification describes your logs and encourages continuity without prescribing exercise.',
        icon: 'analytics-outline',
        previewLabels: ['+100 XP', '+30 XP', '+50 XP'],
        title: 'Progress without pressure',
      },
      {
        accent: '#F59E0B',
        badge: 'CONTROL',
        bullets: [
          {
            description:
              'Your profile, bio and optional weight tracking begin on your device.',
            icon: 'person-outline',
            title: 'Personal profile',
          },
          {
            description:
              'A Google account is optional and can sync your logs across devices.',
            icon: 'cloud-outline',
            title: 'Optional sync',
          },
          {
            description:
              'In Settings you can replay this guide, export data or delete everything.',
            icon: 'settings-outline',
            title: 'You decide',
          },
        ],
        description:
          'Privacy, syncing and history are gathered in one clear, verifiable place.',
        icon: 'lock-closed-outline',
        previewLabels: ['Profile', 'Export', 'Delete'],
        title: 'Your data, your choices',
      },
    ],
  },
};

export function GuidedTutorialModal() {
  const language = useAppPreferencesStore((state) => state.language);
  const hasAcceptedTerms = useLegalConsentStore(
    (state) => state.hasAcceptedTerms,
  );
  const completeTutorial = useGuidedTutorialStore(
    (state) => state.completeTutorial,
  );
  const currentStep = useGuidedTutorialStore((state) => state.currentStep);
  const hasCompletedTutorial = useGuidedTutorialStore(
    (state) => state.hasCompletedTutorial,
  );
  const hasHydrated = useGuidedTutorialStore((state) => state.hasHydrated);
  const profileOnboardingComplete = useGuidedTutorialStore(
    (state) => state.profileOnboardingComplete,
  );
  const setCurrentStep = useGuidedTutorialStore(
    (state) => state.setCurrentStep,
  );
  const copy = TUTORIAL_COPY[language];
  const safeStep = Math.min(currentStep, copy.steps.length - 1);
  const step = copy.steps[safeStep];
  const isLastStep = safeStep === copy.steps.length - 1;
  const isVisible =
    hasAcceptedTerms &&
    hasHydrated &&
    profileOnboardingComplete &&
    !hasCompletedTutorial;

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => undefined}
      statusBarTranslucent
      transparent
      visible={isVisible}
    >
      <SafeAreaView
        className="flex-1 bg-black/80 px-4 py-4"
        testID="guided-tutorial-modal"
      >
        <View
          className="flex-1 overflow-hidden rounded-[34px] border border-border bg-surface"
          style={{ alignSelf: 'center', maxWidth: 560, width: '100%' }}
        >
          <View className="flex-row items-center justify-between px-5 pb-3 pt-5">
            <Text
              className="font-label text-[10px] uppercase tracking-[1.8px] text-muted"
              translate={false}
            >
              {copy.stepLabel(safeStep + 1, copy.steps.length)}
            </Text>
            <Pressable
              accessibilityLabel={copy.skip}
              accessibilityRole="button"
              className="min-h-10 justify-center rounded-full px-3 active:opacity-60"
              onPress={completeTutorial}
              testID="tutorial-skip-button"
            >
              <Text
                className="font-headline text-sm text-muted"
                translate={false}
              >
                {copy.skip}
              </Text>
            </Pressable>
          </View>

          <View className="flex-row gap-2 px-5">
            {copy.steps.map((item, index) => (
              <View
                className="h-1 flex-1 rounded-full"
                key={item.badge}
                style={{
                  backgroundColor:
                    index <= safeStep ? step.accent : COLORS.border,
                }}
              />
            ))}
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              className="mt-2 overflow-hidden rounded-[28px] border border-border p-5"
              style={{ backgroundColor: `${step.accent}12` }}
            >
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${step.accent}22` }}
              >
                <Ionicons color={step.accent} name={step.icon} size={29} />
              </View>
              <Text
                className="mt-5 font-label text-[10px] uppercase tracking-[2px]"
                style={{ color: step.accent }}
                translate={false}
              >
                {step.badge}
              </Text>
              <Text
                className="mt-2 font-headline text-3xl leading-9 text-foreground"
                translate={false}
              >
                {step.title}
              </Text>
              <Text
                className="mt-3 font-body text-base leading-6 text-muted"
                translate={false}
              >
                {step.description}
              </Text>

              <View className="mt-5 flex-row flex-wrap gap-2">
                {step.previewLabels.map((label) => (
                  <View
                    className="rounded-full border px-3 py-2"
                    key={label}
                    style={{
                      backgroundColor: `${step.accent}10`,
                      borderColor: `${step.accent}35`,
                    }}
                  >
                    <Text
                      className="font-headline text-xs"
                      style={{ color: step.accent }}
                      translate={false}
                    >
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mt-4 gap-3">
              {step.bullets.map((bullet) => (
                <View
                  className="flex-row items-start rounded-2xl border border-border bg-surface-raised p-4"
                  key={bullet.title}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${step.accent}16` }}
                  >
                    <Ionicons
                      color={step.accent}
                      name={bullet.icon}
                      size={20}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text
                      className="font-headline text-base text-foreground"
                      translate={false}
                    >
                      {bullet.title}
                    </Text>
                    <Text
                      className="mt-1 font-body text-sm leading-5 text-muted"
                      translate={false}
                    >
                      {bullet.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {isLastStep ? (
              <Text
                className="mt-5 text-center font-body text-xs leading-5 text-muted"
                translate={false}
              >
                {copy.replayHint}
              </Text>
            ) : null}
          </ScrollView>

          <View className="flex-row gap-3 border-t border-border bg-surface px-5 pb-5 pt-4">
            {safeStep > 0 ? (
              <Pressable
                accessibilityLabel={copy.back}
                accessibilityRole="button"
                className="min-h-14 min-w-24 flex-row items-center justify-center rounded-2xl border border-border bg-surface-raised px-4 active:opacity-70"
                onPress={() => setCurrentStep(safeStep - 1)}
                testID="tutorial-back-button"
              >
                <Ionicons
                  color={COLORS.foreground}
                  name="arrow-back"
                  size={18}
                />
                <Text
                  className="ml-2 font-headline text-sm text-foreground"
                  translate={false}
                >
                  {copy.back}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel={isLastStep ? copy.finish : copy.next}
              accessibilityRole="button"
              className="min-h-14 flex-1 flex-row items-center justify-center rounded-2xl px-5 active:opacity-80"
              onPress={() =>
                isLastStep
                  ? completeTutorial()
                  : setCurrentStep(safeStep + 1)
              }
              style={{ backgroundColor: step.accent }}
              testID={
                isLastStep
                  ? 'tutorial-finish-button'
                  : 'tutorial-next-button'
              }
            >
              <Text
                className="font-headline text-base text-white"
                translate={false}
              >
                {isLastStep ? copy.finish : copy.next}
              </Text>
              <Ionicons
                color="#FFFFFF"
                name={isLastStep ? 'checkmark' : 'arrow-forward'}
                size={19}
                style={{ marginLeft: 8 }}
              />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

