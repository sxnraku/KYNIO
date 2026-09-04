import { calculateSatiety } from '@/services/satietyService';

describe('satietyService', () => {
  const fixedBaseDate = new Date('2026-09-04T12:00:00Z');

  it('classifica refeição rica em proteína e fibra como alta saciedade e prevê ~4-5h', () => {
    const result = calculateSatiety({
      baseDate: fixedBaseDate,
      calories: 550,
      macros: {
        carbs_g: 35,
        fat_g: 18,
        protein_g: 38,
      },
      tags: ['Proteico', 'Rico em Fibra', 'Legumes'],
    });

    expect(result.level).toBe('high');
    expect(result.numericScore).toBeGreaterThanOrEqual(68);
    expect(result.hoursOfSatiety).toBeGreaterThanOrEqual(4.0);
    expect(result.dominantFactor).toContain('fibra e proteína');
  });

  it('classifica snack simples ou baixo em proteína como saciedade baixa', () => {
    const result = calculateSatiety({
      baseDate: fixedBaseDate,
      calories: 140,
      macros: {
        carbs_g: 28,
        fat_g: 2,
        protein_g: 3,
      },
      tags: ['Fruta'],
    });

    expect(result.level).toBe('low');
    expect(result.numericScore).toBeLessThan(45);
    expect(result.hoursOfSatiety).toBeLessThanOrEqual(2.0);
  });

  it('classifica refeição padrão como moderada com janela proporcional', () => {
    const result = calculateSatiety({
      baseDate: fixedBaseDate,
      calories: 420,
      macros: {
        carbs_g: 45,
        fat_g: 14,
        protein_g: 20,
      },
      tags: [],
    });

    expect(result.level).toBe('moderate');
    expect(result.hoursOfSatiety).toBeGreaterThanOrEqual(3.0);
    expect(typeof result.estimatedFullUntilTime).toBe('string');
    expect(result.estimatedFullUntilTime).toMatch(/^\d{2}:\d{2}$/);
  });

  it('refeição cetogénica com alto teor lipídico retarda esvaziamento gástrico', () => {
    const result = calculateSatiety({
      baseDate: fixedBaseDate,
      calories: 480,
      macros: {
        carbs_g: 8,
        fat_g: 32,
        protein_g: 22,
      },
      tags: ['Keto'],
    });

    expect(result.dominantFactor).toContain('Perfil cetogénico');
    expect(result.hoursOfSatiety).toBeGreaterThanOrEqual(3.0);
  });
});
