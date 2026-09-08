import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { MetabolicExpenditureCard } from "@/components/ui/metabolic-expenditure-card";
import { getMetabolicExpenditureSnapshot } from "@/services/metabolicTdeeService";
import { useAppPreferencesStore } from "@/store/app-preferences-store";

jest.mock("@/services/metabolicTdeeService", () => ({
  getMetabolicExpenditureSnapshot: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useFocusEffect: (callback: () => void) => {
    const React = require("react");
    React.useEffect(() => {
      callback();
    }, []);
  },
}));

describe("MetabolicExpenditureCard", () => {
  beforeEach(() => {
    useAppPreferencesStore.setState({ language: "pt" });
    jest.clearAllMocks();
  });

  it("renderiza o TDEE e a decomposição metabólica quando os dados são carregados", async () => {
    (getMetabolicExpenditureSnapshot as jest.Mock).mockResolvedValue({
      ageYears: 30,
      balanceStatus: "balanced",
      biologicalSex: "male",
      bmrKcal: 1500,
      currentWeightKg: 72,
      dailyRoutineBurnKcal: 300,
      dailyWorkoutBurnKcal: 250,
      daysLoggedCount: 5,
      heightCm: 175,
      isPartialIntake: false,
      recentDailyIntakeKcal: 2050,
      statusDescription: "Ingestão calórica alinhada com o gasto estimado.",
      statusLabel: "Balanço Equilibrado",
      tdeeKcal: 2050,
    });

    await render(<MetabolicExpenditureCard />);

    await waitFor(() => {
      expect(screen.getByText("Despesa Metabólica Dinâmica")).toBeTruthy();
      expect(screen.getByText("Gasto Diário Estimado")).toBeTruthy();
      expect(screen.getByText("~2050")).toBeTruthy();
      expect(screen.getByText("1500 kcal")).toBeTruthy();
      expect(screen.getByText("+250 kcal")).toBeTruthy();
      expect(screen.getByText("2050 kcal")).toBeTruthy();
      expect(screen.getByText("Balanço Equilibrado")).toBeTruthy();
    });
  });
});
