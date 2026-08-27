import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const HOURS_TO_MS = 60 * 60 * 1000;

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
    await Notifications.cancelAllScheduledNotificationsAsync();
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
