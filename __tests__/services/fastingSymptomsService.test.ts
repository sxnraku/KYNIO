import {
  getSymptomDefinition,
  SYMPTOM_DEFINITIONS,
} from '@/services/fastingSymptomsService';

describe('fastingSymptomsService', () => {
  it('contém todas as definições essenciais de sintomas com explicações biológicas', () => {
    expect(SYMPTOM_DEFINITIONS.hunger_peak).toBeDefined();
    expect(SYMPTOM_DEFINITIONS.hunger_peak.description).toContain('grelina');

    expect(SYMPTOM_DEFINITIONS.mental_clarity).toBeDefined();
    expect(SYMPTOM_DEFINITIONS.mental_clarity.description).toContain('cetónicos');

    expect(SYMPTOM_DEFINITIONS.headache_electrolytes).toBeDefined();
    expect(SYMPTOM_DEFINITIONS.headache_electrolytes.description).toContain('eletrólitos');
  });

  it('retorna a definição correta quando a chave existe', () => {
    const symptom = getSymptomDefinition('high_energy');
    expect(symptom.key).toBe('high_energy');
    expect(symptom.label).toBe('Energia Estável');
    expect(symptom.icon).toBe('flash-outline');
  });

  it('retorna fallback neutro quando a chave é desconhecida', () => {
    const fallback = getSymptomDefinition('desconhecido');
    expect(fallback.key).toBe('desconhecido');
    expect(fallback.label).toBe('Sensação Registada');
  });
});
