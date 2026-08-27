import { parseMealAnalysis } from '@/services/aiMealService';

describe('aiMealService - Cálculos Nutricionais e Calorias Realistas', () => {
  it('calcula calorias com precisão biológica através dos macronutrientes (4*P + 4*C + 9*G)', () => {
    const rawAnalysis = {
      confidence: 'high',
      dish_name: 'Salmão com arroz e brócolos',
      estimated_calories: 500, // Número redondo genérico
      macros: {
        carbs_g: 46,
        fat_g: 19,
        protein_g: 34,
      },
      tags: ['Proteico'],
    };

    const parsed = parseMealAnalysis(rawAnalysis);

    // 34*4 (136) + 46*4 (184) + 19*9 (171) = 491
    expect(parsed.estimated_calories).toBe(491);
    expect(parsed.macros.protein_g).toBe(34);
    expect(parsed.macros.carbs_g).toBe(46);
    expect(parsed.macros.fat_g).toBe(19);
    expect(Number.isInteger(parsed.estimated_calories)).toBe(true);
  });

  it('arredonda macronutrientes com decimais para inteiros limpos', () => {
    const rawAnalysis = {
      confidence: 'medium',
      dish_name: 'Omelete de claras e aveia',
      estimated_calories: 380,
      macros: {
        carbs_g: 29.8,
        fat_g: 11.2,
        protein_g: 27.6,
      },
      tags: ['Equilibrado'],
    };

    const parsed = parseMealAnalysis(rawAnalysis);

    expect(parsed.macros.protein_g).toBe(28);
    expect(parsed.macros.carbs_g).toBe(30);
    expect(parsed.macros.fat_g).toBe(11);
    // 28*4 + 30*4 + 11*9 = 112 + 120 + 99 = 331
    expect(parsed.estimated_calories).toBe(331);
  });
});
