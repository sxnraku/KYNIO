const HOURS_TO_MILLISECONDS = 60 * 60 * 1000;

export type EstimatedMetabolicPhaseId =
  | 'digestion'
  | 'glucose'
  | 'fat_burning'
  | 'ketosis'
  | 'autophagy'
  | 'deep_renewal';

export interface PhaseReference {
  /** Identificador PubMed (PMID). */
  pmid: string;
  /** Nota curta sobre o que o estudo observou e as suas limitações. */
  note: string;
  /** Título do artigo científico. */
  title: string;
  /** Ano de publicação. */
  year: number;
}

export interface EstimatedMetabolicPhase {
  benefits: readonly string[];
  description: string;
  id: EstimatedMetabolicPhaseId;
  physiologicalEffect: string;
  /** Referências bibliográficas de apoio (leitura de contexto, não promessa de resultado). */
  references?: readonly PhaseReference[];
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
    references: [
      {
        note: 'Estudo com 36 voluntários saudáveis: após uma refeição mista equilibrada, a glicose e a insulina séricas sobem nas primeiras horas, com amostragens até aos 180 min — confirma a fase de absorção em humanos.',
        pmid: '35105852',
        title: 'Absence of a sexual dimorphism in postprandial glucose metabolism after administration of a balanced mixed meal in healthy young volunteers (Nutrition & Diabetes)',
        year: 2022,
      },
    ],
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
    references: [
      {
        note: 'Estudo randomizado com medição direta por espectroscopia de ressonância magnética (13C-MRS): quantificou a depleção do glicogénio hepático durante o jejum noturno em humanos e a sua reposição após refeição.',
        pmid: '36797201',
        title: 'Liver glycogen stores via 13C magnetic resonance spectroscopy in healthy children: randomized, controlled study (Am J Clin Nutr)',
        year: 2023,
      },
    ],
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
    references: [
      {
        note: 'Ensaio randomizado com 36 adultos magros saudáveis: jejuns de 24h isolaram os efeitos metabólicos do jejum, incluindo a mobilização de gordura, em comparação com restrição energética contínua.',
        pmid: '34135111',
        title: 'A randomized controlled trial to isolate the effects of fasting and energy restriction on weight loss and metabolic health in lean adults (Science Translational Medicine)',
        year: 2021,
      },
    ],
    startHour: 12,
    timeRange: '12h–18h',
    tip: 'Excelente momento para caminhadas ligeiras ou trabalho focado; a clareza mental começa a aumentar.',
    title: 'Queima de Gordura',
  },
  {
    benefits: [
      'Produção de corpos cetónicos (beta-hidroxibutirato) pelo fígado',
      'Muitas pessoas reportam clareza mental e menos picos de fome',
      'Estudos associam a cetose a marcadores inflamatórios mais baixos',
    ],
    description:
      'Com as reservas de glicogénio esgotadas, o fígado converte gordura em corpos cetónicos. O cérebro passa a usar cetonas como fonte alternativa de energia — o momento exato varia de pessoa para pessoa.',
    id: 'ketosis',
    physiologicalEffect:
      'Subida das cetonas no sangue e menor dependência de glicose.',
    references: [
      {
        note: 'Ensaio randomizado com 60 adultos saudáveis não-obesos: 4 semanas de jejum em dias alternados aumentaram o beta-hidroxibutirato (cetona) mesmo nos dias sem jejum, com melhoria de marcadores cardiovasculares.',
        pmid: '31471173',
        title: 'Alternate Day Fasting Improves Physiological and Molecular Markers of Aging in Healthy, Non-obese Humans (Cell Metabolism)',
        year: 2019,
      },
      {
        note: 'Estudo-piloto com 5 adultos saudáveis num jejum de 72h: confirma a queda de insulina e glicose e a remodelação metabólica em humanos; amostra pequena, resultados preliminares.',
        pmid: '42286908',
        title: 'Systemic metabolic, hormonal, and glycomic remodeling during a 72-hour fast in healthy adults',
        year: 2026,
      },
    ],
    startHour: 18,
    timeRange: '18h–24h',
    tip: 'Adiciona uma pitada de sal marinho na água para manter o equilíbrio eletrolítico.',
    title: 'Cetose Ativa',
  },
  {
    benefits: [
      'Processo natural de reciclagem de componentes celulares danificados',
      'Inclui a mitofagia: reciclagem de mitocôndrias disfuncionais',
      'Está a ser estudada por possível relação com longevidade celular',
    ],
    description:
      'A autofagia está sempre ativa a nível basal, mas o jejum tende a intensificá-la: as células passam a reciclar mais organelos e proteínas danificadas. Em humanos, o ponto exato de intensificação ainda não foi medido diretamente — a estimativa de 24h+ é baseada sobretudo em estudos animais.',
    id: 'autophagy',
    physiologicalEffect:
      'O jejum reduz a sinalização de mTOR e ativa a AMPK, duas vias associadas ao aumento da atividade autofágica.',
    references: [
      {
        note: 'Trial clínico piloto (30 participantes) que mediu fluxo autofágico em células sanguíneas humanas durante uma dieta que mimetiza o jejum — dos poucos estudos com medição direta em humanos; amostra pequena.',
        pmid: '41372565',
        title: 'Effect of fasting-mimicking diet on markers of autophagy and metabolic health in human subjects (GeroScience)',
        year: 2025,
      },
      {
        note: 'Jejum de 72h em 5 adultos criou um ambiente metabólico "conducente à autofagia" — mas os autores sublinham que a autofagia não foi medida diretamente.',
        pmid: '42286908',
        title: 'Systemic metabolic, hormonal, and glycomic remodeling during a 72-hour fast in healthy adults',
        year: 2026,
      },
    ],
    startHour: 24,
    timeRange: '24h–48h',
    tip: 'Repouso e hidratação com eletrólitos (sódio, potássio, magnésio) são essenciais em jejuns de dia completo.',
    title: 'Autofagia Celular',
  },
  {
    benefits: [
      'Redução de IGF-1, pressão arterial e gordura corporal observada em ensaios clínicos',
      'Melhoria de marcadores de idade biológica em dois estudos independentes',
      'Melhoria da sensibilidade à insulina em participantes de risco',
    ],
    description:
      'Jejuns prolongados ou dietas que os mimetizam foram testados em ensaios clínicos com humanos: ciclos de 5 dias reduziram IGF-1, pressão arterial e marcadores inflamatórios, e dois estudos independentes observaram uma redução de ~2,5 anos na idade biológica medida. São resultados promissores, mas a investigação continua.',
    id: 'deep_renewal',
    physiologicalEffect:
      'Redução sustentada de IGF-1 e resistência à insulina, com aumento do rácio linfoide/mieloide (indicador de rejuvenescimento imunitário).',
    references: [
      {
        note: 'Ensaio randomizado com 100 participantes: 3 ciclos mensais de 5 dias de dieta que mimetiza o jejum reduziram peso, pressão arterial e IGF-1, sem efeitos adversos graves.',
        pmid: '28202779',
        title: 'Fasting-mimicking diet and markers/risk factors for aging, diabetes, cancer, and cardiovascular disease (Science Translational Medicine)',
        year: 2017,
      },
      {
        note: 'Análise de dois ensaios clínicos em humanos: 3 ciclos de FMD associaram-se a ~2,5 anos de redução na mediana da idade biológica e a melhoria do rácio linfoide/mieloide (indicador de idade imunitária).',
        pmid: '38378685',
        title: 'Fasting-mimicking diet causes hepatic and blood markers changes indicating reduced biological age and disease risk (Nature Communications)',
        year: 2024,
      },
    ],
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

