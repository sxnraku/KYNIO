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
  // 1. Pães, Amidos, Grãos e Cereais (Quebra metabólica direta)
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Alimento rico em amido e hidratos de carbono: eleva a glicemia e insulina, interrompendo imediatamente o jejum metabólico, a cetose e a autofagia.',
    explanationEn: 'Food rich in starch and carbohydrates: spikes blood glucose and insulin, immediately ending metabolic fasting, ketosis, and autophagy.',
    ketoSafe: false,
    name: 'Pão / Cereais / Amidos',
    nameEn: 'Bread / Cereals / Starches',
    pattern: /\b(p[aã]o|p[aã]es|integral|torrada|tosta|broa|croissant|massa|esparguete|macarr[aã]o|arroz|batata|aveia|cereal|cereais|farinha|trigo|panqueca|crepe|tapioca|mandioca|cuscuz|bolacha|bisc|muffin|bagel|wrap|sandes|sandu[ií]che)\b/i,
  },
  // 2. Açúcares simples e adoçantes calóricos
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém açúcares simples (dextrose/frutose/sacarose): absorção rápida que eleva a glicose no sangue e cessa o jejum metabólico.',
    explanationEn: 'Contains simple sugars (dextrose/fructose/sucrose): rapid absorption spikes blood glucose and breaks metabolic fast.',
    ketoSafe: false,
    name: 'Açúcar / Dextrose / Mel / Xarope',
    nameEn: 'Sugar / Dextrose / Honey / Syrup',
    pattern: /\b(a[cç][uú]car|dextrose|glucose|glicose|frutose|xarope|mel|sacarose|agave)\b/i,
  },
  // 3. Maltodextrina e hidratos de índice glicémico ultra-alto
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém maltodextrina: índice glicémico superior ao açúcar comum, eleva a insulina e interrompe a autofagia celular.',
    explanationEn: 'Contains maltodextrin: higher glycemic index than sugar, spikes insulin and halts cellular autophagy.',
    ketoSafe: false,
    name: 'Maltodextrina',
    nameEn: 'Maltodextrin',
    pattern: /maltodextr/i,
  },
  // 4. Frutas, sumos e batidos
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém frutose e açúcares naturais da fruta: metabolização hepática que reativa a digestão e interrompe o estado de jejum.',
    explanationEn: 'Contains fructose and natural fruit sugars: liver metabolism restarts digestion and breaks the fasting state.',
    ketoSafe: false,
    name: 'Fruta / Sumo / Smoothie',
    nameEn: 'Fruit / Juice / Smoothie',
    pattern: /\b(fruta|frutas|banana|ma[cç][aã]|laranja|pera|ma[cç]as?|uva|manga|abacaxi|mel[aã]o|melancia|morango|mirtilo|abacate|sumo|suco|smoothie|polpa)\b/i,
  },
  // 5. Carnes, Aves, Peixes, Ovos e Marisco (Proteína/Gordura)
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Fonte de proteínas e aminoácidos: ativa a via mTOR e processos digestivos, interrompendo a autofagia e o jejum.',
    explanationEn: 'Source of protein and amino acids: stimulates the mTOR pathway and digestive processes, ending autophagy and the fast.',
    ketoSafe: true,
    name: 'Carne / Peixe / Ovos / Proteína',
    nameEn: 'Meat / Fish / Eggs / Protein',
    pattern: /\b(carne|frango|bife|peru|porco|vaca|peixe|atum|salm[aã]o|bacalhau|ovo|ovos|omelete|clara|gema|marisco|camar[aã]o|presunto|fiambre|bacon|chouri[cç]o|salsicha)\b/i,
  },
  // 6. Proteína em pó, Whey, Caseína e Colagénio
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém proteína concentrada (Whey/Colagénio/Caseína): resposta insulínica e absorção de aminoácidos que cessam o jejum.',
    explanationEn: 'Contains concentrated protein (Whey/Collagen/Casein): insulin response and amino acid intake break the fast.',
    ketoSafe: true,
    name: 'Whey / Proteína / Colagénio',
    nameEn: 'Whey / Protein / Collagen',
    pattern: /\b(whey|prote[ií]na|col[aá]geno|case[ií]na)\b/i,
  },
  // 7. BCAAs e aminoácidos ramificados
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Contém aminoácidos de cadeia ramificada (BCAAs): ativam diretamente a via mTOR, parando a autofagia celular.',
    explanationEn: 'Contains branched-chain amino acids (BCAAs): directly trigger the mTOR pathway, pausing cellular autophagy.',
    ketoSafe: true,
    name: 'BCAAs / Leucina',
    nameEn: 'BCAAs / Leucine',
    pattern: /\b(bcaa|leucina|isoleucina|valina)\b/i,
  },
  // 8. Laticínios e derivados
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Laticínios contêm hidratos (lactose), gorduras e proteínas que ativam o trato gastrointestinal e interrompem o jejum.',
    explanationEn: 'Dairy contains carbs (lactose), fats, and proteins that activate the GI tract and break fasting.',
    ketoSafe: false,
    name: 'Leite / Iogurte / Queijo',
    nameEn: 'Milk / Yogurt / Cheese',
    pattern: /\b(leite|latte|creamer|iogurte|lactose|queijo|requeij[aã]o|nata|creme\s+de\s+leite)\b/i,
  },
  // 9. Leguminosas e vegetais calóricos
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Leguminosas e amidos vegetais fornecem calorias e hidratos que terminam o período de jejum.',
    explanationEn: 'Legumes and vegetable starches provide calories and carbs that conclude the fasting window.',
    ketoSafe: false,
    name: 'Leguminosas / Vegetais',
    nameEn: 'Legumes / Vegetables',
    pattern: /\b(feij[aã]o|gr[aã]o|lentilha|ervilha|milho|soja|tofu)\b/i,
  },
  // 10. Doces, Fast Food e Sobremesas
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Alimento de alta densidade calórica: quebra imediata do jejum metabólico, pico de insulina e interrupção de autofagia.',
    explanationEn: 'Calorie-dense food: immediate break of metabolic fasting, insulin spike, and autophagy suspension.',
    ketoSafe: false,
    name: 'Doces / Fast Food / Snacks',
    nameEn: 'Sweets / Fast Food / Snacks',
    pattern: /\b(chocolate|gelado|sorvete|bolo|torta|pipoca|salgado|pizza|hamb[uú]rguer|fritura|frito|batata\s+frita|snack|guloseima|sobremesa|doce)\b/i,
  },
  // 11. Gorduras e óleos puros (Manteiga, Azeite, MCT)
  {
    autophagyDisrupted: true,
    breaksFasting: false,
    explanation: 'Gorduras puras não elevam a glicose no sangue nem a insulina (mantêm cetose), mas as calorias ativam a digestão e pausam a autofagia.',
    explanationEn: 'Pure fats do not spike blood glucose or insulin (preserving ketosis), but calories activate digestion and pause autophagy.',
    ketoSafe: true,
    name: 'Gordura Pura (Azeite / Óleo MCT / Manteiga)',
    nameEn: 'Pure Fat (Olive Oil / MCT Oil / Butter)',
    pattern: /\b(manteiga|margarina|azeite|[oó]leo|mct|gordura|banha)\b/i,
  },
  // 12. Termos genéricos de refeição sólida
  {
    autophagyDisrupted: true,
    breaksFasting: true,
    explanation: 'Refeição sólida com calorias e nutrientes: desencadeia a digestão gástrica e encerra o jejum metabólico.',
    explanationEn: 'Solid meal with calories and nutrients: starts gastric digestion and concludes the metabolic fast.',
    ketoSafe: false,
    name: 'Refeição Sólida',
    nameEn: 'Solid Meal',
    pattern: /\b(almo[cç]o|jantar|lanche|comida|refei[cç][aã]o|petisco|prato|salada)\b/i,
  },
  // 13. Adoçantes artificiais zero calorias
  {
    autophagyDisrupted: false,
    breaksFasting: false,
    explanation: 'Adoçante artificial (sucralose/aspartame/acesulfame): sem calorias, seguro para cetose e jejum metabólico.',
    explanationEn: 'Artificial sweetener (sucralose/aspartame): zero calories, keto-safe and safe for metabolic fasting.',
    ketoSafe: true,
    name: 'Adoçante Zero (Aspartame / Sucralose)',
    nameEn: 'Zero Sweetener (Aspartame / Sucralose)',
    pattern: /\b(sucralose|aspartame|acesulfam|sacarina)\b/i,
  },
  // 14. Adoçantes naturais não-calóricos
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
  // 15. Eletrólitos puros e sais minerais
  {
    autophagyDisrupted: false,
    breaksFasting: false,
    explanation: 'Eletrólitos puros (sódio, potássio, magnésio): essenciais durante o jejum, sem calorias nem impacto na autofagia.',
    explanationEn: 'Pure electrolytes (sodium, potassium, magnesium): essential during fasting, zero calories and no autophagy disruption.',
    ketoSafe: true,
    name: 'Eletrólitos / Sais Minerais',
    nameEn: 'Electrolytes / Mineral Salts',
    pattern: /\b(eletr[oó]litos?|magn[eé]sio|pot[aá]ssio|s[oó]dio|cloreto|sal\s+marinho|sal\s+rosa)\b/i,
  },
];

