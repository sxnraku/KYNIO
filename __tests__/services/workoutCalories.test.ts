import { estimateCalories, WORKOUT_METS } from '@/types/workout';

describe('estimateCalories', () => {
  it('calcula calorias com base no peso padrão de 70 kg quando nenhum peso é fornecido', () => {
    // Corrida moderada: MET 9.8, 60 min, 70 kg -> 9.8 * 70 * 1 = 686 kcal
    const calories = estimateCalories('run', 60, 'moderate');
    expect(calories).toBe(686);
  });

  it('calcula calorias com maior precisão quando o peso do utilizador é fornecido', () => {
    // Corrida moderada: MET 9.8, 60 min, 85 kg -> 9.8 * 85 * 1 = 833 kcal
    const calories = estimateCalories('run', 60, 'moderate', 85);
    expect(calories).toBe(833);

    // Corrida moderada: MET 9.8, 60 min, 60 kg -> 9.8 * 60 * 1 = 588 kcal
    const caloriesLighter = estimateCalories('run', 60, 'moderate', 60);
    expect(caloriesLighter).toBe(588);
  });

  it('calcula para caminhada leve e intensa proporcionalmente à duração', () => {
    // Caminhada leve (MET 2.8), 30 min (0.5h), 70kg -> 2.8 * 70 * 0.5 = 98 kcal
    expect(estimateCalories('walk', 30, 'light', 70)).toBe(98);

    // Caminhada intensa (MET 5.0), 30 min (0.5h), 70kg -> 5.0 * 70 * 0.5 = 175 kcal
    expect(estimateCalories('walk', 30, 'intense', 70)).toBe(175);
  });

  it('retorna null para durações inválidas ou tipos inexistentes', () => {
    expect(estimateCalories('run', 0, 'moderate')).toBeNull();
    expect(estimateCalories('run', -15, 'moderate')).toBeNull();
    expect(estimateCalories('invalid_sport', 30, 'moderate')).toBeNull();
  });

  it('usa fallback de 70 kg para pesos fora dos limites normais', () => {
    // Menor que 25 kg ou maior que 300 kg usa 70 kg
    const normal = estimateCalories('cycling', 30, 'moderate', 70);
    const belowMin = estimateCalories('cycling', 30, 'moderate', 10);
    const aboveMax = estimateCalories('cycling', 30, 'moderate', 400);

    expect(belowMin).toBe(normal);
    expect(aboveMax).toBe(normal);
  });
});
