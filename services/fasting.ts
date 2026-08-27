const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

export type EstimatedMetabolicPhaseId =
  | 'digestion'
  | 'glucose'
  | 'fat_burning'
  | 'ketosis'
  | 'autophagy'
  | 'deep_renewal';

export interface EstimatedMetabolicPhase {
  benefits: readonly string[];
  description: string;
  id: EstimatedMetabolicPhaseId;
  physiologicalEffect: string;
  startHour: number;
  timeRange: string;
  tip: string;
  title: string;
}

export interface FastingTimerCalculation {
  elapsedHours: number;
  elapsedMs: number;
  progress: number;
}

export interface CalculateFastingTimerInput {
  isActive: boolean;
  now: number;
  startedAt: number | null;
  targetDurationMs: number;
}

export const ESTIMATED_METABOLIC_PHASES: readonly EstimatedMetabolicPhase[] = [
  {
    benefits: [
      'Absorção dos macro e micronutrientes da última refeição',
      'Manutenção temporária dos níveis energéticos',
      'Digestão mecânica e enzimática no trato digestivo',
    ],
    description:
      'O organismo está focado na digestão da última refeição. A glicose e os níveis de insulina sobem, permitindo às células utilizar o açúcar no sangue como fonte primária de energia.',
    id: 'digestion',
    physiologicalEffect:
      'Pico de insulina circulante e início do armazenamento de glicose sob a forma de glicogénio muscular e hepático.',
    startHour: 0,
    timeRange: '0h–4h',
    tip: 'Mantém-te hidratado apenas com água para facilitar o trânsito digestivo.',
    title: 'Digestão & Absorção',
  },
  {
    benefits: [
      'Redução progressiva da insulina plasmática',
      'Estabilização da glicemia sanguínea',
      'Uso eficiente das reservas energéticas imediatas',
    ],
    description:
      'A digestão está concluída e a insulina começa a descer. O corpo recorre ao glicogénio acumulado no fígado (glicogenólise) para manter a energia e alimentar o cérebro.',
    id: 'glucose',
    physiologicalEffect:
      'Queda dos níveis de açúcar no sangue e desbloqueio gradual das vias de oxidação lipídica.',
    startHour: 4,
    timeRange: '4h–12h',
    tip: 'Se sentires fome súbita, bebe água ou chá sem açúcar; é apenas o reflexo hormonal da grelina.',
    title: 'Queima de Glicose',
  },
  {
    benefits: [
      'Início ativo da queima de gordura corporal (lipólise)',
      'Aumento da flexibilidade metabólica',
      'Sensibilidade melhorada dos recetores de insulina',
    ],
    description:
      'As reservas de glicogénio do fígado ficam significativamente reduzidas. O corpo faz a transição para oxidar ácidos gordos, convertendo lípidos em energia.',
    id: 'fat_burning',
    physiologicalEffect:
      'Aumento de glucagon e adrenalina, estimulando a quebra dos triglicéridos no tecido adiposo.',
    startHour: 12,
    timeRange: '12h–18h',
    tip: 'Excelente momento para caminhadas ligeiras ou trabalho focado; a clareza mental começa a aumentar.',
    title: 'Queima de Gordura',
  },
  {
    benefits: [
      'Produção consistente de corpos cetónicos (beta-hidroxibutirato)',
      'Clareza mental aguçada e ausência de picos de fome',
      'Redução de marcadores inflamatórios sistémicos',
    ],
    description:
      'O fígado começa a produzir corpos cetónicos a partir da gordura. O cérebro utiliza as cetonas como combustível limpo e supereficiente, promovendo foco e bem-estar.',
    id: 'ketosis',
    physiologicalEffect:
      'Elevação sustentada de cetonas no sangue e redução da dependência de glicose exógena.',
    startHour: 18,
    timeRange: '18h–24h',
    tip: 'Adiciona uma pitada de sal marinho na água para manter o equilíbrio eletrolítico.',
    title: 'Cetose Ativa',
  },
  {
    benefits: [
      'Reciclagem celular e degradação de proteínas senescentes',
      'Limpeza de mitocôndrias disfuncionais (mitofagia)',
      'Potencial proteção neurodegenerativa e longevidade celular',
    ],
    description:
      'Inicia-se a autofagia, um processo biológico nobre em que as células reciclam organelos danificados, vírus latentes e proteínas acumuladas, rejuvenescendo os tecidos.',
    id: 'autophagy',
    physiologicalEffect:
      'Inibição de mTOR e ativação de AMPK, desencadeando a reciclagem autofágica celular profunda.',
    startHour: 24,
    timeRange: '24h–48h',
    tip: 'Repouso e hidratação com eletrólitos (sódio, potássio, magnésio) são essenciais em jejuns de dia completo.',
    title: 'Autofagia Celular',
  },
  {
    benefits: [
      'Renovação de células estaminais e reset do sistema imunitário',
      'Redução drástica do stress oxidativo e inflamação',
      'Otimização profunda da sensibilidade à insulina',
    ],
    description:
      'Em jejuns prolongados superiores a 48 horas, o corpo desencadeia a renovação de leucócitos e células do sistema imunitário através de células estaminais, promovendo regeneração sistémica.',
    id: 'deep_renewal',
    physiologicalEffect:
      'Diminuição acentuada de IGF-1 e ativação da apoptose de células danificadas com regeneração imunitária.',
    startHour: 48,
    timeRange: '48h+',
    tip: 'Quebra o jejum prolongado com caldos nutritivos e porções pequenas de fácil digestão.',
    title: 'Regeneração & Reset',
  },
];

export function formatElapsedTime(elapsedMs: number): string {
  const totalSeconds = Math.floor(Math.max(0, elapsedMs) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}

export function getEstimatedPhaseIndex(elapsedHours: number): number {
  if (elapsedHours < 4) {
    return 0;
  }
  if (elapsedHours < 12) {
    return 1;
  }
  if (elapsedHours < 18) {
    return 2;
  }
  if (elapsedHours < 24) {
    return 3;
  }
  if (elapsedHours < 48) {
    return 4;
  }
  return 5;
}

export function calculateFastingTimer({
  isActive,
  now,
  startedAt,
  targetDurationMs,
}: CalculateFastingTimerInput): FastingTimerCalculation {
  const elapsedMs = isActive && startedAt !== null ? Math.max(0, now - startedAt) : 0;
  const progress =
    targetDurationMs > 0 ? Math.min(elapsedMs / targetDurationMs, 1) : 0;

  return {
    elapsedHours: elapsedMs / HOURS_TO_MILLISECONDS,
    elapsedMs,
    progress,
  };
}

export function getEstimatedMetabolicPhase(
  startedAt: number,
  now: number,
): EstimatedMetabolicPhase {
  const elapsedHours = Math.max(0, now - startedAt) / HOURS_TO_MILLISECONDS;
  return ESTIMATED_METABOLIC_PHASES[getEstimatedPhaseIndex(elapsedHours)];
}

