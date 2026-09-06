import {
  APP_SHARE_URL,
  buildFastCompletionShareMessage,
  getFastShareTitle,
} from "@/services/fastShareContent";
import { getShareUrlLabel } from "@/services/achievementShareContent";
import type { CompletedFastSummary } from "@/store/useFastingStore";

const mockSummary: CompletedFastSummary = {
  completed: true,
  elapsedHours: 16,
  elapsedMs: 16 * 3600 * 1000,
  endTime: 1700000000000,
  goalId: "16:8",
  goalLabel: "16:8",
  startTime: 1700000000000 - 16 * 3600 * 1000,
  targetHours: 16,
  xpEarned: 100,
};

describe("fastShareContent", () => {
  it("tem o APP_SHARE_URL a apontar para o website do KYNIO", () => {
    expect(APP_SHARE_URL).toBe("https://sxnraku.github.io/KYNIO");
  });

  it("produz uma etiqueta de rodapé limpa sem protocolo nem barra final", () => {
    expect(getShareUrlLabel()).toBe("sxnraku.github.io/KYNIO");
  });

  it("gera mensagem em português com o URL apenas uma vez", () => {
    const message = buildFastCompletionShareMessage(mockSummary, "pt");

    expect(message).toContain("☀️ Concluí 16h 0m de jejum intermitente com o KYNIO!");
    expect(message).toContain("Descarrega grátis: https://sxnraku.github.io/KYNIO");

    // Verifica que o URL aparece exatamente 1 vez
    const occurrences = (message.match(/https:\/\/sxnraku\.github\.io\/KYNIO/g) || []).length;
    expect(occurrences).toBe(1);
  });

  it("gera mensagem em inglês com o URL apenas uma vez", () => {
    const message = buildFastCompletionShareMessage(mockSummary, "en");

    expect(message).toContain("☀️ Completed 16h 0m of fasting with KYNIO!");
    expect(message).toContain("Download free: https://sxnraku.github.io/KYNIO");

    const occurrences = (message.match(/https:\/\/sxnraku\.github\.io\/KYNIO/g) || []).length;
    expect(occurrences).toBe(1);
  });

  it("retorna os títulos corretos de partilha", () => {
    expect(getFastShareTitle("pt")).toBe("KYNIO — Jejum Concluído");
    expect(getFastShareTitle("en")).toBe("KYNIO — Fast Completed");
  });
});
