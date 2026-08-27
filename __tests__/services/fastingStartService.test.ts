import {
  formatFastingStartDate,
  formatFastingStartDateEntry,
  formatFastingStartTime,
  formatFastingStartTimeEntry,
  parseFastingStartDateTime,
} from '@/services/fastingStartService';

const NOW = new Date(2026, 7, 24, 14, 30, 0, 0).getTime();

describe('fastingStartService', () => {
  it('converte uma data e hora locais válidas num timestamp', () => {
    const timestamp = new Date(2026, 7, 24, 8, 15, 0, 0).getTime();

    expect(parseFastingStartDateTime('24/08/2026', '08:15', NOW)).toEqual({
      error: null,
      timestamp,
    });
    expect(formatFastingStartDate(timestamp)).toBe('24/08/2026');
    expect(formatFastingStartTime(timestamp)).toBe('08:15');
  });

  it('insere automaticamente os separadores durante a escrita', () => {
    expect(formatFastingStartDateEntry('24082026')).toBe('24/08/2026');
    expect(formatFastingStartTimeEntry('0815')).toBe('08:15');
  });

  it('rejeita datas impossíveis', () => {
    expect(parseFastingStartDateTime('31/02/2026', '08:15', NOW)).toEqual({
      error: 'invalid-date',
      timestamp: null,
    });
  });

  it('formata strings curtas ou incompletas corretamente', () => {
    expect(formatFastingStartDateEntry('2')).toBe('2');
    expect(formatFastingStartDateEntry('240')).toBe('24/0');
    expect(formatFastingStartTimeEntry('0')).toBe('0');
    expect(formatFastingStartTimeEntry('081')).toBe('08:1');
  });

  it('rejeita formatos inválidos de data e hora', () => {
    expect(parseFastingStartDateTime('invalido', '08:15', NOW)).toEqual({
      error: 'invalid-date',
      timestamp: null,
    });
    expect(parseFastingStartDateTime('24/08/2026', 'invalido', NOW)).toEqual({
      error: 'invalid-time',
      timestamp: null,
    });
    expect(parseFastingStartDateTime('24/08/2026', '25:00', NOW)).toEqual({
      error: 'invalid-time',
      timestamp: null,
    });
    expect(parseFastingStartDateTime('24/08/2026', '12:65', NOW)).toEqual({
      error: 'invalid-time',
      timestamp: null,
    });
  });
});

