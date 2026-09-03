import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  ESTIMATED_METABOLIC_PHASES,
  getEstimatedPhaseIndex,
} from '@/services/fasting';
import {
  cancelNativeOngoingNotification,
  syncOngoingNotification,
} from '@/services/fastingWidgetService';
import { useSubscriptionStore } from '@/store/use-subscription-store';

const HOURS_TO_MS = 60 * 60 * 1000;

// Identificadores estáveis das notificações agendadas: permitem cancelar só
// as de jejum (ou só as de hidratação) sem nunca usar
// cancelAllScheduledNotificationsAsync, que apagaria as outras.
const FASTING_PHASE_NOTIFICATION_IDS = [12, 14, 16, 24].map(
  (hours) => `fasting-phase-${hours}`,
);
const FASTING_GOAL_NOTIFICATION_ID = 'fasting-goal';
const FASTING_ROUTINE_REMINDER_NOTIFICATION_ID = 'fasting-routine-reminder';
export const FASTING_ONGOING_NOTIFICATION_ID = 'fasting-ongoing-status';
export const FASTING_ONGOING_CHANNEL_ID = 'fasting-ongoing-channel';

const FASTING_NOTIFICATION_IDS = [
  ...FASTING_PHASE_NOTIFICATION_IDS,
  FASTING_GOAL_NOTIFICATION_ID,
  FASTING_ROUTINE_REMINDER_NOTIFICATION_ID,
  FASTING_ONGOING_NOTIFICATION_ID,
];

// Lembretes diários de hidratação: 10:00, 13:00, 16:00 e 19:00.
const HYDRATION_REMINDER_HOURS = [10, 13, 16, 19];
const HYDRATION_NOTIFICATION_IDS = HYDRATION_REMINDER_HOURS.map(
  (hour) => `hydration-reminder-${hour}`,
);

// Configure default notification handler for foreground display
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}


export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

export async function cancelFastingNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    cancelNativeOngoingNotification();

    // Cancela as notificações de jejum agendadas e dispensa a notificação persistente
    await Promise.all([
      ...FASTING_NOTIFICATION_IDS.map((identifier) =>
        Notifications.cancelScheduledNotificationAsync(identifier),
      ),
      Notifications.dismissNotificationAsync(FASTING_ONGOING_NOTIFICATION_ID),
    ]);
  } catch {
    // Silently ignore cancellation errors
  }
}

export async function updateFastingOngoingNotification(
  startedAt: number,
  targetHours: number,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return;
    }

    const now = Date.now();
    const elapsedMs = Math.max(0, now - startedAt);
    const elapsedHours = Math.floor(elapsedMs / (60 * 60 * 1000));
    const elapsedMins = Math.floor(
      (elapsedMs % (60 * 60 * 1000)) / (60 * 1000),
    );

    const currentPhaseIndex = getEstimatedPhaseIndex(
      elapsedHours + elapsedMins / 60,
    );
    const phase =
      ESTIMATED_METABOLIC_PHASES[currentPhaseIndex] ??
      ESTIMATED_METABOLIC_PHASES[0];

    const phaseTitle = phase?.title ?? 'Jejum Ativo';
    const phaseTip   = phase?.tip ?? phase?.description ?? 'Jejum em curso';

    // Android: exclusivamente via FastingForegroundService nativo
    // (notificação persistente com cronómetro vivo — não usar Expo aqui)
    if (Platform.OS === 'android') {
      syncOngoingNotification(true, startedAt, targetHours, phaseTitle, phaseTip);
      return;
    }

    // iOS: Expo Notifications (não há Foreground Service no iOS)
    const durationText =
      elapsedHours > 0
        ? `${elapsedHours}h ${elapsedMins}m`
        : `${elapsedMins}m`;
    const title = `A jejuar há ${durationText} · ${phaseTitle}`;
    const body =
      targetHours > 0
        ? `Meta: ${targetHours}h · ${phaseTip}`
        : phaseTip;

    await Notifications.scheduleNotificationAsync({
      content: {
        autoDismiss: false,
        body,
        color: '#D9922E',
        data: {
          phaseIndex: currentPhaseIndex,
          phaseName: phaseTitle,
          startedAt,
          targetHours,
          type: 'fasting_ongoing',
        },
        priority: 'low',
        sticky: true,
        title,
      },
      identifier: FASTING_ONGOING_NOTIFICATION_ID,
      trigger: null,
    });
  } catch {
    // Silently ignore ongoing notification error
  }
}

