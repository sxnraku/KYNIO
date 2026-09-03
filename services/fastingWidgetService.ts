import { NativeModules, Platform } from 'react-native';

export function syncWidgetFastingState(
  isActive: boolean,
  startedAt: number | null,
  targetHours: number,
  phaseName?: string | null,
  waterCount = 0,
): void {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const module = NativeModules.FastingWidgetModule;
    if (module?.updateWidgetData) {
      module.updateWidgetData(
        Boolean(isActive),
        Number(startedAt ?? 0),
        Number(targetHours ?? 16),
        // Nunca passar null/undefined ao bridge Kotlin — causa NullPointerException mesmo com String?
        phaseName != null && phaseName !== '' ? phaseName : 'Cetose',
        Number(waterCount ?? 0),
      );
    }
  } catch {
    // Non-blocking widget sync failure
  }
}

export function syncOngoingNotification(
  isActive: boolean,
  startedAt: number | null,
  targetHours: number,
  phaseTitle?: string | null,
  phaseTip?: string | null,
): void {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const module = NativeModules.FastingWidgetModule;
    if (module?.updateOngoingNotification) {
      module.updateOngoingNotification(
        Boolean(isActive),
        Number(startedAt ?? 0),
        Number(targetHours ?? 16),
        // Nunca passar null/undefined — NullPointerException no bridge Kotlin
        phaseTitle != null && phaseTitle !== '' ? phaseTitle : 'Digestão & Absorção',
        phaseTip   != null && phaseTip   !== '' ? phaseTip   : 'Jejum em curso',
      );
    }
  } catch {
    // Non-blocking notification sync failure
  }
}

export function cancelNativeOngoingNotification(): void {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const module = NativeModules.FastingWidgetModule;
    if (module?.cancelOngoingNotification) {
      module.cancelOngoingNotification();
    }
  } catch {
    // Non-blocking
  }
}

export async function openNativeHealthConnectSettings(): Promise<string> {
  if (Platform.OS !== 'android') {
    return 'not_supported';
  }

  try {
    const module = NativeModules.FastingWidgetModule;
    if (module?.openHealthConnectSettings) {
      return await module.openHealthConnectSettings();
    }
  } catch {
    // Fallback handled in healthConnectService
  }
  return 'fallback';
}

export async function getNativeHealthConnectStatus(): Promise<string> {
  if (Platform.OS !== 'android') {
    return 'not_supported';
  }

  try {
    const module = NativeModules.FastingWidgetModule;
    if (module?.getHealthConnectStatus) {
      return await module.getHealthConnectStatus();
    }
  } catch {
    // Fallback
  }
  return 'available';
}
