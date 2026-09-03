export interface PaywallFeature {
  desc: string;
  icon: string;
  title: string;
}

export interface PlanComparisonRow {
  feature: string;
  free: string;
  pro: string;
}

export const PAYWALL_COMPARISON_ROWS: readonly PlanComparisonRow[] = [
  {
    feature: "Scanner de Refeições com IA",
    free: "3 / dia",
    pro: "Ilimitado ♾️",
  },
  {
    feature: "Proteção de Sequência (Streak)",
    free: "Nenhuma",
    pro: "2 Escudos/mês 🛡️",
  },
  {
    feature: "Fases Metabólicas",
    free: "Resumo básico",
    pro: "Biologia & Autofagia 🧬",
  },
  {
    feature: "Protocolos de Jejum",
    free: "Apenas 16:8",
    pro: "OMAD, 36h, ADF, Reset ⏱️",
  },
  {
    feature: "Dossiê Clínico em PDF",
    free: "Indisponível",
    pro: "Relatório Completo 📄",
  },
  {
    feature: "Temas Visuais",
    free: "2 Temas",
    pro: "Todos os Temas 🎨",
  },
];

export const PAYWALL_PRO_FEATURES: readonly PaywallFeature[] = [
  {
    icon: '🥗',
    title: 'Análises de IA Ilimitadas',
    desc: 'Fotografa e analisa refeições sem limites diários de tokens.',
  },
  {
    icon: '🛡️',
    title: 'Escudo de Sol (Proteção de Streak)',
    desc: '2 proteções mensais para nunca perderes a tua sequência de dias e XP.',
  },
  {
    icon: '🎨',
    title: 'Temas Visuais Exclusivos',
    desc: 'AMOLED Preto Puro, Crepúsculo & Ouro, Matcha Botânico e Studio Monocromo.',
  },
  {
    icon: '📄',
    title: 'Dossiê de Hábitos em PDF',
    desc: 'Exportação gráfica do histórico factual de jejum, peso e consistência.',
  },
  {
    icon: '⏱️',
    title: 'Todos os Protocolos de Jejum',
    desc: 'Acesso a 36h Monge, 48h Reset, OMAD e Jejum Livre prolongado.',
  },
  {
    icon: '🧬',
    title: 'Fases Metabólicas Detalhadas',
    desc: 'Explicações biológicas aprofundadas, cetose e autofagia celular.',
  },
  {
    icon: '🗓️',
    title: 'Planeador de Jejum',
    desc: 'Rotinas diárias, ADF e personalizadas planeadas automaticamente.',
  },
  {
    icon: '☁️',
    title: 'Sincronização em Nuvem',
    desc: 'Cópia de segurança encriptada e sincronização multi-dispositivo.',
  },
];
