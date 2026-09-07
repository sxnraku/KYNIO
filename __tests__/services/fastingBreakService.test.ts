import {
  analyzeFastingBreak,
  analyzeFastingBreakFromMeal,
} from '@/services/fastingBreakService';


describe('fastingBreakService', () => {
  it('identifica café preto puro como seguro para jejum, cetose e autofagia', () => {
    const result = analyzeFastingBreak({
      description: 'Café expresso preto sem açúcar',
    });

    expect(result.breaksFasting).toBe(false);
    expect(result.impact).toBe('clean');
    expect(result.ketoSafe).toBe(true);
    expect(result.autophagyDisrupted).toBe(false);
    expect(result.verdictTitle).toContain('Seguro');
  });

  it('deteta maltodextrina como quebra de jejum metabólico e interrupção de autofagia', () => {
    const result = analyzeFastingBreak({
      description: 'Suplemento pré-treino com maltodextrina e cafeína',
    });

    expect(result.breaksFasting).toBe(true);
    expect(result.impact).toBe('metabolic_break');
    expect(result.autophagyDisrupted).toBe(true);
    expect(result.sensitiveIngredients).toContain('Maltodextrina');
    expect(result.explanation).toContain('maltodextrina');
  });

  it('deteta BCAAs como mantendo cetose mas interrompendo autofagia (via mTOR)', () => {
    const result = analyzeFastingBreak({
      description: 'BCAA em pó sabor limão com leucina',
    });

    expect(result.breaksFasting).toBe(true);
    expect(result.autophagyDisrupted).toBe(true);
    expect(result.ketoSafe).toBe(true);
    expect(result.sensitiveIngredients.some((i) => i.includes('BCAA'))).toBe(true);
  });

  it('deteta refrigerante zero com sucralose/aspartame como seguro para cetose e jejum calórico', () => {
    const result = analyzeFastingBreak({
      description: 'Coca-Cola Zero com aspartame e acessulfame K',
    });

    expect(result.breaksFasting).toBe(false);
    expect(result.ketoSafe).toBe(true);
  });

  it('deteta eletrólitos e sais minerais puros como 100% seguros', () => {
    const result = analyzeFastingBreak({
      description: 'Eletrólitos em pó com magnésio, potássio e sódio',
    });

    expect(result.breaksFasting).toBe(false);
    expect(result.autophagyDisrupted).toBe(false);
    expect(result.impact).toBe('clean');
  });

  it('deteta pão integral como quebra direta de jejum metabólico, pico de insulina e fim de autofagia', () => {
    const result = analyzeFastingBreak({
      description: 'pão integral , ém um apo nao a bebida',
    });

    expect(result.breaksFasting).toBe(true);
    expect(result.autophagyDisrupted).toBe(true);
    expect(result.ketoSafe).toBe(false);
    expect(result.impact).toBe('metabolic_break');
    expect(result.verdictTitle).toBe('Interrompe o Jejum');
    expect(result.sensitiveIngredients).toContain('Pão / Cereais / Amidos');
  });

  it('deteta alimentos sólidos e refeições gerais como quebra de jejum', () => {
    const riceTest = analyzeFastingBreak({ description: 'arroz com frango grelhado' });
    expect(riceTest.breaksFasting).toBe(true);
    expect(riceTest.autophagyDisrupted).toBe(true);
    expect(riceTest.impact).toBe('metabolic_break');

    const appleTest = analyzeFastingBreak({ description: '1 maçã' });
    expect(appleTest.breaksFasting).toBe(true);
    expect(appleTest.autophagyDisrupted).toBe(true);

    const unknownMeal = analyzeFastingBreak({ description: 'lasanha de cogumelos' });
    expect(unknownMeal.breaksFasting).toBe(true);
    expect(unknownMeal.impact).toBe('metabolic_break');
  });

  describe('analyzeFastingBreakFromMeal (análise via IA)', () => {
    it('avalia refeição rica em hidratos (pão integral) via IA com quebra de jejum e explicação precisa', () => {
      const result = analyzeFastingBreakFromMeal({
        confidence: 'high',
        dish_name: 'Pão Integral com Queijo Fresco',
        estimated_calories: 220,
        macros: { carbs_g: 32, fat_g: 4, protein_g: 12 },
        tags: ['Pequeno-almoço', 'Cereais'],
      });

      expect(result.breaksFasting).toBe(true);
      expect(result.autophagyDisrupted).toBe(true);
      expect(result.ketoSafe).toBe(false);
      expect(result.impact).toBe('metabolic_break');
      expect(result.verdictTitle).toBe('Interrompe o Jejum');
      expect(result.productName).toBe('Pão Integral com Queijo Fresco');
      expect(result.explanation).toContain('220 kcal');
      expect(result.explanation).toContain('32g de hidratos');
      expect(result.macros?.carbs_g).toBe(32);
    });

    it('avalia bebida acalórica analisada pela IA como totalmente limpa', () => {
      const result = analyzeFastingBreakFromMeal({
        confidence: 'high',
        dish_name: 'Café Expresso Longo',
        estimated_calories: 3,
        macros: { carbs_g: 0, fat_g: 0, protein_g: 0 },
        tags: ['Bebida', 'Sem Calorias'],
      });

      expect(result.breaksFasting).toBe(false);
      expect(result.autophagyDisrupted).toBe(false);
      expect(result.ketoSafe).toBe(true);
      expect(result.impact).toBe('clean');
      expect(result.verdictTitle).toContain('Seguro');
      expect(result.explanation).toContain('Café Expresso Longo');
    });

    it('avalia gordura pura (café com óleo MCT) como preservando cetose mas pausando autofagia', () => {
      const result = analyzeFastingBreakFromMeal({
        confidence: 'high',
        dish_name: 'Bulletproof Coffee com MCT',
        estimated_calories: 130,
        macros: { carbs_g: 0, fat_g: 14, protein_g: 0 },
        tags: ['Keto'],
      });

      expect(result.breaksFasting).toBe(false);
      expect(result.autophagyDisrupted).toBe(true);
      expect(result.ketoSafe).toBe(true);
      expect(result.impact).toBe('autophagy_break');
      expect(result.verdictTitle).toBe('Pausa a Autofagia');
    });
  });
});

