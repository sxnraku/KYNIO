import { calculateSolarCycle } from '@/services/solarCycleService';

describe('solarCycleService', () => {
  it('calcula o ciclo solar com horários válidos no formato HH:MM', () => {
    const referenceDate = new Date('2026-06-21T12:00:00Z'); // Solstício de verão
    const result = calculateSolarCycle(referenceDate, 'pt');

    expect(result.sunrise).toMatch(/^\d{2}:\d{2}$/);
    expect(result.sunset).toMatch(/^\d{2}:\d{2}$/);
    expect(result.solarNoon).toMatch(/^\d{2}:\d{2}$/);
    expect(result.daylightDurationHours).toBeGreaterThan(8);
    expect(result.daylightDurationHours).toBeLessThan(18);
    expect(result.sunriseTimestamp).toBeLessThan(result.sunsetTimestamp);
  });

  it('determina corretamente daylight e progress durante o meio-dia', () => {
    // Definir referência para o meio-dia local
    const midday = new Date();
    midday.setHours(13, 0, 0, 0);

    const result = calculateSolarCycle(midday, 'pt');

    if (result.isDaylight) {
      expect(result.daylightProgress).toBeGreaterThan(0);
      expect(result.daylightProgress).toBeLessThanOrEqual(1);
    }
  });

  it('identifica a fase de noite circadiana durante a madrugada', () => {
    const nightTime = new Date();
    nightTime.setHours(2, 30, 0, 0);

    const result = calculateSolarCycle(nightTime, 'pt');
    expect(result.isDaylight).toBe(false);
    expect(result.daylightProgress).toBe(0);
    expect(result.phase).toBe('circadian_night');
    expect(result.phaseLabel).toBe('Noite Circadiana');
  });

  it('suporta idioma inglês em phaseLabel e circadianTip', () => {
    const midday = new Date();
    midday.setHours(12, 0, 0, 0);

    const result = calculateSolarCycle(midday, 'en');
    expect(result.circadianTip).toBeDefined();
    expect(result.phaseLabel).toBeDefined();
    expect(typeof result.phaseLabel).toBe('string');
  });
});
