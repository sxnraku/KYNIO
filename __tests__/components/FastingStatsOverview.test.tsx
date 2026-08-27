import { render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { FastingStatsOverview } from "@/components/ui/fasting-stats-overview";
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
  getFastRecords: jest.fn(),
}));

describe("FastingStatsOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza corretamente com estado vazio", async () => {
    (dbService.getFastRecords as jest.Mock).mockResolvedValue([]);

    await render(<FastingStatsOverview />);

    await waitFor(() => {
      expect(screen.getByText("Jejuns")).toBeTruthy();
      expect(screen.getByText("Jejum mais longo")).toBeTruthy();
      expect(screen.getByText("Tempo total de jejum")).toBeTruthy();
      expect(screen.getByText("Dias com jejum")).toBeTruthy();
      expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("calcula e formata corretamente as métricas de múltiplos jejuns", async () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const hourMs = 60 * 60 * 1000;

    const mockRecords = [
      {
        id: 1,
        startTime: now - dayMs * 2 - hourMs * 16,
        endTime: now - dayMs * 2,
        targetHours: 16,
        completed: true,
        xpEarned: 100,
      },
      {
        id: 2,
        startTime: now - dayMs - hourMs * 36,
        endTime: now - dayMs,
        targetHours: 36,
        completed: true,
        xpEarned: 200,
      },
    ];

    (dbService.getFastRecords as jest.Mock).mockResolvedValue(mockRecords);

    await render(<FastingStatsOverview />);

    await waitFor(() => {
      expect(screen.getAllByText("2")).toHaveLength(2);
      expect(screen.getByText("1d 12h")).toBeTruthy();
      expect(screen.getByText("2d 4h")).toBeTruthy();
    });
  });
});
