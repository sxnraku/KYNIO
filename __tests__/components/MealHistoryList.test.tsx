import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { MealHistoryList } from '@/components/ui/meal-history-list';
import * as dbService from '@/services/dbService';

jest.mock('@/services/dbService');

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

describe('MealHistoryList - Visual Diary & List Toggle', () => {
  const mockMeals = [
    {
      id: 1,
      timestamp: Date.now() - 3600 * 1000,
      estimatedCalories: 450,
      proteinGrams: 32,
      carbsGrams: 40,
      fatGrams: 15,
      imageUrl: 'file:///data/meal1.jpg',
      tags: ['Salmão Grelhado', 'Proteico'],
      notes: null,
      createdAt: Date.now(),
      deletedAt: null,
    },
    {
      id: 2,
      timestamp: Date.now() - 7200 * 1000,
      estimatedCalories: 280,
      proteinGrams: 12,
      carbsGrams: 35,
      fatGrams: 8,
      imageUrl: null,
      tags: ['Omelete Simples'],
      notes: null,
      createdAt: Date.now(),
      deletedAt: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (dbService.getMealRecords as jest.Mock).mockResolvedValue(mockMeals);
  });

  it('renderiza inicialmente em modo lista com refeições', async () => {
    render(<MealHistoryList />);

    await waitFor(() => {
      expect(screen.getByTestId('meal-list-view')).toBeTruthy();
      expect(screen.getByText('Salmão Grelhado')).toBeTruthy();
      expect(screen.getByText('Omelete Simples')).toBeTruthy();
    });
  });

  it('alterna para o modo Diário Visual (grelha) ao clicar no botão de grelha', async () => {
    render(<MealHistoryList />);

    await waitFor(() => {
      expect(screen.getByTestId('meal-view-mode-gallery')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('meal-view-mode-gallery'));

    await waitFor(() => {
      expect(screen.getByTestId('meal-gallery-grid')).toBeTruthy();
      expect(screen.getByText('450 kcal')).toBeTruthy();
      expect(screen.getByText('32g P')).toBeTruthy();
    });
  });
});
