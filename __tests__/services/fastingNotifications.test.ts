import * as Notifications from 'expo-notifications';

import {
  cancelFastingNotifications,
  requestNotificationPermission,
  scheduleFastingPhaseNotifications,
} from '@/services/fastingNotificationService';

describe('fastingNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('agenda apenas marcos biológicos em jejum livre (targetHours = 0)', async () => {
    const now = Date.now();
    await scheduleFastingPhaseNotifications(now, 0);

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('cancela todas as notificações de jejum ao terminar', async () => {
    await cancelFastingNotifications();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
  });
});

