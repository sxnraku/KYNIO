import { translateText } from "@/services/i18n";

const KEY_STRINGS: Array<[string, string]> = [
  ["A analisar…", "Analysing…"],
  ["A carregar histórico…", "Loading history…"],
  [
    "A tua identidade e progresso pessoal no KYNIO.",
    "Your identity and personal progress in KYNIO.",
  ],
  ["ATUALIZAÇÃO OBRIGATÓRIA", "MANDATORY UPDATE"],
  ["Adicionar 250ml de água", "Add 250ml of water"],
  ["Adicionar 500ml de água", "Add 500ml of water"],
  ["Biografia do perfil", "Profile bio"],
  ["Compreendo e aceito os termos", "I understand and accept the terms"],
  ["Configurar Rotina de Jejum", "Configure Fasting Routine"],
  ["Clarificação dos alimentos", "Food clarification"],
  ["Data de início do jejum", "Fasting start date"],
  ["Descrição da refeição", "Meal description"],
  ["Dias com jejum", "Days with fasting"],
  ["Dias seguidos", "Days in a row"],
  ["Duração personalizada em minutos", "Custom duration in minutes"],
  ["Editar hora de início do jejum", "Edit fasting start time"],
  ["Eliminar registo", "Delete entry"],
  ["Escolher fotografia de perfil", "Choose profile photo"],
  ["Evolução", "Progress"],
  ["Fechar", "Close"],
  ["Fechar câmara", "Close camera"],
  ["Fechar detalhes da fase", "Close phase details"],
  ["Fotografia de perfil", "Profile photo"],
  ["Fotografia selecionada da refeição", "Selected meal photo"],
  ["Hora de início do jejum", "Fasting start time"],
  ["Iniciar Jejum", "Start Fast"],
  ["Já comecei o jejum antes", "I started fasting earlier"],
  ["Peso inicial opcional", "Optional starting weight"],
  ["Remover 250ml de água", "Remove 250ml of water"],
  ["Símbolo KYNIO", "KYNIO symbol"],
  ["Trocar câmara", "Flip camera"],
  ["Voltar", "Back"],
  [
    "Fases metabólicas estimadas com base em literatura científica de jejum. Varia de pessoa para pessoa. Toca nas fases para ver todos os detalhes biológicos.",
    "Metabolic phases estimated from fasting science literature. They vary from person to person. Tap the phases to see all biological details.",
  ],
  ["Histórico", "History"],
  ["Histórico de Peso", "Weight History"],
  ["Horas de Jejum (7 Dias)", "Fasting Hours (7 Days)"],
  ["Jejum mais longo", "Longest fast"],
  ["Lembrar mais tarde", "Remind me later"],
  ["Mês", "Month"],
  [
    "Não foi possível captar a fotografia. Tenta novamente.",
    "The photo could not be taken. Please try again.",
  ],
  [
    "Não foi possível carregar os registos de peso.",
    "Weight entries could not be loaded.",
  ],
  ["Não foi possível eliminar o registo.", "The entry could not be deleted."],
  [
    "Não foi possível preparar a partilha.",
    "Sharing could not be prepared.",
  ],
  ["NOVA VERSÃO DISPONÍVEL", "NEW VERSION AVAILABLE"],
  ["Nova versão:", "New version:"],
  ["Notas opcionais sobre a atividade", "Optional notes about the activity"],
  ["Quantidade ou porção da refeição", "Meal quantity or portion"],
  ["Recompensas de XP", "XP Rewards"],
  [
    "Remove a base SQLite, fotografias privadas e, quando ligada, a conta e os dados sincronizados.",
    "Removes the SQLite database, private photos and, when connected, the account and synced data.",
  ],
  ["Renovação", "Renewal"],
  ["Sem registos de peso", "No weight entries"],
  ["Semana", "Week"],
  ["Tempo total de jejum", "Total fasting time"],
  [
    "Toca em + para acompanhar a tua evolução ao longo do tempo.",
    "Tap + to track your progress over time.",
  ],
  ["Ver todos os registos", "View all entries"],
  ["Versão instalada:", "Installed version:"],
];

describe("translateText", () => {
  it("devolve o texto original em português", () => {
    expect(translateText("A tua identidade e progresso pessoal no KYNIO.", "pt")).toBe(
      "A tua identidade e progresso pessoal no KYNIO.",
    );
  });

  it.each(KEY_STRINGS)("traduz «%s» para inglês", (source, expected) => {
    expect(translateText(source, "en")).toBe(expected);
  });

  it("traduz padrões dinâmicos usados na UI", () => {
    expect(translateText("Diário · 18h", "en")).toBe("Daily · 18h");
    expect(translateText("Fase: Cetose · Sem limite pré-fixado", "en")).toBe(
      "Phase: Ketosis · No preset limit",
    );
    expect(translateText("Introduz o teu peso em kg.", "en")).toBe(
      "Enter your weight in kg.",
    );
    expect(
      translateText(
        "Desbloqueia análises de refeição ilimitadas com IA e todas as ferramentas premium.",
        "en",
      ),
    ).toBe("Unlock unlimited AI meal analyses and all premium tools.");
  });

  it("traduz padrões dinâmicos de accessibilityLabels", () => {
    expect(translateText("150 de 500 XP neste nível", "en")).toBe(
      "150 of 500 XP in this level",
    );
    expect(translateText("40 de 100 XP para o próximo nível", "en")).toBe(
      "40 of 100 XP to the next level",
    );
    expect(translateText("Editar Objetivo 16:8", "en")).toBe(
      "Edit target 16:8",
    );
    expect(
      translateText(
        "Objetivo 16:8, temporizador 01:23:45, Jejum Ativo",
        "en",
      ),
    ).toBe("Target 16:8, timer 01:23:45, active fast");
    expect(
      translateText(
        "Objetivo Jejum Livre, temporizador 26:10:00, Jejum Inativo",
        "en",
      ),
    ).toBe("Target Open Fasting, timer 26:10:00, inactive fast");
    expect(translateText("Primeiras 50h, desbloqueada", "en")).toBe(
      "First 50h, unlocked",
    );
    expect(translateText("Linha de 7 Dias, bloqueada", "en")).toBe(
      "7-Day Line, locked",
    );
    expect(translateText("12h–18h, Cetose, fase estimada atual", "en")).toBe(
      "12h–18h, Ketosis, current estimated phase",
    );
    expect(translateText("0h–4h, Digestão & Absorção", "en")).toBe(
      "0h–4h, Digestion & Absorption",
    );
  });
});
