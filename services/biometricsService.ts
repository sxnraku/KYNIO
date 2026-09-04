import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricsAvailability {
  hasHardware: boolean;
  isEnrolled: boolean;
  isSupported: boolean;
}

export interface BiometricAuthResult {
  error?: string;
  success: boolean;
}

/**
 * Verifica se o dispositivo possui hardware biométrico (impressão digital ou FaceID)
 * e se há pelo menos uma biometria registada pelo utilizador.
 */
export async function checkBiometricsAvailability(): Promise<BiometricsAvailability> {
  if (Platform.OS === 'web') {
    return { hasHardware: false, isEnrolled: false, isSupported: false };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    return {
      hasHardware,
      isEnrolled,
      isSupported: hasHardware && isEnrolled,
    };
  } catch {
    return { hasHardware: false, isEnrolled: false, isSupported: false };
  }
}

/**
 * Dispara o prompt nativo de autenticação biométrica (TouchID, FaceID ou impressão digital Android).
 */
export async function authenticateBiometric(
  promptMessage = 'Autenticação necessária para aceder ao KYNIO',
  cancelLabel = 'Cancelar',
): Promise<BiometricAuthResult> {
  if (Platform.OS === 'web') {
    return { success: true };
  }

  try {
    const availability = await checkBiometricsAvailability();
    if (!availability.isSupported) {
      return { error: 'Biometria não configurada no dispositivo.', success: false };
    }

    const result = await LocalAuthentication.authenticateAsync({
      cancelLabel,
      disableDeviceFallback: false,
      promptMessage,
    });

    if (result.success) {
      return { success: true };
    }

    return {
      error: result.error || 'Autenticação cancelada ou não reconhecida.',
      success: false,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Falha na autenticação biométrica.';
    return { error: message, success: false };
  }
}
