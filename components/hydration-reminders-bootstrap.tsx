import { useEffect } from 'react';

import { scheduleHydrationReminders } from '@/services/fastingNotificationService';
import { useAppPreferencesStore } from '@/store/app-preferences-store';

// Reagenda os lembretes diários de hidratação no arranque da app quando o
// toggle está ativo (os triggers diários repetem-se, mas o reagendamento é
// idempotente e cobre reinstalações ou restauros do SO). O valor vem do store
// persistido, pelo que o efeito dispara também após a hidratação assíncrona.
export function HydrationRemindersBootstrap() {
  const hydrationRemindersEnabled = useAppPreferencesStore(
    (state) => state.hydrationRemindersEnabled,
  );

  useEffect(() => {
    if (hydrationRemindersEnabled) {
      void scheduleHydrationReminders();
    }
  }, [hydrationRemindersEnabled]);

  return null;
}
