import { generateClinicalReportHtml } from '@/services/healthReportPdfService';

jest.mock('@/services/dbService', () => ({
  getFastRecords: jest.fn().mockResolvedValue([
    {
      completed: true,
      endTime: Date.now(),
      id: 1,
      startTime: Date.now() - 16 * 60 * 60 * 1000,
      targetHours: 16,
      xpEarned: 50,
    },
  ]),
  getMealRecords: jest.fn().mockResolvedValue([
    {
      carbsGrams: 40,
      estimatedCalories: 500,
      fatGrams: 15,
      id: 1,
      proteinGrams: 35,
      timestamp: Date.now(),
    },
  ]),
  getUserProfile: jest.fn().mockResolvedValue({
    displayName: 'Test User',
    id: 1,
  }),
  getWeightEntries: jest.fn().mockResolvedValue([
    {
      id: 1,
      timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
      weightGrams: 75000,
    },
    {
      id: 2,
      timestamp: Date.now(),
      weightGrams: 74200,
    },
  ]),
}));

describe('healthReportPdfService', () => {
  it('gera HTML clínico completo com dados de jejum, peso e macronutrientes', async () => {
    const html = await generateClinicalReportHtml('pt');

    expect(html).toContain('KYNIO');
    expect(html).toContain('Relatório Clínico de Hábitos & Jejum');
    expect(html).toContain('Prática de Jejum Intermitente');
    expect(html).toContain('Evolução Ponderal (Peso Corporal)');
    expect(html).toContain('Nutrição & Distribuição de Macronutrientes');
    expect(html).toContain('Nota de Registo Informativo');
    expect(html).toContain('74.2 kg');
    expect(html).toContain('35g');
  });

  it('suporta geração em inglês', async () => {
    const html = await generateClinicalReportHtml('en');

    expect(html).toContain('Clinical Habit & Fasting Report');
    expect(html).toContain('Body Weight Trend');
    expect(html).toContain('Informational Log Notice');
  });
});