export async function scheduleFastingPhaseNotifications(
  startedAt: number,
  targetHours: number,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // 1. Clear old schedules
    await cancelFastingNotifications();

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return;
    }

    // Apresenta imediatamente a notificação persistente na barra de estado
    await updateFastingOngoingNotification(startedAt, targetHours);

    const now = Date.now();

    const isPro = useSubscriptionStore.getState().isPro;

    // Define biological milestone triggers (exclusivo Sol Pro)
    if (isPro) {
      const milestones = [
        {
          hours: 12,
          title: 'Transição Metabólica (12h) 🔥',
          body: '12h de jejum: reservas hepáticas em transição para queima de gordura. Lembra-te de beber água.',
        },
        {
          hours: 14,
          title: 'Cetose Ativa (14h) ⚡',
          body: '14h de jejum: produção de corpos cetónicos em ritmo acelerado para energia celular.',
        },
        {
          hours: 16,
          title: 'Autofagia Celular (16h) 🧬',
          body: '16h de jejum: processos naturais de renovação e reciclagem celular em curso.',
        },
        {
          hours: 24,
          title: 'Renovação Profunda (24h) ✨',
          body: '24h de jejum concluídas: pico de reciclagem mitocondrial e foco consistente.',
        },
      ];

      // Schedule each milestone if its trigger time is in the future
      for (const milestone of milestones) {
        const triggerTimeMs = startedAt + milestone.hours * HOURS_TO_MS;
        const delaySeconds = Math.floor((triggerTimeMs - now) / 1000);

        if (delaySeconds > 10) {
          await Notifications.scheduleNotificationAsync({
            identifier: `fasting-phase-${milestone.hours}`,
            content: {
              title: milestone.title,
              body: milestone.body,
              data: { type: 'fasting_phase', hours: milestone.hours },
              sound: true,
            },
            trigger: {
              seconds: delaySeconds,
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            },
          });
        }
      }
    }

    // Schedule target completion notification if targetHours is defined (> 0)
    if (targetHours > 0) {
      const targetTimeMs = startedAt + targetHours * HOURS_TO_MS;
      const targetDelaySeconds = Math.floor((targetTimeMs - now) / 1000);

      if (targetDelaySeconds > 10) {
        await Notifications.scheduleNotificationAsync({
          identifier: FASTING_GOAL_NOTIFICATION_ID,
          content: {
            title: 'Meta de Jejum Atingida! 🎉',
            body: `Parabéns! Completaste a tua meta de ${targetHours}h. Toca para registar o teu progresso e ganhar XP!`,
            data: { type: 'fasting_goal_completed', targetHours },
            sound: true,
          },
          trigger: {
            seconds: targetDelaySeconds,
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          },
        });
      }
    }
  } catch {
    // Non-blocking notification failure
  }
}

export async function scheduleRoutineReminderNotification(
  nextFastDate: Date,
  targetHours: number,
  remindBeforeMinutes: number,
): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return;
    }

    const now = Date.now();
    const reminderTimeMs = nextFastDate.getTime() - remindBeforeMinutes * 60 * 1000;
    const delaySeconds = Math.floor((reminderTimeMs - now) / 1000);

    if (delaySeconds > 10) {
      const isAdf = targetHours >= 36;
      const title = isAdf ? 'Hora do Jejum ADF' : 'Hora do teu Jejum';
      const body = remindBeforeMinutes > 0
        ? `O teu jejum de ${targetHours}h começa em ${remindBeforeMinutes} minutos. Prepara a tua última refeição!`
        : `Está na hora de iniciar o teu jejum de ${targetHours}h. Toca para começar!`;

      await Notifications.scheduleNotificationAsync({
        identifier: FASTING_ROUTINE_REMINDER_NOTIFICATION_ID,
        content: {
          title,
          body,
          data: { type: 'fasting_routine_reminder', targetHours },
          sound: true,
        },
        trigger: {
          seconds: delaySeconds,
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });
    }
  } catch {
    // Silently ignore notification failure
  }
}


export async function scheduleHydrationReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return;
    }

    // Reagendamento idempotente: cancela primeiro os lembretes antigos para
    // não duplicar quando chamado no arranque da app ou ao reativar o toggle.
    await cancelHydrationReminders();

    for (const hour of HYDRATION_REMINDER_HOURS) {
      const trigger: Notifications.DailyTriggerInput = {
        hour,
        minute: 0,
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
      };

      await Notifications.scheduleNotificationAsync({
        identifier: `hydration-reminder-${hour}`,
        content: {
          title: 'Hidratação',
          body: 'Pausa para um copo de água. O teu jejum agradece.',
          data: { type: 'hydration_reminder' },
          sound: true,
        },
        trigger,
      });
    }
  } catch {
    // Non-blocking notification failure
  }
}

export async function cancelHydrationReminders(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // Cancela apenas os lembretes de hidratação, sem tocar nos de jejum.
    await Promise.all(
      HYDRATION_NOTIFICATION_IDS.map((identifier) =>
        Notifications.cancelScheduledNotificationAsync(identifier),
      ),
    );
  } catch {
    // Silently ignore cancellation errors
  }
}
