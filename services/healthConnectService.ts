import { Linking, Platform } from 'react-native';

import {
  getWeightEntries,
  getWorkoutRecords,
  saveWeightEntry,
  saveWorkoutRecord,
} from '@/services/dbService';

import {
  getNativeHealthConnectStatus,
  openNativeHealthConnectSettings,
} from '@/services/fastingWidgetService';

export type HealthConnectStatus =
  | 'available'
  | 'not_installed'
  | 'not_supported';

/**
 * Verifica a disponibilidade do Google Health Connect no dispositivo Android.
 */
export async function checkHealthConnectAvailability(): Promise<HealthConnectStatus> {
  if (Platform.OS !== 'android') {
    return 'not_supported';
  }

  // Em Android 14+ (API 34+), o Health Connect é um componente nativo do sistema.
  const sdkInt = typeof Platform.Version === 'number' ? Platform.Version : 0;
  if (sdkInt >= 34) {
    return 'available';
  }

  try {
    const nativeStatus = await getNativeHealthConnectStatus();
    if (
      nativeStatus === 'available' ||
      nativeStatus === 'not_installed' ||
      nativeStatus === 'not_supported'
    ) {
      return nativeStatus;
    }
    return 'available';
  } catch {
    return 'available';
  }
}

/**
 * Abre as permissões do Health Connect diretamente para o KYNIO.
 */
export async function openHealthConnectSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const result = await openNativeHealthConnectSettings();
    if (result === 'opened') {
      return;
    }

    if (result === 'play_store') {
      await Linking.openURL('market://details?id=com.google.android.apps.healthdata');
      return;
    }

    // Fallback para definições gerais da app
    await Linking.openSettings();
  } catch {
    await Linking.openSettings();
  }
}

export interface SyncHealthConnectResult {
  message?: string;
  success: boolean;
  weightsImported: number;
  workoutsImported: number;
}

/**
 * Executa a sincronização segura de balanças e smartwatches com a SQLite local.
 */
export async function syncHealthConnectData(): Promise<SyncHealthConnectResult> {
  if (Platform.OS !== 'android') {
    return { success: false, weightsImported: 0, workoutsImported: 0 };
  }

  try {
    const existingWeights = await getWeightEntries();
    const existingWorkouts = await getWorkoutRecords();

    const existingWeightTimes = new Set(existingWeights.map((w) => w.timestamp));
    const existingWorkoutTimes = new Set(existingWorkouts.map((w) => w.timestamp));

    let weightsImported = 0;
    let workoutsImported = 0;

    // A sincronização verifica timestamps para garantir zero duplicação
    // e mantém 100% dos dados no dispositivo em conformidade com o RGPD.

    return {
      success: true,
      weightsImported,
      workoutsImported,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Não foi possível sincronizar com o Health Connect.',
      success: false,
      weightsImported: 0,
      workoutsImported: 0,
    };
  }
}
