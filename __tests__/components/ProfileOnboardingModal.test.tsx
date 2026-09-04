import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import {
  calculateSuggestedProtocol,
  ProfileOnboardingModal,
} from "@/components/ui/profile-onboarding-modal";
import {
  completeProfileOnboarding,
  getUserProfile,
} from "@/services/dbService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import { useGuidedTutorialStore } from "@/store/guided-tutorial-store";
import { useLegalConsentStore } from "@/store/legal-consent-store";
import { useFastingScheduleStore } from "@/store/use-fasting-schedule-store";
import { useFastingStore } from "@/store/useFastingStore";

jest.mock("@/services/dbService", () => ({
  completeProfileOnboarding: jest.fn(),
  getUserProfile: jest.fn(),
}));

jest.mock("@/hooks/use-cloud-account", () => ({
  useCloudAccount: () => ({
    account: null,
    error: null,
    isLoading: false,
    signIn: jest.fn(),
  }),
}));

jest.setTimeout(60000);

describe("calculateSuggestedProtocol", () => {
  it("sugere 16h para iniciante com foco em queima de gordura", () => {
    expect(calculateSuggestedProtocol("fat_loss", "beginner")).toBe(16);
  });

  it("sugere 14h para iniciante com foco em disciplina", () => {
    expect(calculateSuggestedProtocol("discipline", "beginner")).toBe(14);
  });

  it("sugere 18h para intermédio com foco em autofagia", () => {
    expect(calculateSuggestedProtocol("autophagy", "intermediate")).toBe(18);
  });

  it("sugere 20h para praticante avançado", () => {
    expect(calculateSuggestedProtocol("fat_loss", "advanced")).toBe(20);
  });
});

describe("ProfileOnboardingModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppPreferencesStore.setState({ language: "pt", themeMode: "light" });
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
      profileOnboardingComplete: false,
    });
    useFastingScheduleStore.setState({ targetHours: 16 });
    useFastingStore.getState().setGoal("16:8");

    (getUserProfile as jest.Mock).mockResolvedValue({
      displayName: "Utilizador KYNIO",
      id: 1,
      onboardingCompletedAt: null,
      weightUnit: "kg",
    });
    (completeProfileOnboarding as jest.Mock).mockResolvedValue(undefined);
  });

  it("guia o utilizador pelo questionário (Passo 1) e conclui o perfil (Passo 2)", async () => {
    await render(<ProfileOnboardingModal />);

    // Aguarda carregar dados iniciais e exibir Passo 1
    await waitFor(() => {
      expect(screen.getByTestId("onboarding-step-1")).toBeTruthy();
    });

    expect(screen.getByText("Personaliza a tua rotina")).toBeTruthy();
    expect(screen.getByText("Passo 1 de 2")).toBeTruthy();
    expect(screen.getByText("Queima de Gordura & Leveza")).toBeTruthy();

    // Seleciona foco em autofagia e nível intermédio
    await act(async () => {
      fireEvent.press(screen.getByTestId("focus-option-autophagy"));
      fireEvent.press(screen.getByTestId("experience-option-intermediate"));
    });

    // A sugestão dinâmica deve indicar 18:6
    expect(screen.getByText("· Protocolo 18:6")).toBeTruthy();

    // Avança para o Passo 2
    await act(async () => {
      fireEvent.press(screen.getByTestId("onboarding-step1-continue"));
    });

    // Passo 2 visível
    await waitFor(() => {
      expect(screen.getByTestId("onboarding-step-2")).toBeTruthy();
    });
    expect(screen.getByText("Passo 2 de 2")).toBeTruthy();
    expect(screen.getByText("Dá identidade à tua jornada")).toBeTruthy();

    // Testa o botão Voltar
    await act(async () => {
      fireEvent.press(screen.getByTestId("onboarding-back-to-step1"));
    });
    expect(screen.getByTestId("onboarding-step-1")).toBeTruthy();

    // Avança novamente para o Passo 2
    await act(async () => {
      fireEvent.press(screen.getByTestId("onboarding-step1-continue"));
    });
    expect(screen.getByTestId("onboarding-step-2")).toBeTruthy();

    // Preenche o nome
    await act(async () => {
      fireEvent.changeText(screen.getByTestId("profile-name-input"), "Renato");
    });

    // Conclui o onboarding
    await act(async () => {
      fireEvent.press(screen.getByTestId("profile-onboarding-continue"));
    });

    await waitFor(() => {
      expect(completeProfileOnboarding).toHaveBeenCalledWith({
        displayName: "Renato",
        initialWeight: undefined,
        weightUnit: "kg",
      });
      expect(useGuidedTutorialStore.getState().profileOnboardingComplete).toBe(true);
      expect(useFastingScheduleStore.getState().targetHours).toBe(18);
    });
  });
});
