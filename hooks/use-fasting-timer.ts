import { useEffect, useState } from 'react';

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

    return () => clearInterval(intervalId);
  }, [isActive, startedAt]);

  return calculateFastingTimer({ isActive, now, startedAt, targetDurationMs });
}