/**
 * Analisa uma descrição ou imagem de alimento, refeição, suplemento ou bebida para diagnosticar quebra de jejum.
 */
export function analyzeFastingBreak(input: AnalyzeFastingBreakInput): FastingBreakAnalysis {
  const text = (input.description || '').trim();
  const lower = text.toLowerCase();

  // 1. Sanitizar negações de ingredientes ("sem açúcar", "zero açúcar", "sem leite", "sem calorias")
  const sanitizedForSugar = lower.replace(
    /\b(sem|zero|sem\s+adi[cç][aã]o\s+de|no|sugar[\s-]free)\s+(a[cç][uú]car|leite|calorias?|hidratos?)\b/gi,
    '',
  );

  // 2. Avaliar regras de alimentos e ingredientes
  const matchedRules: IngredientRule[] = [];
  for (const rule of INGREDIENT_RULES) {
    const textToTest = rule.name.includes('Açúcar') ? sanitizedForSugar : lower;
    if (rule.pattern.test(textToTest)) {
      matchedRules.push(rule);
    }
  }

  // Se detetar regras específicas
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
      productName: text || 'Alimento / Refeição',
      sensitiveIngredients,
      verdictTitle,
      verdictTitleEn,
    };
  }

  // 3. Caso: Bebidas e infusões limpas (Café preto, chá, água pura)
  const isCoffeeOrTeaOrWater = /\b(caf[eé]|ch[aá]|[aá]gua|water|espresso|expresso|americano)\b/i.test(lower);
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
  if (/\b(zero|light|diet|coca\s*zero|pepsi\s*zero|monster\s*ultra)\b/i.test(lower)) {
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

  // 5. Fallback prudente para alimentos ou entradas não identificadas
  return {
    autophagyDisrupted: true,
    breaksFasting: true,
    confidence: 'medium',
    explanation: 'Alimento ou bebida com calorias: qualquer consumo de macronutrientes interrompe o jejum metabólico e a autofagia. Apenas água, café preto ou chá sem açúcar mantêm o jejum intacto.',
    explanationEn: 'Food or caloric drink: any macronutrient intake ends the metabolic fast and autophagy. Only water, black coffee, or plain tea preserve fasting.',
    impact: 'metabolic_break',
    ketoSafe: false,
    productName: text || 'Alimento / Refeição',
    sensitiveIngredients: ['Calorias / Macronutrientes'],
    verdictTitle: 'Interrompe o Jejum',
    verdictTitleEn: 'Breaks Fasting',
  };
}

