import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { FastCompletionModal } from "@/components/ui/fast-completion-modal";
import { useAppPreferencesStore } from "@/store/app-preferences-store";
import type { CompletedFastSummary } from "@/store/useFastingStore";

const mockSummary: CompletedFastSummary = {
  completed: true,
  elapsedHours: 16.5,
  elapsedMs: 16.5 * 3600 * 1000,
  endTime: Date.now(),
  goalId: "16:8",
  goalLabel: "16:8",
  startTime: Date.now() - 16.5 * 3600 * 1000,
  targetHours: 16,
  xpEarned: 100,
};

describe("FastCompletionModal", () => {
  beforeEach(() => {
    useAppPreferencesStore.setState({ language: "pt" });
  });

  it("não renderiza nada se summary for null", async () => {
    await render(
      <FastCompletionModal onClose={jest.fn()} summary={null} visible={true} />,
    );
    expect(screen.queryByText("Jejum Concluído! ☀️")).toBeNull();
  });

  it("renderiza o modal com o cartão circadiano e botões quando visível", async () => {
    const onClose = jest.fn();
    await render(
      <FastCompletionModal
        onClose={onClose}
        summary={mockSummary}
        visible={true}
      />,
    );

    expect(screen.getByText("Jejum Concluído! ☀️")).toBeTruthy();
    expect(screen.getByText("KYNIO")).toBeTruthy();
    expect(screen.getByText("JEJUM CONCLUÍDO")).toBeTruthy();
    expect(screen.getByText("16h 30m")).toBeTruthy();
    expect(screen.getByTestId("share-fast-button")).toBeTruthy();
    expect(screen.getByTestId("close-fast-completion-button")).toBeTruthy();

    fireEvent.press(screen.getByTestId("close-fast-completion-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renderiza textos em inglês quando o idioma for en", async () => {
    useAppPreferencesStore.setState({ language: "en" });

    await render(
      <FastCompletionModal
        onClose={jest.fn()}
        summary={mockSummary}
        visible={true}
      />,
    );

    expect(screen.getByText("Fast Completed! ☀️")).toBeTruthy();
    expect(screen.getByText("FAST COMPLETED")).toBeTruthy();
    expect(screen.getByText("Share Achievement (Stories / WhatsApp)")).toBeTruthy();
    expect(screen.getByText("Continue to App")).toBeTruthy();
  });
});
