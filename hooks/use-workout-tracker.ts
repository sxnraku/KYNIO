import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import type { WorkoutRecord } from '@/db/schema';
import {
  getUserProfile,
  getWorkoutRecords,
  saveLoggedWorkoutRecord,
} from '@/services/dbService';
import { useUserProgressStore } from '@/store/user-progress-store';
import type { WorkoutEffort } from '@/types/workout';

const MAX_DURATION_MINUTES = 24 * 60;

export interface WorkoutSummary {
  totalMinutes: number;
  weekCount: number;
  weekMinutes: number;
  weekXp: number;
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
    const weekStart = startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000;
    const weekRecords = records.filter((record) => record.timestamp >= weekStart);

    return {
      totalMinutes: records.reduce((total, record) => total + record.durationMinutes, 0),
      weekCount: weekRecords.length,
      weekMinutes: weekRecords.reduce((total, record) => total + record.durationMinutes, 0),
      weekXp: weekRecords.reduce((total, record) => total + record.xpEarned, 0),
    };
  }, [records]);

  const saveWorkout = useCallback(async () => {
    const parsedDuration = Number(duration.replace(',', '.'));

    if (!Number.isFinite(parsedDuration) || parsedDuration < 1) {
      setError('Indica uma duração válida de pelo menos 1 minuto.');
      return;
    }

    if (parsedDuration > MAX_DURATION_MINUTES) {
      setError('A duração não pode ultrapassar 24 horas.');
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
      setSuccess('Atividade guardada no dispositivo. +50 XP');
    } catch (saveError: unknown) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível guardar esta atividade.',
      );
    } finally {
      setIsSaving(false);
    }
  }, [duration, effort, notes, selectedType, syncProfile]);

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
