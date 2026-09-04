import type {
  AnalyzeFastingBreakInput,
  FastingBreakAnalysis,
} from '@/types/fasting-break';

interface IngredientRule {
  autophagyDisrupted: boolean;
  breaksFasting: boolean;
  explanation: string;
  explanationEn: string;
  ketoSafe: boolean;
  name: string;
  nameEn: string;
  pattern: RegExp;
}

const INGREDIENT_RULES: IngredientRule[] = [
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém maltodextrina: índice glicémico superior ao açúcar, eleva insulina e interrompe a autofagia celular.',
    explanationEn: 'Contains maltodextrin: higher glycemic index than sugar, spikes insulin and interrupts cellular autophagy.',
    ketoSafe: false,
    name: 'Maltodextrina',
    nameEn: 'Maltodextrin',
    pattern: /maltodextr/i,
  },
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém aminoácidos de cadeia ramificada (BCAAs): ativam a via mTOR, interrompendo a autofagia celular.',
    explanationEn: 'Contains branched-chain amino acids (BCAAs): triggers the mTOR pathway, halting cellular autophagy.',
    ketoSafe: true,
    name: 'BCAAs / Leucina',
    nameEn: 'BCAAs / Leucine',
    pattern: /\b(bcaa|leucina|isoleucina|valina)\b/i,
  },
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém proteína de soro (Whey) ou colagénio: resposta insulínica e ativação proteica que quebram o jejum.',
    explanationEn: 'Contains whey protein or collagen: insulin response and protein activation break fasting state.',
    ketoSafe: true,
    name: 'Proteína / Whey / Colagénio',
    nameEn: 'Protein / Whey / Collagen',
    pattern: /\b(whey|prote[ií]na|col[aá]geno|case[ií]na)\b/i,
  },
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém açúcares simples (dextrose/frutose/sacarose): estimula glicose no sangue e quebra o jejum metabólico.',
    explanationEn: 'Contains simple sugars (dextrose/fructose/sucrose): stimulates blood glucose and breaks metabolic fast.',
    ketoSafe: false,
    name: 'Açúcar / Dextrose / Xarope',
    nameEn: 'Sugar / Dextrose / Syrup',
    pattern: /\b(a[cç][uú]car|dextrose|glucose|glicose|frutose|xarope|mel|sacarose)\b/i,
  },
  {
    autophagyDisrupted: true,
    breaksFasting: false,
    explanation: 'Contém leite animal ou natas: os hidratos (lactose) e gordura ativam o sistema digestivo e pausam a autofagia.',
    explanationEn: 'Contains dairy milk or cream: carbs (lactose) and fats trigger digestive absorption and pause autophagy.',
    ketoSafe: false,
    name: 'Leite / Lactose',
    nameEn: 'Milk / Lactose',
    pattern: /\b(leite|latte|creamer|iogurte|lactose)\b/i,
  },
  {
    autophagyDisrupted: false,
    breaksFasting: false,
    explanation: 'Adoçante artificial (sucralose/aspartame/acesulfame): sem calorias, seguro para cetose. Em jejuns estritos de autofagia, alguns estudos sugerem resposta cefálica leve.',
    explanationEn: 'Artificial sweetener (sucralose/aspartame): zero calories, keto-safe. In strict autophagy fasts, minor cephalic insulin response may occur.',
    ketoSafe: true,
    name: 'Adoçante Zero (Aspartame / Sucralose)',
    nameEn: 'Zero Sweetener (Aspartame / Sucralose)',
    pattern: /\b(sucralose|aspartame|acesulfam|sacarina)\b/i,
  },
  {
    autophagyDisrupted: false,
    breaksFasting: false,
    explanation: 'Adoçante natural não-calórico (Stevia / Eritritol): impacto glicémico nulo, seguro para cetose e jejum metabólico.',
    explanationEn: 'Natural non-caloric sweetener (Stevia / Erythritol): zero glycemic impact, safe for keto and metabolic fasting.',
    ketoSafe: true,
    name: 'Stevia / Eritritol',
    nameEn: 'Stevia / Erythritol',
    pattern: /\b(stevia|eritritol|erythritol|monk fruit)\b/i,
  },
  {
    autophagyDisrupted: false,
    breaksFasting: false,
    explanation: 'Eletrólitos puros (sódio, potássio, magnésio): essenciais durante o jejum, sem calorias nem impacto em autofagia.',
    explanationEn: 'Pure electrolytes (sodium, potassium, magnesium): essential during fasting, zero calories and no autophagy disruption.',
    ketoSafe: true,
    name: 'Eletrólitos / Sais Minerais',
    nameEn: 'Electrolytes / Mineral Salts',
    pattern: /\b(eletr[oó]litos?|magn[eé]sio|pot[aá]ssio|s[oó]dio|cloreto)\b/i,
  },
];

/**
 * Analisa uma descrição ou imagem de suplemento/bebida para diagnosticar quebra de jejum.
 */
