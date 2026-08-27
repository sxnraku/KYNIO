import { useGuidedTutorialStore } from '@/store/guided-tutorial-store';

describe('useGuidedTutorialStore', () => {
  beforeEach(() => {
    useGuidedTutorialStore.setState({
      currentStep: 0,
      hasCompletedTutorial: false,
      hasHydrated: true,
      profileOnboardingComplete: false,
    });
  });

  it('guarda a progressão e conclui o tutorial apenas no passo final', () => {
    useGuidedTutorialStore.getState().setProfileOnboardingComplete(true);
    useGuidedTutorialStore.getState().setCurrentStep(3);
    useGuidedTutorialStore.getState().completeTutorial();

    expect(useGuidedTutorialStore.getState()).toMatchObject({
      currentStep: 0,
      hasCompletedTutorial: true,
      profileOnboardingComplete: true,
    });
  });

  it('permite rever o guia sem repetir o onboarding do perfil', () => {
    useGuidedTutorialStore.setState({
      currentStep: 2,
      hasCompletedTutorial: true,
      profileOnboardingComplete: true,
    });

    useGuidedTutorialStore.getState().restartTutorial();

    expect(useGuidedTutorialStore.getState()).toMatchObject({
      currentStep: 0,
      hasCompletedTutorial: false,
      profileOnboardingComplete: true,
    });
  });

  it('repõe também a preparação do perfil quando todos os dados são apagados', () => {
    useGuidedTutorialStore.setState({
      currentStep: 3,
      hasCompletedTutorial: true,
      profileOnboardingComplete: true,
    });

    useGuidedTutorialStore.getState().resetTutorial();

    expect(useGuidedTutorialStore.getState()).toMatchObject({
      currentStep: 0,
      hasCompletedTutorial: false,
      profileOnboardingComplete: false,
    });
  });
});
