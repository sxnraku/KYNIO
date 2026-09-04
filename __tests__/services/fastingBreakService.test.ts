import { analyzeFastingBreak } from '@/services/fastingBreakService';

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
});