export function analyzeFastingBreak(input: AnalyzeFastingBreakInput): FastingBreakAnalysis {
  const text = (input.description || '').trim();
  const lower = text.toLowerCase();

  // 1. Verificar negações de ingredientes para evitar falsos positivos ("sem açúcar", "zero açúcar", "sem leite")
  const sanitizedForSugar = lower.replace(
    /\b(sem|zero|sem\s+adi[cç][aã]o\s+de|no|sugar[\s-]free)\s+(a[cç][uú]car|leite|calorias?)\b/gi,
    '',
  );

  // 2. Avaliar regras de ingredientes
  const matchedRules: IngredientRule[] = [];
  for (const rule of INGREDIENT_RULES) {
    const textToTest = rule.name.includes('Açúcar') ? sanitizedForSugar : lower;
    if (rule.pattern.test(textToTest)) {
      matchedRules.push(rule);
    }
  }

  // Se detetar regras específicas (ingredientes que quebram ou afetam autofagia/cetose)
  if (matchedRules.length > 0) {
    const breaksFasting = matchedRules.some((r) => r.breaksFasting);
    const autophagyDisrupted = matchedRules.some((r) => r.autophagyDisrupted);
    const ketoSafe = matchedRules.every((r) => r.ketoSafe);
    const impact = breaksFasting
      ? 'metabolic_break'
      : autophagyDisrupted
      ? 'autophagy_break'
      : 'clean';

    const sensitiveIngredients = matchedRules.map((r) => r.name);
    const primaryRule = matchedRules.find((r) => r.breaksFasting) || matchedRules[0];

    const verdictTitle = breaksFasting
      ? 'Interrompe o Jejum'
      : autophagyDisrupted
      ? 'Pausa a Autofagia'
      : 'Seguro para Jejum ✦';

    const verdictTitleEn = breaksFasting
      ? 'Breaks Fasting'
      : autophagyDisrupted
      ? 'Pauses Autophagy'
      : 'Fasting Safe ✦';

    return {
      autophagyDisrupted,
      breaksFasting,
      confidence: 'high',
      explanation: primaryRule.explanation,
      explanationEn: primaryRule.explanationEn,
      impact,
      ketoSafe,
      productName: text || 'Bebida / Suplemento',
      sensitiveIngredients,
      verdictTitle,
      verdictTitleEn,
    };
  }

  // 3. Caso: Bebidas limpas (Café preto, chá, água pura)
  const isCoffeeOrTeaOrWater = /(caf[eé]|ch[aá]|[aá]gua)/i.test(lower);
  if (isCoffeeOrTeaOrWater) {
    return {
      autophagyDisrupted: false,
      breaksFasting: false,
      confidence: 'high',
      explanation: 'Café ou chá puro sem aditivos: não quebra o jejum metabólico, estimula a autofagia celular e é 100% seguro para cetose.',
      explanationEn: 'Black coffee or plain tea: does not break metabolic fast, actually stimulates autophagy and is 100% keto safe.',
      impact: 'clean',
      ketoSafe: true,
      productName: text || 'Café / Chá Puro',
      sensitiveIngredients: [],
      verdictTitle: 'Seguro para Jejum ✦',
      verdictTitleEn: 'Fasting Safe ✦',
    };
  }

  // 4. Caso: Refrigerante Zero / Bebida Energética Zero genérica
  if (/\b(zero|light|diet|coca\s+zero|pepsi\s+zero|monster\s+ultra)\b/i.test(lower)) {
    return {
      autophagyDisrupted: false,
      breaksFasting: false,
      confidence: 'medium',
      explanation: 'Bebida zero calorias: não quebra jejum metabólico nem cetose (0g de hidratos). Em jejuns com foco exclusivo em autofagia celular máxima, a água pura continua a ser a escolha recomendada.',
      explanationEn: 'Zero-calorie drink: does not break metabolic fast or keto (0g carbs). For strict cellular autophagy, plain water remains the gold standard.',
      impact: 'clean',
      ketoSafe: true,
      productName: text || 'Bebida Zero',
      sensitiveIngredients: ['Adoçante Zero'],
      verdictTitle: 'Seguro para Jejum ✦',
      verdictTitleEn: 'Fasting Safe ✦',
    };
  }

  // 5. Fallback neutro e seguro
  return {
    autophagyDisrupted: false,
    breaksFasting: false,
    confidence: 'low',
    explanation: 'Não foram detetados açúcares nem aditivos calóricos evidentes. Se a bebida tiver 0 calorias e 0g hidratos, o jejum metabólico é mantido.',
    explanationEn: 'No evident sugars or caloric additives detected. If the drink contains 0 calories and 0g carbs, metabolic fast is maintained.',
    impact: 'clean',
    ketoSafe: true,
    productName: text || 'Suplemento / Bebida',
    sensitiveIngredients: [],
    verdictTitle: 'Sem Quebra Evidente',
    verdictTitleEn: 'No Evident Fast Break',
  };
}
