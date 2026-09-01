import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const HOURS_TO_MS = 60 * 60 * 1000;

// Identificadores estáveis das notificações agendadas: permitem cancelar só
// as de jejum (ou só as de hidratação) sem nunca usar
// cancelAllScheduledNotificationsAsync, que apagaria as outras.
const FASTING_PHASE_NOTIFICATION_IDS = [12, 14, 16, 24].map(
  (hours) => `fasting-phase-${hours}`,
);
const FASTING_GOAL_NOTIFICATION_ID = 'fasting-goal';
const FASTING_ROUTINE_REMINDER_NOTIFICATION_ID = 'fasting-routine-reminder';

const FASTING_NOTIFICATION_IDS = [
  ...FASTING_PHASE_NOTIFICATION_IDS,
  FASTING_GOAL_NOTIFICATION_ID,
  FASTING_ROUTINE_REMINDER_NOTIFICATION_ID,
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
    // Cancela apenas as notificações de jejum (por identificador), para não
    // apagar os lembretes de hidratação sempre que um jejum inicia/termina.
    await Promise.all(
      FASTING_NOTIFICATION_IDS.map((identifier) =>
        Notifications.cancelScheduledNotificationAsync(identifier),
      ),
    );
  } catch {
    // Silently ignore cancellation errors
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

    const now = Date.now();

    // Define biological milestone triggers
    const milestones = [
      {
        hours: 12,
        title: 'Queima de Gordura Ativa 🔥',
        body: '12h de Jejum atingidas! O glicogénio hepático esgotou e o teu corpo está a queimar ácidos gordos.',
      },
      {
        hours: 14,
        title: 'Cetose Acelerada ⚡',
        body: '14h de Jejum! Produção de corpos cetónicos em alta para energia limpa e clareza mental.',
      },
      {
        hours: 16,
        title: 'Autofagia Celular 🧬',
        body: '16h de Jejum! Os teus processos de autofagia e renovação celular profunda estão ativos.',
      },
      {
        hours: 24,
        title: 'Pico de Renovação Celular ✨',
        body: '24h de Jejum! Pico máximo de autofagia e reciclagem mitocondrial.',
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
