import { getMealFastingContext } from "@/services/fastingWindowService";
import type { FastRecord } from "@/db/schema";

describe("fastingWindowService", () => {
  const baseTime = 1700000000000;

  const mockCompletedFasts: FastRecord[] = [
    {
      completed: true,
      deletedAt: null,
      endTime: baseTime + 16 * 3600 * 1000,
      id: 1,
      startTime: baseTime,
      targetHours: 16,
      xpEarned: 100,
    },
  ];

  it("identifica refeição durante jejum ativo como quebra de jejum com duração", () => {
    const activeStart = baseTime + 24 * 3600 * 1000;
    const mealTime = activeStart + 14.5 * 3600 * 1000; // 14h 30m depois

    const contextPt = getMealFastingContext(
      mealTime,
      mockCompletedFasts,
      { startTime: activeStart, targetHours: 16 },
      "pt",
    );

    expect(contextPt.type).toBe("fast_break");
    expect(contextPt.label).toContain("Quebrou Jejum");
    expect(contextPt.label).toContain("14h");
    expect(contextPt.hoursFasted).toBeCloseTo(14.5, 1);

    const contextEn = getMealFastingContext(
      mealTime,
      mockCompletedFasts,
      { startTime: activeStart, targetHours: 16 },
      "en",
    );
    expect(contextEn.type).toBe("fast_break");
    expect(contextEn.label).toContain("Broke Fast");
  });

  it("identifica refeição durante jejum histórico como quebra/interrupção", () => {
    const mealTime = baseTime + 8 * 3600 * 1000; // às 8h do jejum concluído

    const context = getMealFastingContext(
      mealTime,
      mockCompletedFasts,
      null,
      "pt",
    );

    expect(context.type).toBe("fast_break");
    expect(context.label).toContain("Durante Jejum");
    expect(context.label).toContain("8h");
  });

  it("identifica refeição fora de qualquer jejum como janela alimentar", () => {
    const mealTime = baseTime + 18 * 3600 * 1000; // 2h após o fim do jejum de 16h

    const contextPt = getMealFastingContext(
      mealTime,
      mockCompletedFasts,
      null,
      "pt",
    );

    expect(contextPt.type).toBe("eating_window");
    expect(contextPt.label).toBe("Janela Alimentar");

    const contextEn = getMealFastingContext(
      mealTime,
      mockCompletedFasts,
      null,
      "en",
    );
    expect(contextEn.type).toBe("eating_window");
    expect(contextEn.label).toBe("Eating Window");
  });
});
