import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { WeightTrackingCard } from "@/components/ui/weight-tracking-card";
import * as dbService from "@/services/dbService";

jest.mock("expo-router", () => ({
  useFocusEffect: (callback: () => void) => {
    const React = require("react");
    React.useEffect(() => {
      callback();
    }, []);
  },
}));

jest.mock("@/services/dbService", () => ({
  deleteWeightEntry: jest.fn(),
  getUserProfile: jest.fn(),
  getWeightEntries: jest.fn(),
  gramsToWeight: jest.fn((grams: number, unit: string) =>
    unit === "lb" ? grams / 453.592 : grams / 1000,
  ),
  saveWeightEntry: jest.fn(),
}));

jest.mock("@/services/cloudSyncService", () => ({
  deleteRemoteWeightEntry: jest.fn(),
}));

describe("WeightTrackingCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza o estado vazio quando não há registos", async () => {
    (dbService.getUserProfile as jest.Mock).mockResolvedValue({
      weightUnit: "kg",
    });
    (dbService.getWeightEntries as jest.Mock).mockResolvedValue([]);

    await render(<WeightTrackingCard />);

    await waitFor(() => {
      expect(screen.getAllByText("Peso").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Sem registos de peso")).toBeTruthy();
      expect(screen.getByText("Semana")).toBeTruthy();
      expect(screen.getByText("Mês")).toBeTruthy();
      expect(screen.getByText("Ano")).toBeTruthy();
      expect(screen.getAllByText("Todos").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Unidades: kg")).toBeTruthy();
    });
  });

  it("renderiza o gráfico com múltiplos registos de peso", async () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    (dbService.getUserProfile as jest.Mock).mockResolvedValue({
      weightUnit: "kg",
    });
    (dbService.getWeightEntries as jest.Mock).mockResolvedValue([
      {
        id: 1,
        weightGrams: 75000,
        timestamp: now - dayMs * 10,
        createdAt: now - dayMs * 10,
      },
      {
        id: 2,
        weightGrams: 74200,
        timestamp: now - dayMs * 5,
        createdAt: now - dayMs * 5,
      },
      {
        id: 3,
        weightGrams: 73500,
        timestamp: now,
        createdAt: now,
      },
    ]);

    await render(<WeightTrackingCard />);

    await waitFor(() => {
      expect(screen.getAllByText("Peso").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Unidades: kg")).toBeTruthy();
    });
  });
});
