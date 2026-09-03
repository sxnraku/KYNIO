import * as Notifications from 'expo-notifications';

import {
  cancelFastingNotifications,
  cancelHydrationReminders,
  requestNotificationPermission,
  scheduleFastingPhaseNotifications,
  scheduleHydrationReminders,
} from '@/services/fastingNotificationService';

import { useSubscriptionStore } from '@/store/use-subscription-store';

describe('fastingNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubscriptionStore.setState({ isPro: true });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  });

  it('solicita permissão de notificação com sucesso', async () => {
    const granted = await requestNotificationPermission();
    expect(granted).toBe(true);

    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    const denied = await requestNotificationPermission();
    expect(denied).toBe(false);
  });

  it('agenda marcos biológicos quando um jejum é iniciado', async () => {
    const now = Date.now();
    await scheduleFastingPhaseNotifications(now, 16);

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'fasting-goal' }),
    );
  });

  it('agenda apenas marcos biológicos em jejum livre (targetHours = 0)', async () => {
    const now = Date.now();
    await scheduleFastingPhaseNotifications(now, 0);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'fasting-phase-16' }),
    );
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'fasting-goal' }),
    );
  });

  it('cancela apenas as notificações de jejum ao terminar', async () => {
    await cancelFastingNotifications();

    expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    const cancelledIds = (
      Notifications.cancelScheduledNotificationAsync as jest.Mock
    ).mock.calls.map(([identifier]) => identifier);
    expect(cancelledIds).toEqual(
      expect.arrayContaining([
        'fasting-phase-12',
        'fasting-phase-14',
        'fasting-phase-16',
        'fasting-phase-24',
        'fasting-goal',
        'fasting-routine-reminder',
        'fasting-ongoing-status',
      ]),
    );
    expect(cancelledIds).toHaveLength(7);
    expect(cancelledIds.some((id) => String(id).startsWith('hydration-'))).toBe(false);
  });

  it('agenda lembretes diários de hidratação às 10:00, 13:00, 16:00 e 19:00', async () => {
    await scheduleHydrationReminders();

    const scheduledHours = (
      Notifications.scheduleNotificationAsync as jest.Mock
    ).mock.calls.map(([request]) => ({
      hour: request.trigger.hour,
      identifier: request.identifier,
      minute: request.trigger.minute,
      type: request.trigger.type,
    }));

    expect(scheduledHours).toEqual([
      { hour: 10, identifier: 'hydration-reminder-10', minute: 0, type: 'daily' },
      { hour: 13, identifier: 'hydration-reminder-13', minute: 0, type: 'daily' },
      { hour: 16, identifier: 'hydration-reminder-16', minute: 0, type: 'daily' },
      { hour: 19, identifier: 'hydration-reminder-19', minute: 0, type: 'daily' },
    ]);
  });

  it('não agenda lembretes de hidratação sem permissão', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    await scheduleHydrationReminders();

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancela apenas os lembretes de hidratação', async () => {
    await cancelHydrationReminders();

    expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    const cancelledIds = (
      Notifications.cancelScheduledNotificationAsync as jest.Mock
    ).mock.calls.map(([identifier]) => identifier);
    expect(cancelledIds).toEqual([
      'hydration-reminder-10',
      'hydration-reminder-13',
      'hydration-reminder-16',
      'hydration-reminder-19',
    ]);
  });
});
