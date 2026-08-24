import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { calculateFastingTimer } from '@/services/fasting';
import { useFastingStore } from '@/store/useFastingStore';

interface FastingTimerState {
  elapsedHours: number;
  elapsedMs: number;
  progress: number;
}

export function useFastingTimer(): FastingTimerState {
  const isActive = useFastingStore((state) => state.isActive);
  const startedAt = useFastingStore((state) => state.startedAt);
  const targetDurationMs = useFastingStore((state) => state.targetDurationMs);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());

    if (!isActive) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    const appStateSubscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          setNow(Date.now());
        }
      },
    );

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [isActive, startedAt]);

  return calculateFastingTimer({ isActive, now, startedAt, targetDurationMs });
}
