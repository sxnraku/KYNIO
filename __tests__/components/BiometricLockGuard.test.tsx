import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { BiometricLockGuard } from '@/components/biometric-lock-guard';
import * as biometricsService from '@/services/biometricsService';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useSubscriptionStore } from '@/store/use-subscription-store';

jest.mock('@/services/biometricsService');

describe('BiometricLockGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppPreferencesStore.setState({
      biometricLockEnabled: false,
      language: 'pt',
    });
    useSubscriptionStore.setState({
      isPro: false,
    });
  });

  it('não renderiza o modal quando a proteção biométrica estiver desativada', async () => {
    await render(<BiometricLockGuard />);
    expect(screen.getByTestId('biometric-guard-idle')).toBeTruthy();
    expect(screen.queryByTestId('biometric-unlock-button')).toBeNull();
  });

  it('não renderiza o modal se o utilizador não for Pro mesmo com a flag ativa', async () => {
    useAppPreferencesStore.setState({ biometricLockEnabled: true });
    useSubscriptionStore.setState({ isPro: false });

    await render(<BiometricLockGuard />);
    expect(screen.getByTestId('biometric-guard-idle')).toBeTruthy();
    expect(screen.queryByTestId('biometric-unlock-button')).toBeNull();
  });

  it('renderiza o ecrã de bloqueio quando for Pro e a biometria estiver ativa', async () => {
    (biometricsService.authenticateBiometric as jest.Mock).mockResolvedValue({
      error: 'Reconhecimento pendente',
      success: false,
    });

    useAppPreferencesStore.setState({ biometricLockEnabled: true });
    useSubscriptionStore.setState({ isPro: true });

    await render(<BiometricLockGuard />);

    await waitFor(() => {
      expect(screen.getByTestId('biometric-unlock-button')).toBeTruthy();
      expect(screen.getByText('Cofre Biométrico')).toBeTruthy();
      expect(screen.getByText('Aplicação Bloqueada')).toBeTruthy();
    });
  });

  it('remove o ecrã de bloqueio ao autenticar com sucesso', async () => {
    (biometricsService.authenticateBiometric as jest.Mock).mockResolvedValue({
      success: true,
    });

    useAppPreferencesStore.setState({ biometricLockEnabled: true });
    useSubscriptionStore.setState({ isPro: true });

    await render(<BiometricLockGuard />);

    await waitFor(() => {
      expect(screen.getByTestId('biometric-guard-idle')).toBeTruthy();
      expect(screen.queryByTestId('biometric-unlock-button')).toBeNull();
    });
  });
});
