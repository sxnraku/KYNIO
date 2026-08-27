import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import MealsScreen from '@/app/(tabs)/meals';
import type { MealRecord, UserProfileRecord } from '@/db/schema';
import { analyzeMeal } from '@/services/aiMealService';
import { getUserProfile, saveScannedMealRecord } from '@/services/dbService';
import { useSubscriptionStore } from '@/store/use-subscription-store';
import type { MealAnalysisResult } from '@/types/meal';


jest.mock('@/services/aiMealService', () => ({
  analyzeMeal: jest.fn(),
}));

jest.mock('@/services/dbService', () => ({
  getMealRecords: jest.fn().mockResolvedValue([]),
  getUserProfile: jest.fn(),
  saveScannedMealRecord: jest.fn(),
}));

jest.mock('@/services/localMealImageService', () => ({
  persistMealImage: jest.fn(),
}));

jest.mock('@/components/ui/meal-camera-modal', () => {
  const React = require('react') as typeof import('react');
  const { Text } = require('react-native') as typeof import('react-native');

  return {
    MealCameraModal: ({ visible }: { visible: boolean }) =>
      visible
        ? React.createElement(
            React.Fragment,
            null,
            React.createElement(Text, null, 'Fotografar refeição'),
            React.createElement(Text, null, 'Pré-visualização em direto'),
          )
        : null,
  };
});

jest.mock('expo-router', () => {
  const React = require('react') as typeof import('react');

  return {
    useFocusEffect: (callback: () => void | (() => void)) =>
      React.useEffect(callback, [callback]),
    useRouter: () => ({
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    }),
  };
});

const VALID_AI_PAYLOAD: MealAnalysisResult = {
  confidence: 'high',
  dish_name: 'Bowl de frango e arroz',
  estimated_calories: 550,
  macros: {
    carbs_g: 58,
    fat_g: 14,
    protein_g: 42,
  },
  tags: ['+Proteína', 'Refeição Completa'],
};

const SAVED_MEAL: MealRecord = {
  carbsGrams: 58,
  estimatedCalories: 550,
  fatGrams: 14,
  id: 1,
  imageUrl: null,
  proteinGrams: 42,
  tags: VALID_AI_PAYLOAD.tags,
  timestamp: 1_787_400_000_000,
  xpEarned: 30,
};

const UPDATED_PROFILE: UserProfileRecord = {
  avatarRemotePath: null,
  avatarUri: null,
  bio: '',
  cloudLinkedAt: null,
  cloudUserId: null,
  currentLevel: 1,
  displayName: 'Utilizador KYNIO',
  googleAvatarUrl: null,
  googleDisplayName: null,
  googleEmail: null,
  id: 1,
  onboardingCompletedAt: 1_787_400_000_000,
  profileUpdatedAt: 0,
  streakDays: 0,
  termsAcceptedAt: 1_787_400_000_000,
  totalXp: 30,
  weightUnit: 'kg',
};

const mockedAnalyzeMeal = jest.mocked(analyzeMeal);
const mockedGetUserProfile = jest.mocked(getUserProfile);
const mockedSaveScannedMealRecord = jest.mocked(saveScannedMealRecord);

async function renderAnalyzedMeal(): Promise<void> {
  await render(<MealsScreen />);

  await fireEvent.changeText(
    screen.getByLabelText('Descrição da refeição'),
    'frango grelhado com arroz',
  );
  await fireEvent.press(screen.getByText('Analisar refeição'));

  await waitFor(() => {
    expect(mockedAnalyzeMeal).toHaveBeenCalledWith({
      description: 'frango grelhado com arroz',
      image: undefined,
    });
  });
  await screen.findByText(VALID_AI_PAYLOAD.dish_name);
}

describe('MealScanCard', () => {

  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    useSubscriptionStore.setState({
      dailyAiScansCount: 0,
      dailyAiScansDate: new Date().toISOString().slice(0, 10),
      expiresAt: null,
      isPro: true,
      maxFreeDailyAiScans: 3,
      tier: 'annual',
      trialStartedAt: null,
    });
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(
        new Error('Uma chamada externa não deveria acontecer neste teste.'),
      );
    mockedAnalyzeMeal.mockResolvedValue(VALID_AI_PAYLOAD);
    mockedSaveScannedMealRecord.mockResolvedValue(SAVED_MEAL);
    mockedGetUserProfile.mockResolvedValue(UPDATED_PROFILE);
  });


  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('abre a pré-visualização integrada da câmara em vez do seletor de ficheiros', async () => {
    await render(<MealsScreen />);

    await fireEvent.press(screen.getByText('Câmara'));

    expect(await screen.findByText('Fotografar refeição')).toBeTruthy();
    expect(screen.getByText('Pré-visualização em direto')).toBeTruthy();
  }, 30_000);


  it('renderiza nome, tag e calorias de um payload JSON válido da IA', async () => {
    await renderAnalyzedMeal();

    expect(screen.getByText('Bowl de frango e arroz')).toBeTruthy();
    expect(screen.getByText('+Proteína')).toBeTruthy();
    expect(screen.getByDisplayValue('550')).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reflete no estado controlado a edição manual das calorias', async () => {
    await renderAnalyzedMeal();

    const caloriesInput = screen.getByLabelText('Calorias estimadas, editável');
    await fireEvent.press(caloriesInput);
    await fireEvent.changeText(caloriesInput, '620');

    expect(screen.getByDisplayValue('620')).toBeTruthy();
    expect(screen.queryByDisplayValue('550')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('confirma a refeição editada através do serviço SQLite local', async () => {
    await renderAnalyzedMeal();

    await fireEvent.changeText(
      screen.getByLabelText('Calorias estimadas, editável'),
      '620',
    );
    await fireEvent.press(screen.getByText('Confirmar e Ganhar +30 XP'));

    await waitFor(() => {
      expect(mockedSaveScannedMealRecord).toHaveBeenCalledWith({
        carbsGrams: 58,
        estimatedCalories: 620,
        fatGrams: 14,
        imageUrl: null,
        proteinGrams: 42,
        tags: ['+Proteína', 'Refeição Completa'],
        timestamp: expect.any(Number),
      });
    });
    expect(
      await screen.findByText('Refeição guardada localmente · +30 XP'),
    ).toBeTruthy();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
