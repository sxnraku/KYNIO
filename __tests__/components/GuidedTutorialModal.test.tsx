import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native';

import { GuidedTutorialModal } from '@/components/ui/guided-tutorial-modal';
import { useAppPreferencesStore } from '@/store/app-preferences-store';
import { useGuidedTutorialStore } from '@/store/guided-tutorial-store';
import { useLegalConsentStore } from '@/store/legal-consent-store';

jest.setTimeout(30000);

describe('GuidedTutorialModal', () => {

  beforeEach(() => {
    useAppPreferencesStore.setState({ language: 'pt', themeMode: 'light' });
    useLegalConsentStore.setState({
      errorMessage: null,
      hasAcceptedTerms: true,
      isAccepting: false,
      isHydrated: true,
      isLoading: false,
    });
    useGuidedTutorialStore.setState({
      currentStep: 0,
      hasCompletedTutorial: false,
      hasHydrated: true,
      profileOnboardingComplete: true,
    });
  });

  it('apresenta os quatro passos e fica concluído no final', async () => {
    await render(<GuidedTutorialModal />);

    expect(screen.getByText('Jejum que acompanha a vida real')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('tutorial-next-button'));
    expect(screen.getByText('Refeições com revisão humana')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('tutorial-next-button'));
    expect(screen.getByText('Progresso sem pressão')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('tutorial-next-button'));
    expect(screen.getByText('Os teus dados, as tuas escolhas')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('tutorial-finish-button'));

    expect(useGuidedTutorialStore.getState().hasCompletedTutorial).toBe(true);
    expect(
      screen.queryByText('Os teus dados, as tuas escolhas'),
    ).toBeNull();
  }, 90000);

  it('só aparece depois dos termos e do perfil inicial estarem concluídos', async () => {
    useGuidedTutorialStore.setState({ profileOnboardingComplete: false });

    await render(<GuidedTutorialModal />);
    expect(screen.queryByTestId('guided-tutorial-modal')).toBeNull();

    await act(async () => {
      useGuidedTutorialStore.setState({ profileOnboardingComplete: true });
    });
    expect(await screen.findByTestId('guided-tutorial-modal')).toBeTruthy();

    await act(async () => {
      useLegalConsentStore.setState({ hasAcceptedTerms: false });
    });
    expect(screen.queryByTestId('guided-tutorial-modal')).toBeNull();
  });
});
