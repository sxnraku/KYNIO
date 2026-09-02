import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import type { WorkoutRecord } from '@/db/schema';
import {
  getUserProfile,
  getWorkoutRecords,
  saveLoggedWorkoutRecord,
} from '@/services/dbService';
import {
  MAX_DAILY_WORKOUT_MINUTES,
  MAX_WORKOUT_DURATION_MINUTES,
  WORKOUT_XP_ACTIVITIES_PER_DAY,
} from '@/services/gamificationService';
import { useUserProgressStore } from '@/store/user-progress-store';
import type { WorkoutEffort } from '@/types/workout';

const MAX_DURATION_MINUTES = MAX_WORKOUT_DURATION_MINUTES;

export interface WorkoutSummary {
  todayCount: number;
  todayMinutes: number;
  totalMinutes: number;
  weekCount: number;
  weekMinutes: number;
  weekXp: number;
  xpLogsRemainingToday: number;
}

export function useWorkoutTracker() {
  const syncProfile = useUserProgressStore((state) => state.syncProfile);
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [selectedType, setSelectedType] = useState('walk');
  const [duration, setDuration] = useState('30');
  const [effort, setEffort] = useState<WorkoutEffort>('moderate');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setIsLoading(true);

      void getWorkoutRecords()
        .then((storedRecords) => {
          if (isMounted) {
            setRecords(storedRecords);
            setError(null);
          }
        })
        .catch((loadError: unknown) => {
          if (isMounted) {
            setError(
              loadError instanceof Error
                ? loadError.message
                : 'Não foi possível carregar as atividades locais.',
            );
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsLoading(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const summary = useMemo<WorkoutSummary>(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayStart = startOfToday.getTime();
    const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;
    const todayRecords = records.filter(
      (record) => record.timestamp >= todayStart,
    );
    const weekRecords = records.filter((record) => record.timestamp >= weekStart);

    return {
      todayCount: todayRecords.length,
      todayMinutes: todayRecords.reduce(
        (total, record) => total + record.durationMinutes,
        0,
      ),
      totalMinutes: records.reduce((total, record) => total + record.durationMinutes, 0),
      weekCount: weekRecords.length,
      weekMinutes: weekRecords.reduce((total, record) => total + record.durationMinutes, 0),
      weekXp: weekRecords.reduce((total, record) => total + record.xpEarned, 0),
      xpLogsRemainingToday: Math.max(
        0,
        WORKOUT_XP_ACTIVITIES_PER_DAY - todayRecords.length,
      ),
    };
  }, [records]);

  const saveWorkout = useCallback(async () => {
    const parsedDuration = Number(duration.replace(',', '.'));

    if (!Number.isFinite(parsedDuration) || parsedDuration < 1) {
      setError('Indica uma duração válida de pelo menos 1 minuto.');
      return;
    }

    if (parsedDuration > MAX_DURATION_MINUTES) {
      setError('Uma atividade não pode ultrapassar 4 horas.');
      return;
    }

    if (summary.todayMinutes + parsedDuration > MAX_DAILY_WORKOUT_MINUTES) {
      setError(
        `Limite diário de 6 horas de atividade. Hoje já registaste ${Math.floor(summary.todayMinutes / 60)}h ${String(summary.todayMinutes % 60).padStart(2, '0')}m.`,
      );
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const savedRecord = await saveLoggedWorkoutRecord({
        durationMinutes: parsedDuration,
        effort,
        notes: notes.trim() || null,
        timestamp: Date.now(),
        type: selectedType,
      });
      const profile = await getUserProfile();

      setRecords((current) => [savedRecord, ...current]);
      syncProfile(profile);
      setNotes('');
      setSuccess(
        savedRecord.xpEarned > 0
          ? `Atividade guardada no dispositivo. +${savedRecord.xpEarned} XP`
          : 'Atividade guardada. Limite diário de XP de atividades atingido (3 por dia).',
      );
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível guardar esta atividade.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [duration, effort, notes, selectedType, summary, syncProfile]);

  return {
    duration,
    effort,
    error,
    isLoading,
    isSaving,
    notes,
    records,
    saveWorkout,
    selectedType,
    setDuration,
    setEffort,
    setNotes,
    setSelectedType,
    success,
    summary,
  };
}
