export interface SymptomDefinition {
  description: string;
  icon: string;
  key: string;
  label: string;
}

export const SYMPTOM_DEFINITIONS: Record<string, SymptomDefinition> = {
  hunger_peak: {
    description:
      'Pico temporário associado a pulsos circadianos da hormona grelina. Tende a atenuar-se de forma espontânea após 20 a 30 minutos.',
    icon: 'restaurant-outline',
    key: 'hunger_peak',
    label: 'Pico de Fome (Grelina)',
  },
  mental_clarity: {
    description:
      'Sensação de foco e nitidez cognitiva associada à transição para utilização de corpos cetónicos pelo sistema nervoso central.',
    icon: 'bulb-outline',
    key: 'mental_clarity',
    label: 'Clareza Mental & Foco',
  },
  high_energy: {
    description:
      'Nível de energia estável derivado da queima contínua de ácidos gordos, sem as oscilações típicas da digestão pesada.',
    icon: 'flash-outline',
    key: 'high_energy',
    label: 'Energia Estável',
  },
  headache_electrolytes: {
    description:
      'Cefaleia ligeira de transição, frequentemente ligada à excreção rápida de água e eletrólitos (sódio/magnésio) nas primeiras horas.',
    icon: 'water-outline',
    key: 'headache_electrolytes',
    label: 'Cefaleia / Eletrólitos',
  },
  fatigue: {
    description:
      'Sensação de cansaço passageiro que coincide com o esgotamento das reservas hepáticas de glicogénio antes da cetose.',
    icon: 'battery-dead-outline',
    key: 'fatigue',
    label: 'Fadiga Muscular',
  },
  calm: {
    description:
      'Sensação de serenidade e redução de ansiedade relacionada com a estabilidade dos níveis basais de insulina.',
    icon: 'leaf-outline',
    key: 'calm',
    label: 'Tranquilidade & Calma',
  },
};

export function getSymptomDefinition(key: string): SymptomDefinition {
  return (
    SYMPTOM_DEFINITIONS[key] ?? {
      description: 'Registo informativo de sensação durante o período de jejum.',
      icon: 'information-circle-outline',
      key,
      label: 'Sensação Registada',
    }
  );
}
