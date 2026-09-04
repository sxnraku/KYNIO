import * as LocalAuthentication from 'expo-local-authentication';
import {
  authenticateBiometric,
  checkBiometricsAvailability,
} from '@/services/biometricsService';

jest.mock('expo-local-authentication', () => ({
  authenticateAsync: jest.fn(),
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
}));

describe('biometricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deteta disponibilidade quando o dispositivo tem hardware e biometria registada', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

    const status = await checkBiometricsAvailability();
    expect(status.hasHardware).toBe(true);
    expect(status.isEnrolled).toBe(true);
    expect(status.isSupported).toBe(true);
  });

  it('indica não suportado se não tiver biometria registada', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

    const status = await checkBiometricsAvailability();
    expect(status.hasHardware).toBe(true);
    expect(status.isEnrolled).toBe(false);
    expect(status.isSupported).toBe(false);
  });

  it('autentica com sucesso quando a chamada do sistema retorna success: true', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      success: true,
    });

    const result = await authenticateBiometric('Desbloquear KYNIO');
    expect(result.success).toBe(true);
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
      promptMessage: 'Desbloquear KYNIO',
    });
  });

  it('retorna erro quando o utilizador cancela ou a biometria falha', async () => {
    (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
      error: 'user_cancel',
      success: false,
    });

    const result = await authenticateBiometric();
    expect(result.success).toBe(false);
    expect(result.error).toBe('user_cancel');
  });
});
